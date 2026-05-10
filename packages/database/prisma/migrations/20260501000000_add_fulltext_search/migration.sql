-- Add Full-Text Search Support for Global Search
-- This migration adds tsvector columns and GIN indexes for fast full-text search

-- ════════════════════════════════════════════
-- ARTICLE FULL-TEXT SEARCH
-- ════════════════════════════════════════════

-- Add tsvector column for articles
ALTER TABLE "Article" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Create function to update article search vector
CREATE OR REPLACE FUNCTION article_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW."contentText", '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW."seoDescription", '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for article search vector
DROP TRIGGER IF EXISTS article_search_vector_trigger ON "Article";
CREATE TRIGGER article_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Article"
  FOR EACH ROW EXECUTE FUNCTION article_search_vector_update();

-- Update existing articles
UPDATE "Article" SET "searchVector" = 
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE("contentText", '')), 'C') ||
  setweight(to_tsvector('english', COALESCE("seoDescription", '')), 'D');

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS "Article_searchVector_idx" ON "Article" USING GIN("searchVector");

-- ════════════════════════════════════════════
-- AI TOOL FULL-TEXT SEARCH
-- ════════════════════════════════════════════

-- Add tsvector column for tools
ALTER TABLE "AiTool" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Create function to update tool search vector
CREATE OR REPLACE FUNCTION tool_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.tagline, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for tool search vector
DROP TRIGGER IF EXISTS tool_search_vector_trigger ON "AiTool";
CREATE TRIGGER tool_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "AiTool"
  FOR EACH ROW EXECUTE FUNCTION tool_search_vector_update();

-- Update existing tools
UPDATE "AiTool" SET "searchVector" = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(tagline, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C');

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS "AiTool_searchVector_idx" ON "AiTool" USING GIN("searchVector");

-- ════════════════════════════════════════════
-- STARTUP FULL-TEXT SEARCH
-- ════════════════════════════════════════════

-- Add tsvector column for startups
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "searchVector" tsvector;

-- Create function to update startup search vector
CREATE OR REPLACE FUNCTION startup_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.tagline, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for startup search vector
DROP TRIGGER IF EXISTS startup_search_vector_trigger ON "Startup";
CREATE TRIGGER startup_search_vector_trigger
  BEFORE INSERT OR UPDATE ON "Startup"
  FOR EACH ROW EXECUTE FUNCTION startup_search_vector_update();

-- Update existing startups
UPDATE "Startup" SET "searchVector" = 
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(tagline, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C');

-- Create GIN index for fast search
CREATE INDEX IF NOT EXISTS "Startup_searchVector_idx" ON "Startup" USING GIN("searchVector");

-- ════════════════════════════════════════════
-- SEARCH ANALYTICS TABLE
-- ════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "SearchQuery" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "query" TEXT NOT NULL,
  "normalizedQuery" TEXT NOT NULL,
  "resultsCount" INTEGER NOT NULL DEFAULT 0,
  "clickedResultId" TEXT,
  "clickedResultType" TEXT,
  "sessionId" TEXT,
  "userId" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for search analytics
CREATE INDEX IF NOT EXISTS "SearchQuery_query_idx" ON "SearchQuery"("query");
CREATE INDEX IF NOT EXISTS "SearchQuery_normalizedQuery_idx" ON "SearchQuery"("normalizedQuery");
CREATE INDEX IF NOT EXISTS "SearchQuery_createdAt_idx" ON "SearchQuery"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "SearchQuery_sessionId_idx" ON "SearchQuery"("sessionId");

-- ════════════════════════════════════════════
-- POPULAR SEARCHES MATERIALIZED VIEW
-- ════════════════════════════════════════════

CREATE MATERIALIZED VIEW IF NOT EXISTS "PopularSearches" AS
SELECT 
  "normalizedQuery" as query,
  COUNT(*) as "searchCount",
  SUM("resultsCount") as "totalResults",
  COUNT(DISTINCT "sessionId") as "uniqueUsers",
  MAX("createdAt") as "lastSearchedAt"
FROM "SearchQuery"
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY "normalizedQuery"
HAVING COUNT(*) >= 3
ORDER BY "searchCount" DESC
LIMIT 100;

-- Index for popular searches
CREATE UNIQUE INDEX IF NOT EXISTS "PopularSearches_query_idx" ON "PopularSearches"("query");

-- Function to refresh popular searches (call this periodically)
CREATE OR REPLACE FUNCTION refresh_popular_searches() RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY "PopularSearches";
END;
$$ LANGUAGE plpgsql;
