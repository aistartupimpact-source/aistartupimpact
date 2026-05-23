-- ============================================
-- Migrate Generated FAQs to Database
-- ============================================
-- This script creates placeholder FAQs for all startups
-- These can then be edited through the admin/founder portal
-- ============================================

-- For each startup, create 3 basic FAQs that can be customized
-- You can run this once to populate initial FAQs, then edit them through the UI

-- FAQ 1: What does the startup do?
INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'What does ' || name || ' do?',
  COALESCE(LEFT(description, 500), tagline, 'AI startup focused on innovation'),
  0,
  NOW(),
  NOW()
FROM "Startup"
WHERE "deletedAt" IS NULL
  AND id NOT IN (SELECT DISTINCT "startupId" FROM "StartupFAQ")
ON CONFLICT DO NOTHING;

-- FAQ 2: Where is the startup located?
INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'Where is ' || name || ' located?',
  name || ' is headquartered in ' || COALESCE("headquartersCity", 'India') || 
  CASE 
    WHEN "foundedYear" IS NOT NULL THEN ', where it was founded in ' || "foundedYear"::text || '.'
    ELSE '.'
  END,
  1,
  NOW(),
  NOW()
FROM "Startup"
WHERE "deletedAt" IS NULL
  AND "headquartersCity" IS NOT NULL
  AND id NOT IN (
    SELECT "startupId" FROM "StartupFAQ" WHERE "order" = 1
  )
ON CONFLICT DO NOTHING;

-- FAQ 3: When was the startup founded?
INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'When was ' || name || ' founded?',
  name || ' was founded in ' || "foundedYear"::text || '.' ||
  CASE 
    WHEN "employeeCount" IS NOT NULL THEN ' Since then, it has grown to ' || "employeeCount"::text || '+ employees.'
    ELSE ''
  END,
  2,
  NOW(),
  NOW()
FROM "Startup"
WHERE "deletedAt" IS NULL
  AND "foundedYear" IS NOT NULL
  AND id NOT IN (
    SELECT "startupId" FROM "StartupFAQ" WHERE "order" = 2
  )
ON CONFLICT DO NOTHING;

-- FAQ 4: Team size
INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'How many employees does ' || name || ' have?',
  name || ' currently has ' || "employeeCount"::text || '+ employees.',
  3,
  NOW(),
  NOW()
FROM "Startup"
WHERE "deletedAt" IS NULL
  AND "employeeCount" IS NOT NULL
  AND id NOT IN (
    SELECT "startupId" FROM "StartupFAQ" WHERE "order" = 3
  )
ON CONFLICT DO NOTHING;

-- FAQ 5: Is the startup hiring?
INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'Is ' || name || ' hiring?',
  'For current job openings at ' || name || ', visit their careers page at ' || 
  COALESCE("websiteUrl", 'their website') || ' or check their LinkedIn profile.',
  4,
  NOW(),
  NOW()
FROM "Startup"
WHERE "deletedAt" IS NULL
  AND "websiteUrl" IS NOT NULL
  AND id NOT IN (
    SELECT "startupId" FROM "StartupFAQ" WHERE "order" = 4
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification Query
-- ============================================
-- Check how many FAQs were created per startup
SELECT 
  s.name as startup_name,
  COUNT(f.id) as faq_count
FROM "Startup" s
LEFT JOIN "StartupFAQ" f ON s.id = f."startupId"
WHERE s."deletedAt" IS NULL
GROUP BY s.id, s.name
ORDER BY faq_count DESC, s.name
LIMIT 20;

-- Summary
SELECT 
  COUNT(DISTINCT "startupId") as startups_with_faqs,
  COUNT(*) as total_faqs,
  ROUND(AVG(faq_count), 2) as avg_faqs_per_startup
FROM (
  SELECT "startupId", COUNT(*) as faq_count
  FROM "StartupFAQ"
  GROUP BY "startupId"
) subquery;
