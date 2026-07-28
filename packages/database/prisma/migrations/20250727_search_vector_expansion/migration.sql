-- Expand search vector to include description, use cases, tags, pros
-- This rebuilds the tsvector with weighted fields for better search ranking

-- Create or replace function to build tool search vector
CREATE OR REPLACE FUNCTION update_tool_search_vector() RETURNS TRIGGER AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.tagline, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW."founderNames", ' '), '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (drop if exists first)
DROP TRIGGER IF EXISTS tool_search_vector_update ON "AiTool";
CREATE TRIGGER tool_search_vector_update
  BEFORE INSERT OR UPDATE OF name, tagline, description, "founderNames"
  ON "AiTool"
  FOR EACH ROW
  EXECUTE FUNCTION update_tool_search_vector();

-- Rebuild all existing vectors
UPDATE "AiTool" SET "searchVector" =
  setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(tagline, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(array_to_string("founderNames", ' '), '')), 'D')
WHERE "deletedAt" IS NULL;
