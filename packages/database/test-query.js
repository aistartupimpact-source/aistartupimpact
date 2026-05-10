// Test the exact query from the admin page
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testQuery() {
  try {
    console.log('=== Testing GovernmentScheme.findMany() ===\n');
    
    const schemes = await prisma.governmentScheme.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    console.log(`✅ Success! Found ${schemes.length} schemes`);
    console.log('\nFirst scheme:');
    console.log(JSON.stringify(schemes[0], null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testQuery();
