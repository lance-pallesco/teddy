-- Drop redundant contactPerson; shelter staff relations cover personnel
ALTER TABLE "Shelter" DROP COLUMN IF EXISTS "contactPerson";
