-- ToolUpvote table
CREATE TABLE IF NOT EXISTS "ToolUpvote" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "toolId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolUpvote_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ToolUpvote_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AiTool"("id") ON DELETE CASCADE,
    CONSTRAINT "ToolUpvote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "WebUser"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ToolUpvote_toolId_userId_key" ON "ToolUpvote"("toolId", "userId");
CREATE INDEX IF NOT EXISTS "ToolUpvote_toolId_idx" ON "ToolUpvote"("toolId");
CREATE INDEX IF NOT EXISTS "ToolUpvote_userId_idx" ON "ToolUpvote"("userId");
CREATE INDEX IF NOT EXISTS "ToolUpvote_createdAt_idx" ON "ToolUpvote"("createdAt");

-- upvoteCount and saveCount on AiTool
ALTER TABLE "AiTool" ADD COLUMN IF NOT EXISTS "upvoteCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AiTool" ADD COLUMN IF NOT EXISTS "saveCount" INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "AiTool_upvoteCount_idx" ON "AiTool"("upvoteCount" DESC);
CREATE INDEX IF NOT EXISTS "AiTool_saveCount_idx" ON "AiTool"("saveCount" DESC);

-- statValue and statLabel on Startup (for featured spotlight stats)
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "statValue" TEXT;
ALTER TABLE "Startup" ADD COLUMN IF NOT EXISTS "statLabel" TEXT;
