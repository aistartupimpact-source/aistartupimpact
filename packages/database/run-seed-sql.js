// Run SQL seed file using Prisma
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runSeedSQL() {
  try {
    console.log('=== Running India AI Seed Script ===\n');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'seed-india-ai-complete.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by semicolons and filter out comments and empty statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          await prisma.$executeRawUnsafe(statement);
          const preview = statement.substring(0, 60).replace(/\n/g, ' ');
          console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error('Statement:', statement.substring(0, 200));
        }
      }
    }
    
    console.log('\n=== Verifying Data ===\n');
    
    // Verify the data
    const schemes = await prisma.governmentScheme.count();
    const policies = await prisma.policyUpdate.count();
    const researchers = await prisma.aIResearcher.count();
    const tools = await prisma.indianAITool.count();
    const founders = await prisma.featuredFounder.count();
    
    console.log(`✅ GovernmentScheme: ${schemes} records`);
    console.log(`✅ PolicyUpdate: ${policies} records`);
    console.log(`✅ AIResearcher: ${researchers} records`);
    console.log(`✅ IndianAITool: ${tools} records`);
    console.log(`✅ FeaturedFounder: ${founders} records`);
    
    console.log('\n🎉 Seed completed successfully!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runSeedSQL();
