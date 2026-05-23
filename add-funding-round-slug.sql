-- Add slug column to FundingRound table for individual funding round pages
-- This enables SEO-friendly URLs like /funding/sarvam-ai-series-a

-- Step 1: Add slug column
ALTER TABLE "FundingRound" ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Create index for fast lookups
CREATE INDEX IF NOT EXISTS "FundingRound_slug_idx" ON "FundingRound"(slug);

-- Step 3: Generate slugs for existing funding rounds
-- Format: startup-name-round-type (e.g., sarvam-ai-series-a, krutrim-seed)
UPDATE "FundingRound" fr
SET slug = LOWER(
  REGEXP_REPLACE(
    CONCAT(
      s.slug, 
      '-', 
      REPLACE(LOWER(fr."roundType"), ' ', '-')
    ),
    '[^a-z0-9-]', '', 'g'
  )
)
FROM "Startup" s
WHERE fr."startupId" = s.id 
  AND fr.slug IS NULL
  AND s."deletedAt" IS NULL;

-- Step 4: Handle duplicate slugs by appending a number
-- If a startup has multiple rounds of the same type, append -2, -3, etc.
WITH duplicates AS (
  SELECT slug, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "announcedAt") as rn
  FROM "FundingRound"
  WHERE slug IS NOT NULL
)
UPDATE "FundingRound" fr
SET slug = CONCAT(fr.slug, '-', d.rn)
FROM duplicates d
WHERE fr.slug = d.slug AND d.rn > 1;

-- Step 5: Verify slugs were generated
SELECT 
  COUNT(*) as total_rounds,
  COUNT(slug) as rounds_with_slug,
  COUNT(*) - COUNT(slug) as rounds_without_slug
FROM "FundingRound";

-- Step 6: Show sample slugs
SELECT 
  s.name as startup_name,
  fr."roundType",
  fr.slug,
  fr."announcedAt"
FROM "FundingRound" fr
JOIN "Startup" s ON s.id = fr."startupId"
WHERE fr.slug IS NOT NULL
ORDER BY fr."announcedAt" DESC
LIMIT 10;
