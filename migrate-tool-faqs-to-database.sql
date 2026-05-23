-- ============================================
-- Migrate Generated Tool FAQs to Database
-- ============================================
-- This script creates placeholder FAQs for all AI tools
-- These can then be edited through the admin/founder portal
-- ============================================

-- For each tool, create 3-5 basic FAQs that can be customized
-- You can run this once to populate initial FAQs, then edit them through the UI

-- FAQ 1: What is the tool?
INSERT INTO "ToolFAQ" (id, "toolId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'What is ' || name || '?',
  COALESCE(LEFT(description, 500), tagline, 'An AI-powered tool for productivity'),
  0,
  NOW(),
  NOW()
FROM "AiTool"
WHERE "deletedAt" IS NULL
  AND id NOT IN (SELECT DISTINCT "toolId" FROM "ToolFAQ")
ON CONFLICT DO NOTHING;

-- FAQ 2: What are the key features?
INSERT INTO "ToolFAQ" (id, "toolId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'What are the key features of ' || name || '?',
  name || ' offers powerful AI capabilities including ' || 
  CASE 
    WHEN "hasApi" = true AND "hasMobileApp" = true THEN 'API access, mobile app support, and more.'
    WHEN "hasApi" = true THEN 'API access for seamless integration.'
    WHEN "hasMobileApp" = true THEN 'mobile app support for on-the-go access.'
    ELSE 'advanced features for enhanced productivity.'
  END,
  1,
  NOW(),
  NOW()
FROM "AiTool"
WHERE "deletedAt" IS NULL
  AND id NOT IN (
    SELECT "toolId" FROM "ToolFAQ" WHERE "order" = 1
  )
ON CONFLICT DO NOTHING;

-- FAQ 3: What is the pricing?
INSERT INTO "ToolFAQ" (id, "toolId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'How much does ' || name || ' cost?',
  name || ' offers a ' || LOWER("pricingModel") || ' pricing model.' ||
  CASE 
    WHEN "startingPrice" IS NOT NULL AND "startingPrice" > 0 THEN 
      ' Plans start at $' || ROUND(("startingPrice"::numeric / 100), 2)::text || ' per month.'
    WHEN "pricingModel" = 'FREE' THEN ' It is completely free to use.'
    WHEN "pricingModel" = 'FREEMIUM' THEN ' It offers a free tier with premium features available.'
    ELSE ' Visit their pricing page for more details.'
  END,
  2,
  NOW(),
  NOW()
FROM "AiTool"
WHERE "deletedAt" IS NULL
  AND id NOT IN (
    SELECT "toolId" FROM "ToolFAQ" WHERE "order" = 2
  )
ON CONFLICT DO NOTHING;

-- FAQ 4: Does it have an API?
INSERT INTO "ToolFAQ" (id, "toolId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'Does ' || name || ' have an API?',
  CASE 
    WHEN "hasApi" = true THEN 'Yes, ' || name || ' provides an API for developers to integrate its capabilities into their applications.'
    ELSE 'Currently, ' || name || ' does not offer API access. Check their website for updates on API availability.'
  END,
  3,
  NOW(),
  NOW()
FROM "AiTool"
WHERE "deletedAt" IS NULL
  AND id NOT IN (
    SELECT "toolId" FROM "ToolFAQ" WHERE "order" = 3
  )
ON CONFLICT DO NOTHING;

-- FAQ 5: Is there a mobile app?
INSERT INTO "ToolFAQ" (id, "toolId", question, answer, "order", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  id,
  'Is there a mobile app for ' || name || '?',
  CASE 
    WHEN "hasMobileApp" = true THEN 'Yes, ' || name || ' is available as a mobile app for iOS and Android devices.'
    ELSE name || ' is currently available as a web application. Check their website for mobile app availability.'
  END,
  4,
  NOW(),
  NOW()
FROM "AiTool"
WHERE "deletedAt" IS NULL
  AND id NOT IN (
    SELECT "toolId" FROM "ToolFAQ" WHERE "order" = 4
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification Query
-- ============================================
-- Check how many FAQs were created per tool
SELECT 
  t.name as tool_name,
  COUNT(f.id) as faq_count
FROM "AiTool" t
LEFT JOIN "ToolFAQ" f ON t.id = f."toolId"
WHERE t."deletedAt" IS NULL
GROUP BY t.id, t.name
ORDER BY faq_count DESC, t.name
LIMIT 20;

-- Summary
SELECT 
  COUNT(DISTINCT "toolId") as tools_with_faqs,
  COUNT(*) as total_faqs,
  ROUND(AVG(faq_count), 2) as avg_faqs_per_tool
FROM (
  SELECT "toolId", COUNT(*) as faq_count
  FROM "ToolFAQ"
  GROUP BY "toolId"
) subquery;
