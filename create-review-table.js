// Create StartupReview table
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createReviewTable() {
  try {
    console.log('Creating StartupReview table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS "StartupReview" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "startupId" TEXT NOT NULL REFERENCES "Startup"(id) ON DELETE CASCADE,
        "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
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
      )
    `;
    console.log('✓ Created StartupReview table');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_startup_review_startup ON "StartupReview"("startupId")`;
    await sql`CREATE INDEX IF NOT EXISTS idx_startup_review_user ON "StartupReview"("userId")`;
    await sql`CREATE INDEX IF NOT EXISTS idx_startup_review_status ON "StartupReview"(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_startup_review_published ON "StartupReview"("publishedAt")`;
    console.log('✓ Created indexes');
    
    console.log('\n✅ StartupReview table created successfully!');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

createReviewTable();
