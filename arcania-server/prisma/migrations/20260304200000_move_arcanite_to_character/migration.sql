-- Transfer existing AccountWallet.arcanite to Vault.arcanite before dropping the column
UPDATE "Vault" v
SET "arcanite" = v."arcanite" + COALESCE(
  (SELECT aw."arcanite" FROM "AccountWallet" aw WHERE aw."userId" = v."userId"), 0
);

-- Drop the arcanite column from AccountWallet
ALTER TABLE "AccountWallet" DROP COLUMN "arcanite";
