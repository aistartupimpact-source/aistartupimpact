// Direct database inspection script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function inspectDatabase() {
  try {
    console.log('=== Inspecting GovernmentScheme table ===\n');
    
    // Try to get raw data without type checking first
    const result = await prisma.$queryRaw`
      SELECT id, name, "createdAt"::text as created_at_text, "updatedAt"::text as updated_at_text
      FROM "GovernmentScheme"
      LIMIT 5
    `;
    
    console.log('Raw query result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

inspectDatabase();
