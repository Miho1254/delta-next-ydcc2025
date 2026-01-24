-- Alter the column type from Enum to Text
ALTER TABLE "byproducts" ALTER COLUMN "type" TYPE TEXT;
ALTER TABLE "byproducts" ALTER COLUMN "type" SET DEFAULT 'unknown';

-- Drop the old enum type if it exists and is no longer used
DROP TYPE IF EXISTS "ByProductType";
