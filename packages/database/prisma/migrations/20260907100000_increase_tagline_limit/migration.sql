-- Increase tagline max length from 60 to 100
ALTER TABLE "AiTool" DROP CONSTRAINT IF EXISTS "tagline_max_length";
ALTER TABLE "AiTool" ADD CONSTRAINT "tagline_max_length" CHECK (char_length(tagline) <= 100);
