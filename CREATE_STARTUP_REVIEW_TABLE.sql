-- Create StartupReview table for startup reviews
CREATE TABLE IF NOT EXISTS "StartupReview" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "startupId" UUID NOT NULL REFERENCES "Startup"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  "isVerifiedFounder" BOOLEAN DEFAULT FALSE,
  "isVerifiedInvestor" BOOLEAN DEFAULT FALSE,
  "proofImageUrl" VARCHAR(500),
  status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED')),
  "aiSpamScore" INTEGER DEFAULT 0,
  "helpfulCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "publishedAt" TIMESTAMP,
  UNIQUE("startupId", "userId")
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_startup_review_startup ON "StartupReview"("startupId");
CREATE INDEX IF NOT EXISTS idx_startup_review_user ON "StartupReview"("userId");
CREATE INDEX IF NOT EXISTS idx_startup_review_status ON "StartupReview"(status);
CREATE INDEX IF NOT EXISTS idx_startup_review_published ON "StartupReview"("publishedAt");

-- Add comment
COMMENT ON TABLE "StartupReview" IS 'User reviews and ratings for startups';
