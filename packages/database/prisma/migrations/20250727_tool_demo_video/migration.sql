-- Add demoVideoUrl field to AiTool for YouTube/Vimeo/Loom embeds
ALTER TABLE "AiTool" ADD COLUMN IF NOT EXISTS "demoVideoUrl" TEXT DEFAULT NULL;
