require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCreatedAt() {
  console.log('🔧 Fixing createdAt fields...');
  
  try {
    // Fix Startup table
    console.log('Fixing Startup table...');
    const startups = await prisma.$queryRaw`
      UPDATE "Startup"
      SET "createdAt" = NOW()
      WHERE "createdAt" IS NULL OR "createdAt"::text = '{}'
      RETURNING id
    `;
    console.log(`✅ Fixed ${startups.length} startups`);
    
    // Fix Article table
    console.log('Fixing Article table...');
    const articles = await prisma.$queryRaw`
      UPDATE "Article"
      SET "createdAt" = NOW()
      WHERE "createdAt" IS NULL OR "createdAt"::text = '{}'
      RETURNING id
    `;
    console.log(`✅ Fixed ${articles.length} articles`);
    
    // Fix AiTool table
    console.log('Fixing AiTool table...');
    const tools = await prisma.$queryRaw`
      UPDATE "AiTool"
      SET "createdAt" = NOW()
      WHERE "createdAt" IS NULL OR "createdAt"::text = '{}'
      RETURNING id
    `;
    console.log(`✅ Fixed ${tools.length} tools`);
    
    console.log('✅ All createdAt fields fixed!');
  } catch (error) {
    console.error('❌ Error fixing createdAt:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixCreatedAt();
