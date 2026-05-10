require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const { neon } = require('@neondatabase/serverless');
const { PrismaNeonHttp } = require('@prisma/adapter-neon');

async function testQuery() {
  console.log('🔍 Testing Prisma query with fixed adapter...\n');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const adapter = new PrismaNeonHttp(sql);
    const prisma = new PrismaClient({ adapter });
    
    console.log('Querying startup: ai-startup-impact');
    const startup = await prisma.startup.findUnique({
      where: { slug: 'ai-startup-impact' },
    });
    
    console.log('✅ Success!');
    console.log('Startup name:', startup?.name);
    console.log('createdAt:', startup?.createdAt);
    console.log('updatedAt:', startup?.updatedAt);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuery();
