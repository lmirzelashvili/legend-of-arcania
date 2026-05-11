import {
  PublicKey,
  Transaction,
  ComputeBudgetProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  TokenAccountNotFoundError,
} from '@solana/spl-token';
import prisma from '../../config/db.js';
import { logger } from '../../config/logger.js';
import { arcConfig } from '../../config/arc.js';
import { getConnection } from './connection.js';
import { getHotWalletKeypair } from './hd.js';

export type WithdrawError =
  | 'invalid_destination'
  | 'amount_too_small'
  | 'insufficient_user_balance'
  | 'hot_wallet_insufficient'
  | 'exceeds_hot_wallet_cap'
  | 'send_failed';

export interface WithdrawResult {
  ok: boolean;
  error?: WithdrawError;
  errorDetail?: string;
  signature?: string;
  transactionId?: string;
}

export async function getHotWalletBalance(): Promise<bigint> {
  const hot = getHotWalletKeypair().publicKey;
  const ata = await getAssociatedTokenAddress(arcConfig.mint, hot, true);
  try {
    const acc = await getAccount(getConnection(), ata, 'confirmed');
    return acc.amount;
  } catch (err) {
    if (err instanceof TokenAccountNotFoundError) return 0n;
    throw err;
  }
}

export async function withdraw(
  userId: string,
  amountRaw: bigint,
  destinationBase58: string,
): Promise<WithdrawResult> {
  if (amountRaw <= 0n) return { ok: false, error: 'amount_too_small' };
  if (amountRaw < arcConfig.minWithdrawRaw) return { ok: false, error: 'amount_too_small' };

  let destination: PublicKey;
  try {
    destination = new PublicKey(destinationBase58);
  } catch {
    return { ok: false, error: 'invalid_destination' };
  }

  if (amountRaw > arcConfig.hotWalletCapRaw) {
    return { ok: false, error: 'exceeds_hot_wallet_cap' };
  }

  const hotBalance = await getHotWalletBalance();
  if (hotBalance < amountRaw) {
    return { ok: false, error: 'hot_wallet_insufficient' };
  }

  const decrement = await prisma.arcWallet.updateMany({
    where: { userId, balance: { gte: amountRaw } },
    data: { balance: { decrement: amountRaw } },
  });
  if (decrement.count !== 1) {
    return { ok: false, error: 'insufficient_user_balance' };
  }

  const pending = await prisma.arcTransaction.create({
    data: {
      userId,
      type: 'WITHDRAW',
      status: 'PENDING',
      amount: amountRaw,
      destination: destination.toBase58(),
    },
  });

  try {
    const conn = getConnection();
    const hot = getHotWalletKeypair();
    const hotAta = await getAssociatedTokenAddress(arcConfig.mint, hot.publicKey, true);
    const destAta = await getAssociatedTokenAddress(arcConfig.mint, destination, true);

    const ixs = [ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 })];

    const destInfo = await conn.getAccountInfo(destAta);
    if (!destInfo) {
      ixs.push(
        createAssociatedTokenAccountInstruction(
          hot.publicKey,
          destAta,
          destination,
          arcConfig.mint,
        ),
      );
    }

    ixs.push(
      createTransferCheckedInstruction(
        hotAta,
        arcConfig.mint,
        destAta,
        hot.publicKey,
        amountRaw,
        arcConfig.decimals,
      ),
    );

    const tx = new Transaction().add(...ixs);
    tx.feePayer = hot.publicKey;
    const sig = await sendAndConfirmTransaction(conn, tx, [hot], { commitment: 'confirmed' });

    await prisma.arcTransaction.update({
      where: { id: pending.id },
      data: { status: 'CONFIRMED', txSignature: sig },
    });

    logger.info({ userId, amount: amountRaw.toString(), destination: destination.toBase58(), sig }, 'ARC withdraw confirmed');
    return { ok: true, signature: sig, transactionId: pending.id };
  } catch (err) {
    const message = (err as Error).message ?? String(err);
    await prisma.$transaction([
      prisma.arcTransaction.update({
        where: { id: pending.id },
        data: { status: 'FAILED', error: message.slice(0, 500) },
      }),
      prisma.arcWallet.update({
        where: { userId },
        data: { balance: { increment: amountRaw } },
      }),
    ]);
    logger.error({ userId, err: message }, 'ARC withdraw send failed; balance refunded');
    return { ok: false, error: 'send_failed', errorDetail: message };
  }
}
