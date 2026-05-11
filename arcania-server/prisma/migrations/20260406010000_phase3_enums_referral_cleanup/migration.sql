-- Phase 3: Create enums
CREATE TYPE "Race" AS ENUM ('HUMAN', 'LUMINAR', 'LILIN', 'DARKAN');
CREATE TYPE "CharacterClass" AS ENUM ('PALADIN', 'FIGHTER', 'RANGER', 'CLERIC', 'MAGE');
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- Phase 3: Convert Character columns from TEXT to enum (safe ALTER TYPE, no data loss)
ALTER TABLE "Character" ALTER COLUMN "race" TYPE "Race" USING "race"::"Race";
ALTER TABLE "Character" ALTER COLUMN "class" TYPE "CharacterClass" USING "class"::"CharacterClass";
ALTER TABLE "Character" ALTER COLUMN "gender" TYPE "Gender" USING "gender"::"Gender";
ALTER TABLE "Character" ALTER COLUMN "gender" SET DEFAULT 'MALE';

-- Phase 3: Normalize Referral — drop JSON array, create relation table
ALTER TABLE "Referral" DROP COLUMN "referredUsers";

CREATE TABLE "ReferralUse" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralUse_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ReferralUse_referralId_idx" ON "ReferralUse"("referralId");
CREATE INDEX "ReferralUse_userId_idx" ON "ReferralUse"("userId");
CREATE UNIQUE INDEX "ReferralUse_referralId_userId_key" ON "ReferralUse"("referralId", "userId");

ALTER TABLE "ReferralUse" ADD CONSTRAINT "ReferralUse_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReferralUse" ADD CONSTRAINT "ReferralUse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Phase 2 cleanup: drop DEFAULT on @updatedAt columns (Prisma manages these at client level)
ALTER TABLE "AccountWallet" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "BattlePassSeason" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "FriendRequest" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Friendship" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "GemTemplate" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "MarketplaceListing" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "PlayerBattlePassProgress" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "PlayerQuest" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "PremiumSubscription" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "PvPStats" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "QuestDefinition" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "Referral" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "SetBonus" ALTER COLUMN "updatedAt" DROP DEFAULT;
ALTER TABLE "TradeOffer" ALTER COLUMN "updatedAt" DROP DEFAULT;
