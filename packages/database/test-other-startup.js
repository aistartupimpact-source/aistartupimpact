require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const { neon } = require('@neondatabase/serverless');
const { PrismaNeonHTTP } = require('@prisma/adapter-neon');

async function testQuery() {
  console.log('🔍 Testing Prisma query with different startup...\n');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const adapter = new PrismaNeonHTTP(sql);
    const prisma = new PrismaClient({ adapter });
    
    console.log('Querying startup: krutrim');
    const startup = await prisma.startup.findUnique({
      where: { slug: 'krutrim' },
    });
    
    console.log('✅ Success!');
    console.log('Startup name:', startup?.name);
    console.log('createdAt:', startup?.createdAt);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQuery();
