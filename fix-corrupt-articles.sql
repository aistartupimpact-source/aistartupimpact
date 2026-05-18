-- Fix corrupt Article records with invalid createdAt/updatedAt/publishedAt values
-- Run this in your Neon database console

-- First, let's see which articles have corrupt data
SELECT id, title, "createdAt", "updatedAt", "publishedAt"
FROM "Article"
WHERE 
  "createdAt"::text = '{}'
  OR "updatedAt"::text = '{}'
  OR "publishedAt"::text = '{}';

-- Fix corrupt createdAt values (set to current timestamp)
UPDATE "Article"
SET "createdAt" = NOW()
WHERE "createdAt"::text = '{}';

-- Fix corrupt updatedAt values (set to current timestamp)
UPDATE "Article"
SET "updatedAt" = NOW()
WHERE "updatedAt"::text = '{}';

-- Fix corrupt publishedAt values (set to NULL)
UPDATE "Article"
SET "publishedAt" = NULL
WHERE "publishedAt"::text = '{}';

-- Verify the fix
SELECT COUNT(*) as fixed_count
FROM "Article"
WHERE 
  "createdAt"::text != '{}'
  AND "updatedAt"::text != '{}'
  AND ("publishedAt" IS NULL OR "publishedAt"::text != '{}');
