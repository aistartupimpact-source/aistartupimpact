-- AlterTable: Add slug history fields to Startup
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "slugChangedAt" TIMESTAMP(3);
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "previousSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable: Add slug history fields to AiTool
ALTER TABLE "AiTool" ADD COLUMN IF NOT EXISTS "slugChangedAt" TIMESTAMP(3);
ALTER TABLE "AiTool" ADD COLUMN IF NOT EXISTS "previousSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[];
