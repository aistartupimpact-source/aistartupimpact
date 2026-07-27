-- Sprint 3: Discovery features

-- Add trendingScore to AiTool for computed trending
ALTER TABLE "AiTool" ADD COLUMN IF NOT EXISTS "trendingScore" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "AiTool_trendingScore_idx" ON "AiTool"("trendingScore" DESC);

-- Add SEO fields to ToolCategory for category landing pages
ALTER TABLE "ToolCategory" ADD COLUMN IF NOT EXISTS "metaTitle" TEXT DEFAULT NULL;
ALTER TABLE "ToolCategory" ADD COLUMN IF NOT EXISTS "metaDescription" TEXT DEFAULT NULL;
ALTER TABLE "ToolCategory" ADD COLUMN IF NOT EXISTS "introText" TEXT DEFAULT NULL;

-- Sprint 5.4: Curated Collections
CREATE TABLE IF NOT EXISTS "ToolCollection" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "coverImage" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolCollection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ToolCollectionItem" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "collectionId" TEXT NOT NULL,
    "toolId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "editorNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolCollectionItem_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ToolCollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "ToolCollection"("id") ON DELETE CASCADE,
    CONSTRAINT "ToolCollectionItem_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AiTool"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ToolCollectionItem_collectionId_toolId_key" ON "ToolCollectionItem"("collectionId", "toolId");
CREATE INDEX IF NOT EXISTS "ToolCollectionItem_collectionId_idx" ON "ToolCollectionItem"("collectionId");
CREATE INDEX IF NOT EXISTS "ToolCollection_slug_idx" ON "ToolCollection"("slug");
CREATE INDEX IF NOT EXISTS "ToolCollection_isPublished_idx" ON "ToolCollection"("isPublished");
