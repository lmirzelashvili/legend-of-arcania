-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "gender" TEXT NOT NULL DEFAULT 'male';

-- CreateTable
CREATE TABLE "ItemTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "slot" TEXT,
    "tier" INTEGER NOT NULL DEFAULT 0,
    "requiredLevel" INTEGER NOT NULL DEFAULT 1,
    "requiredClass" TEXT,
    "baseStatMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseStatMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "baseStatType" TEXT,
    "identityKey" TEXT,
    "bonusPoolKey" TEXT,
    "prestigeKey" TEXT,
    "socketCount" INTEGER NOT NULL DEFAULT 0,
    "setId" TEXT,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "sellPrice" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,

    CONSTRAINT "ItemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetBonus" (
    "id" TEXT NOT NULL,
    "setId" TEXT NOT NULL,
    "className" TEXT,
    "piecesRequired" INTEGER NOT NULL,
    "bonusStat" TEXT NOT NULL,
    "bonusValue" DOUBLE PRECISION NOT NULL,
    "bonusIsPercent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SetBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GemTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gemType" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "statPool" JSONB NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "sellPrice" INTEGER NOT NULL DEFAULT 0,
    "icon" TEXT,

    CONSTRAINT "GemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ItemTemplate_type_idx" ON "ItemTemplate"("type");

-- CreateIndex
CREATE INDEX "ItemTemplate_tier_idx" ON "ItemTemplate"("tier");

-- CreateIndex
CREATE INDEX "ItemTemplate_slot_idx" ON "ItemTemplate"("slot");

-- CreateIndex
CREATE INDEX "SetBonus_setId_idx" ON "SetBonus"("setId");

-- CreateIndex
CREATE INDEX "GemTemplate_gemType_idx" ON "GemTemplate"("gemType");

-- CreateIndex
CREATE INDEX "InventoryItem_characterId_itemId_idx" ON "InventoryItem"("characterId", "itemId");
