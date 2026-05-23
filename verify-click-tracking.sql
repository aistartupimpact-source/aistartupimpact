-- Verification Script for Tool Click Tracking System
-- Run this in Neon SQL Editor to verify the migration was successful

-- 1. Check if ClickSource enum exists
SELECT 
  'ClickSource enum' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_type WHERE typname = 'ClickSource'
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status;

-- 2. List all ClickSource enum values
SELECT 
  enumlabel as enum_value,
  enumsortorder as sort_order
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ClickSource')
ORDER BY enumsortorder;

-- 3. Check AffiliateClick table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'AffiliateClick'
ORDER BY ordinal_position;

-- 4. Check indexes on AffiliateClick table
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'AffiliateClick'
ORDER BY indexname;

-- 5. Count existing clicks (if any)
SELECT 
  'Total clicks' as metric,
  COUNT(*) as count
FROM "AffiliateClick";

-- 6. Check if sourcePage column exists and has correct type
SELECT 
  'sourcePage column' as check_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'AffiliateClick' 
        AND column_name = 'sourcePage'
        AND data_type = 'USER-DEFINED'
    ) THEN '✅ EXISTS with correct type'
    ELSE '❌ MISSING or wrong type'
  END as status;

-- 7. Check if new columns exist
SELECT 
  column_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.columns 
      WHERE table_name = 'AffiliateClick' 
        AND column_name = c.column_name
    ) THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('sourcePage'),
    ('device'),
    ('browser'),
    ('os'),
    ('country'),
    ('ipHash')
) AS c(column_name);

-- 8. Test data quality (if clicks exist)
SELECT 
  COUNT(*) as total_clicks,
  COUNT("sourcePage") as has_source,
  COUNT(device) as has_device,
  COUNT(browser) as has_browser,
  COUNT(os) as has_os,
  COUNT(country) as has_country,
  COUNT("ipHash") as has_ip_hash
FROM "AffiliateClick";

-- 9. Check recent clicks (last 10)
SELECT 
  t.name as tool_name,
  ac."sourcePage",
  ac.device,
  ac.browser,
  ac.os,
  ac.country,
  ac."createdAt"
FROM "AffiliateClick" ac
LEFT JOIN "AiTool" t ON t.id = ac."toolId"
ORDER BY ac."createdAt" DESC
LIMIT 10;

-- 10. Summary
SELECT 
  '✅ Migration verification complete!' as status,
  'If all checks show ✅, the system is ready to use' as message;
