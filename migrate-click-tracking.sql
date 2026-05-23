-- Migration: Add Click Source Tracking
-- Run this when database is accessible

-- Step 1: Create ClickSource enum
CREATE TYPE "ClickSource" AS ENUM (
  'TOOL_DETAIL',
  'DIRECTORY',
  'HOMEPAGE',
  'SEARCH',
  'RELATED',
  'COMPARISON',
  'OTHER'
);

-- Step 2: Add new columns with defaults (safe for existing data)
ALTER TABLE "AffiliateClick" 
  ADD COLUMN "sourcePage" "ClickSource" DEFAULT 'OTHER',
  ADD COLUMN "device" TEXT,
  ADD COLUMN "browser" TEXT,
  ADD COLUMN "os" TEXT,
  ADD COLUMN "country" TEXT;

-- Step 3: Rename ipAddress to ipHash (if column exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'AffiliateClick' AND column_name = 'ipAddress'
  ) THEN
    ALTER TABLE "AffiliateClick" RENAME COLUMN "ipAddress" TO "ipHash";
  ELSE
    ALTER TABLE "AffiliateClick" ADD COLUMN "ipHash" TEXT;
  END IF;
END $$;

-- Step 4: Update id column to use cuid() default (for new records)
-- Note: Existing records keep their IDs
ALTER TABLE "AffiliateClick" 
  ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;

-- Step 5: Make sourcePage NOT NULL (safe because of default)
ALTER TABLE "AffiliateClick" 
  ALTER COLUMN "sourcePage" SET NOT NULL;

-- Step 6: Remove default (we want explicit values going forward)
ALTER TABLE "AffiliateClick" 
  ALTER COLUMN "sourcePage" DROP DEFAULT;

-- Step 7: Create indexes for rate limiting and queries
CREATE INDEX IF NOT EXISTS "idx_affiliate_click_rate_limit" 
  ON "AffiliateClick"("ipHash", "toolId", "createdAt");

CREATE INDEX IF NOT EXISTS "idx_affiliate_click_created" 
  ON "AffiliateClick"("createdAt");

-- Step 8: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'AffiliateClick'
ORDER BY ordinal_position;

-- Success message
SELECT 'Migration completed successfully!' as status;
