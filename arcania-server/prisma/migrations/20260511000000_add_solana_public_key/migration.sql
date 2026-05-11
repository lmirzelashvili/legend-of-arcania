-- Add Solana wallet fields to User model
ALTER TABLE "User" ADD COLUMN "solanaPublicKey" TEXT;
ALTER TABLE "User" ADD COLUMN "solanaLinkedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_solanaPublicKey_key" ON "User"("solanaPublicKey");
