require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { PrismaClient } = require('@prisma/client');
const { neon } = require('@neondatabase/serverless');
const { PrismaNeonHTTP } = require('@prisma/adapter-neon');

async function testQuery() {
  console.log('🔍 Testing Prisma raw query...\n');
  
  try {
    const sql = neon(process.env.DATABASE_URL);
    const adapter = new PrismaNeonHTTP(sql);
    const prisma = new PrismaClient({ adapter });
    
    console.log('Querying startup with raw SQL: ai-startup-impact');
    const startups = await prisma.$queryRaw`
      SELECT 
        id, name, slug, tagline, description, "websiteUrl", "logoUrl",
        stage, "foundedYear", "headquartersCity", "employeeCount", founders
      FROM "Startup"
      WHERE slug = ${'ai-startup-impact'}
      LIMIT 1
    `;
    
    console.log('✅ Success!');
    console.log('Startup:', startups[0]);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  }
}

testQuery();
