// Test with a completely fresh Prisma Client (no singleton)
const { PrismaClient } = require('@prisma/client');

async function testFreshClient() {
  // Create a brand new client instance
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('=== Testing with Fresh Prisma Client ===\n');
    
    const schemes = await prisma.governmentScheme.findMany({
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });
    
    console.log(`✅ Success! Found ${schemes.length} schemes\n`);
    
    schemes.forEach((scheme, i) => {
      console.log(`${i + 1}. ${scheme.shortName}`);
      console.log(`   createdAt: ${scheme.createdAt}`);
      console.log(`   updatedAt: ${scheme.updatedAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFreshClient();
