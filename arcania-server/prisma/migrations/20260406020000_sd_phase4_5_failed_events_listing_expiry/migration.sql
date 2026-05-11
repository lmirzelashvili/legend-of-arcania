-- SD Phase 4: FailedEvent dead-letter table
CREATE TABLE "FailedEvent" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "error" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retried" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "FailedEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FailedEvent_channel_idx" ON "FailedEvent"("channel");
CREATE INDEX "FailedEvent_createdAt_idx" ON "FailedEvent"("createdAt");

-- SD Phase 5: Marketplace listing expiry
ALTER TABLE "MarketplaceListing" ADD COLUMN "expiresAt" TIMESTAMP(3);
CREATE INDEX "MarketplaceListing_expiresAt_idx" ON "MarketplaceListing"("expiresAt");

-- SD Phase 5: PvP leaderboard index
CREATE INDEX "PvPStats_kills_idx" ON "PvPStats"("kills");
