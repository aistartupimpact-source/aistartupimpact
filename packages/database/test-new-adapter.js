require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const { Pool, neonConfig } = require('@neondatabase/serverless');
const { PrismaNeon } = require('@prisma/adapter-neon');
const ws = require('ws');

neonConfig.webSocketConstructor = ws;

async function testQuery() {
  console.log('🔍 Testing Prisma query with new adapter...\n');
  
  try {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    const prisma = new PrismaClient({ adapter });
    
    console.log('Querying startup: ai-startup-impact');
    const startup = await prisma.startup.findUnique({
      where: { slug: 'ai-startup-impact' },
    });
    
    console.log('✅ Success!');
    console.log('Startup name:', startup?.name);
    console.log('createdAt:', startup?.createdAt);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

testQuery();
