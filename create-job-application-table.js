// Create JobApplication table
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function createJobApplicationTable() {
  try {
    console.log('Creating JobApplication table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS "JobApplication" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        role VARCHAR(100) NOT NULL,
        "fullName" VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        "resumeLink" VARCHAR(500) NOT NULL,
        status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'HIRED')),
        notes TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created JobApplication table');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_job_application_email ON "JobApplication"(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_application_status ON "JobApplication"(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_application_created ON "JobApplication"("createdAt")`;
    console.log('✓ Created indexes');
    
    // Try to update Subscriber table if it exists
    try {
      console.log('Checking Subscriber table...');
      await sql`ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS tags TEXT[]`;
      await sql`CREATE INDEX IF NOT EXISTS idx_subscriber_tags ON "Subscriber" USING GIN(tags)`;
      console.log('✓ Updated Subscriber table with tags column');
    } catch (subError) {
      console.log('⚠ Subscriber table not found (will be created later)');
    }
    
    console.log('\n✅ JobApplication table created successfully!');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

createJobApplicationTable();
