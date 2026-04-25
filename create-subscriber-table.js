// Create Subscriber table
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL);

async function createSubscriberTable() {
  try {
    console.log('Creating Subscriber table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS "Subscriber" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'UNSUBSCRIBED', 'BOUNCED')),
        source VARCHAR(100),
        tags TEXT[],
        "subscribedAt" TIMESTAMP DEFAULT NOW(),
        "unsubscribedAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✓ Created Subscriber table');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriber_email ON "Subscriber"(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriber_status ON "Subscriber"(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriber_tags ON "Subscriber" USING GIN(tags)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriber_source ON "Subscriber"(source)`;
    console.log('✓ Created indexes');
    
    console.log('\n✅ Subscriber table created successfully!');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

createSubscriberTable();
