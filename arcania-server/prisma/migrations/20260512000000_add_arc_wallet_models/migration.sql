-- Add ARC custodial wallet models (deposit / withdraw integration)

-- Enums for ArcTransaction
CREATE TYPE "ArcTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW');
CREATE TYPE "ArcTransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED');

-- ArcWallet: one custodial balance per user
CREATE TABLE "ArcWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArcWallet_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArcWallet_userId_key" ON "ArcWallet"("userId");
ALTER TABLE "ArcWallet"
    ADD CONSTRAINT "ArcWallet_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ArcTransaction: deposit + withdraw history
CREATE TABLE "ArcTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ArcTransactionType" NOT NULL,
    "status" "ArcTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" BIGINT NOT NULL,
    "txSignature" TEXT,
    "destination" TEXT,
    "source" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ArcTransaction_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ArcTransaction_txSignature_key" ON "ArcTransaction"("txSignature");
CREATE INDEX "ArcTransaction_userId_createdAt_idx" ON "ArcTransaction"("userId", "createdAt");
CREATE INDEX "ArcTransaction_status_idx" ON "ArcTransaction"("status");
ALTER TABLE "ArcTransaction"
    ADD CONSTRAINT "ArcTransaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
