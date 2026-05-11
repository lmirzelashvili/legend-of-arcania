-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "race" TEXT NOT NULL,
    "class" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "primaryStats" JSONB NOT NULL,
    "derivedStats" JSONB NOT NULL,
    "resources" JSONB NOT NULL,
    "position" JSONB,
    "unspentStatPoints" INTEGER NOT NULL DEFAULT 10,
    "abilityPoints" INTEGER NOT NULL DEFAULT 0,
    "hasBattlePass" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EquipmentSlotRow" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemData" JSONB NOT NULL,

    CONSTRAINT "EquipmentSlotRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemData" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "gridX" INTEGER NOT NULL,
    "gridY" INTEGER NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "isPrestige" BOOLEAN NOT NULL DEFAULT false,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredClass" TEXT,
    "equipmentSlot" TEXT,
    "stats" JSONB NOT NULL,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "sellPrice" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAbility" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "abilityData" JSONB NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CharacterAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketplaceListing" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemData" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "sellerName" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'npc',
    "listedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketplaceListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vault" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'BASE',
    "maxSlots" INTEGER NOT NULL DEFAULT 100,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "arcanite" INTEGER NOT NULL DEFAULT 0,
    "purchasedExpandedAt" TIMESTAMP(3),
    "purchasedPremiumAt" TIMESTAMP(3),

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VaultItem" (
    "id" TEXT NOT NULL,
    "vaultId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemData" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "depositedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "depositedBy" TEXT NOT NULL,

    CONSTRAINT "VaultItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestDefinition" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "targetProgress" INTEGER NOT NULL,
    "reward" JSONB NOT NULL,
    "unlockLevel" INTEGER,
    "prerequisiteQuestId" TEXT,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "resetPeriod" TEXT,
    "trackingKey" TEXT NOT NULL,

    CONSTRAINT "QuestDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerQuest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "PlayerQuest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountWallet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "arcanite" INTEGER NOT NULL DEFAULT 0,
    "creationTokens" INTEGER NOT NULL DEFAULT 1,
    "spinsRemaining" INTEGER NOT NULL DEFAULT 3,
    "lastSpinReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountWallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginStreak" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastLoginDate" TEXT,

    CONSTRAINT "LoginStreak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "referralCode" TEXT NOT NULL,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "commissionEarned" INTEGER NOT NULL DEFAULT 0,
    "referredBy" TEXT,
    "referredUsers" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Character_userId_idx" ON "Character"("userId");

-- CreateIndex
CREATE INDEX "EquipmentSlotRow_characterId_idx" ON "EquipmentSlotRow"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "EquipmentSlotRow_characterId_slot_key" ON "EquipmentSlotRow"("characterId", "slot");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_idx" ON "InventoryItem"("characterId");

-- CreateIndex
CREATE INDEX "Item_type_idx" ON "Item"("type");

-- CreateIndex
CREATE INDEX "Item_requiredLevel_idx" ON "Item"("requiredLevel");

-- CreateIndex
CREATE INDEX "CharacterAbility_characterId_idx" ON "CharacterAbility"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAbility_characterId_abilityId_key" ON "CharacterAbility"("characterId", "abilityId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_sellerId_idx" ON "MarketplaceListing"("sellerId");

-- CreateIndex
CREATE INDEX "MarketplaceListing_currency_idx" ON "MarketplaceListing"("currency");

-- CreateIndex
CREATE INDEX "MarketplaceListing_source_idx" ON "MarketplaceListing"("source");

-- CreateIndex
CREATE UNIQUE INDEX "Vault_userId_key" ON "Vault"("userId");

-- CreateIndex
CREATE INDEX "VaultItem_vaultId_idx" ON "VaultItem"("vaultId");

-- CreateIndex
CREATE INDEX "QuestDefinition_category_idx" ON "QuestDefinition"("category");

-- CreateIndex
CREATE INDEX "PlayerQuest_userId_idx" ON "PlayerQuest"("userId");

-- CreateIndex
CREATE INDEX "PlayerQuest_status_idx" ON "PlayerQuest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerQuest_userId_questId_key" ON "PlayerQuest"("userId", "questId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountWallet_userId_key" ON "AccountWallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LoginStreak_userId_key" ON "LoginStreak"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_userId_key" ON "Referral"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referralCode_key" ON "Referral"("referralCode");

-- CreateIndex
CREATE INDEX "Referral_referralCode_idx" ON "Referral"("referralCode");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentSlotRow" ADD CONSTRAINT "EquipmentSlotRow_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryItem" ADD CONSTRAINT "InventoryItem_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAbility" ADD CONSTRAINT "CharacterAbility_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketplaceListing" ADD CONSTRAINT "MarketplaceListing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vault" ADD CONSTRAINT "Vault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VaultItem" ADD CONSTRAINT "VaultItem_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuest" ADD CONSTRAINT "PlayerQuest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerQuest" ADD CONSTRAINT "PlayerQuest_questId_fkey" FOREIGN KEY ("questId") REFERENCES "QuestDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountWallet" ADD CONSTRAINT "AccountWallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginStreak" ADD CONSTRAINT "LoginStreak_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
