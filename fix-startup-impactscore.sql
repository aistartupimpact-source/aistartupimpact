-- Fix null impactScore values in Startup table
-- This script updates all startups with null impactScore to 0

UPDATE "Startup"
SET "impactScore" = 0
WHERE "impactScore" IS NULL;

-- Verify the fix
SELECT COUNT(*) as "Startups with null impactScore" 
FROM "Startup" 
WHERE "impactScore" IS NULL;
