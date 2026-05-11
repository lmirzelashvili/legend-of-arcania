import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  createCloseAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
} from '@solana/spl-token';
import prisma from '../../config/db.js';
import { logger } from '../../config/logger.js';
import { arcConfig } from '../../config/arc.js';
import { getConnection } from './connection.js';
import { deriveUserKeypair, getHotWalletKeypair } from './hd.js';

const FEE_TOPUP_LAMPORTS = 5_000_000; // ~0.005 SOL — enough to create ATA + transfer + close

export interface SweepResult {
  swept: boolean;
  amount: bigint;
  signature?: string;
  reason?: string;
}

export async function getDepositAddressFor(userId: string): Promise<string> {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { arcDepositAddress: true },
  });
  if (existing?.arcDepositAddress) return existing.arcDepositAddress;

  const pubkey = deriveUserKeypair(userId).publicKey.toBase58();
  await prisma.user.update({
    where: { id: userId },
    data: { arcDepositAddress: pubkey },
  });
  return pubkey;
}

async function readDepositAtaBalance(depositOwner: PublicKey): Promise<bigint> {
  const ata = await getAssociatedTokenAddress(arcConfig.mint, depositOwner, true);
  try {
    const acc = await getAccount(getConnection(), ata, 'confirmed');
    return acc.amount;
  } catch (err) {
    if (err instanceof TokenAccountNotFoundError) return 0n;
    throw err;
  }
}

export async function checkAndSweepUser(userId: string): Promise<SweepResult> {
  const conn = getConnection();
  const depositKeypair = deriveUserKeypair(userId);
  const depositOwner = depositKeypair.publicKey;
  const hotWallet = getHotWalletKeypair();

  const amount = await readDepositAtaBalance(depositOwner);
  if (amount === 0n) {
    return { swept: false, amount: 0n, reason: 'no_balance' };
  }

  const depositAta = await getAssociatedTokenAddress(arcConfig.mint, depositOwner, true);
  const hotAta = await getAssociatedTokenAddress(arcConfig.mint, hotWallet.publicKey, true);

  let pending = await prisma.arcTransaction.findFirst({
    where: { userId, type: 'DEPOSIT', status: 'PENDING' },
  });
  if (!pending) {
    pending = await prisma.arcTransaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        status: 'PENDING',
        amount,
        source: depositOwner.toBase58(),
      },
    });
  }

  try {
    const ixs = [
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 }),
      SystemProgram.transfer({
        fromPubkey: hotWallet.publicKey,
        toPubkey: depositOwner,
        lamports: FEE_TOPUP_LAMPORTS,
      }),
    ];

    const hotAtaInfo = await conn.getAccountInfo(hotAta);
    if (!hotAtaInfo) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          hotWallet.publicKey,
          hotAta,
          hotWallet.publicKey,
          arcConfig.mint,
        ),
      );
    }

    ixs.push(
      createTransferCheckedInstruction(
        depositAta,
        arcConfig.mint,
        hotAta,
        depositOwner,
        amount,
        arcConfig.decimals,
      ),
      createCloseAccountInstruction(depositAta, hotWallet.publicKey, depositOwner),
    );

    const tx = new Transaction().add(...ixs);
    tx.feePayer = hotWallet.publicKey;
    const sig = await sendAndConfirmTransaction(conn, tx, [hotWallet, depositKeypair], {
      commitment: 'confirmed',
    });

    await prisma.$transaction([
      prisma.arcTransaction.update({
        where: { id: pending.id },
        data: { status: 'CONFIRMED', txSignature: sig, amount },
      }),
      prisma.arcWallet.upsert({
        where: { userId },
        create: { userId, balance: amount },
        update: { balance: { increment: amount } },
      }),
    ]);

    logger.info({ userId, amount: amount.toString(), sig }, 'ARC deposit swept and credited');
    return { swept: true, amount, signature: sig };
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    await prisma.arcTransaction.update({
      where: { id: pending.id },
      data: { status: 'FAILED', error: message.slice(0, 500) },
    });
    logger.error({ userId, err: message }, 'ARC deposit sweep failed');
    return { swept: false, amount, reason: 'sweep_error' };
  }
}

export async function sweepAllActive(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { arcDepositAddress: { not: null } },
    select: { id: true },
  });
  for (const u of users) {
    try {
      await checkAndSweepUser(u.id);
    } catch (err) {
      logger.error({ userId: u.id, err }, 'sweepAllActive: error per user');
    }
  }
}
