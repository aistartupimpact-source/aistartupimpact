-- Tool Alternatives table (bidirectional linking)
CREATE TABLE IF NOT EXISTS "ToolAlternative" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "toolId" TEXT NOT NULL,
    "alternativeId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'admin',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolAlternative_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ToolAlternative_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "AiTool"("id") ON DELETE CASCADE,
    CONSTRAINT "ToolAlternative_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "AiTool"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ToolAlternative_toolId_alternativeId_key" ON "ToolAlternative"("toolId", "alternativeId");
CREATE INDEX IF NOT EXISTS "ToolAlternative_toolId_idx" ON "ToolAlternative"("toolId");
CREATE INDEX IF NOT EXISTS "ToolAlternative_alternativeId_idx" ON "ToolAlternative"("alternativeId");

-- Tool Review Response table (founder responds to reviews)
CREATE TABLE IF NOT EXISTS "ToolReviewResponse" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "reviewId" TEXT NOT NULL UNIQUE,
    "founderId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToolReviewResponse_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ToolReviewResponse_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ToolReview"("id") ON DELETE CASCADE,
    CONSTRAINT "ToolReviewResponse_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "FounderUser"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "ToolReviewResponse_reviewId_idx" ON "ToolReviewResponse"("reviewId");
CREATE INDEX IF NOT EXISTS "ToolReviewResponse_founderId_idx" ON "ToolReviewResponse"("founderId");
