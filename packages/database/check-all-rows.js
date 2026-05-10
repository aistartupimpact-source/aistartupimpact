// Check ALL rows in GovernmentScheme table
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllRows() {
  try {
    console.log('=== Checking ALL GovernmentScheme rows ===\n');
    
    // Get count
    const countResult = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "GovernmentScheme"
    `;
    console.log(`Total rows: ${countResult[0].count}\n`);
    
    // Get all rows with text conversion
    const allRows = await prisma.$queryRaw`
      SELECT 
        id, 
        name,
        "createdAt"::text as created_at_text,
        "updatedAt"::text as updated_at_text
      FROM "GovernmentScheme"
      ORDER BY id
    `;
    
    console.log('All rows:');
    allRows.forEach((row, i) => {
      console.log(`${i + 1}. ID: ${row.id}`);
      console.log(`   Name: ${row.name}`);
      console.log(`   createdAt: ${row.created_at_text}`);
      console.log(`   updatedAt: ${row.updated_at_text}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllRows();
