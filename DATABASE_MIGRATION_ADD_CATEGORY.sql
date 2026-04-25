-- Migration: Add category and useCases fields to Startup table
-- Run this in your database

-- Add category column (single select)
ALTER TABLE "Startup" 
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add useCases column (array of strings)
ALTER TABLE "Startup" 
ADD COLUMN IF NOT EXISTS "useCases" TEXT[];

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_startup_category ON "Startup"(category);

-- Add employee growth data for tracking
ALTER TABLE "Startup" 
ADD COLUMN IF NOT EXISTS "employeeGrowthData" JSONB;

-- Update existing startups with detected categories (optional - run after migration)
-- This will auto-detect categories based on existing data
UPDATE "Startup" 
SET category = CASE
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%llm%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%language model%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%indic%' 
    THEN 'Indic LLM'
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%infrastructure%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%cloud%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%compute%' 
    THEN 'AI Infrastructure'
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%health%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%medical%' 
    THEN 'Health AI'
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%fintech%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%finance%' 
    THEN 'FinTech AI'
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%sales%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%crm%' 
    THEN 'Sales AI'
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%data%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%analytics%' 
    THEN 'Data AI'
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%devtools%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%developer%' 
    THEN 'DevTools AI'
  WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%education%' 
    OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%edtech%' 
    THEN 'EdTech AI'
  ELSE NULL
END
WHERE category IS NULL AND "deletedAt" IS NULL;

-- Verify the migration
SELECT category, COUNT(*) as count 
FROM "Startup" 
WHERE "deletedAt" IS NULL 
GROUP BY category 
ORDER BY count DESC;
