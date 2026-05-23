-- Add FAQ tables for Startups and Tools
-- This enables FAQ management for both startups and tools

-- ============================================
-- Startup FAQs Table
-- ============================================
CREATE TABLE IF NOT EXISTS "StartupFAQ" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "startupId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "StartupFAQ_startupId_fkey" 
    FOREIGN KEY ("startupId") 
    REFERENCES "Startup"("id") 
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "StartupFAQ_startupId_idx" ON "StartupFAQ"("startupId");
CREATE INDEX IF NOT EXISTS "StartupFAQ_order_idx" ON "StartupFAQ"("order");

-- ============================================
-- Tool FAQs Table
-- ============================================
CREATE TABLE IF NOT EXISTS "ToolFAQ" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "toolId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answer" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "ToolFAQ_toolId_fkey" 
    FOREIGN KEY ("toolId") 
    REFERENCES "AiTool"("id") 
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "ToolFAQ_toolId_idx" ON "ToolFAQ"("toolId");
CREATE INDEX IF NOT EXISTS "ToolFAQ_order_idx" ON "ToolFAQ"("order");

-- ============================================
-- Add missing fields to Startup table
-- ============================================
ALTER TABLE "Startup" 
  ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "twitterUrl" TEXT;

-- ============================================
-- Add missing fields to AiTool table
-- ============================================
ALTER TABLE "AiTool" 
  ADD COLUMN IF NOT EXISTS "linkedinUrl" TEXT,
  ADD COLUMN IF NOT EXISTS "twitterUrl" TEXT;

-- ============================================
-- Verification Queries
-- ============================================

-- Check StartupFAQ table
SELECT 
  COUNT(*) as total_startup_faqs,
  COUNT(DISTINCT "startupId") as startups_with_faqs
FROM "StartupFAQ";

-- Check ToolFAQ table
SELECT 
  COUNT(*) as total_tool_faqs,
  COUNT(DISTINCT "toolId") as tools_with_faqs
FROM "ToolFAQ";

-- Check new columns
SELECT 
  COUNT(*) as total_startups,
  COUNT("linkedinUrl") as with_linkedin,
  COUNT("twitterUrl") as with_twitter
FROM "Startup";

SELECT 
  COUNT(*) as total_tools,
  COUNT("linkedinUrl") as with_linkedin,
  COUNT("twitterUrl") as with_twitter
FROM "AiTool";
