require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Checking database data...');
  
  try {
    // Check Startup table structure
    console.log('\n📊 Checking Startup table...');
    const startupInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Startup' AND column_name = 'createdAt'
    `;
    console.log('Column info:', startupInfo);
    
    // Try to get a startup with raw query
    console.log('\n📝 Fetching sample startup (raw)...');
    const rawStartup = await prisma.$queryRaw`
      SELECT id, name, "createdAt"
      FROM "Startup"
      LIMIT 1
    `;
    console.log('Raw startup:', rawStartup);
    
    // Try with Prisma client
    console.log('\n📝 Fetching sample startup (Prisma)...');
    try {
      const prismaStartup = await prisma.startup.findFirst({
        select: {
          id: true,
          name: true,
          createdAt: true,
        }
      });
      console.log('Prisma startup:', prismaStartup);
    } catch (error) {
      console.error('Prisma error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
