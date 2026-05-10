// Test all India AI tables
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAllTables() {
  try {
    console.log('=== Testing All India AI Tables ===\n');
    
    // Test GovernmentScheme
    const schemes = await prisma.governmentScheme.findMany();
    console.log(`✅ GovernmentScheme: ${schemes.length} records`);
    
    // Test PolicyUpdate
    const policies = await prisma.policyUpdate.findMany();
    console.log(`✅ PolicyUpdate: ${policies.length} records`);
    
    // Test AIResearcher
    const researchers = await prisma.aIResearcher.findMany();
    console.log(`✅ AIResearcher: ${researchers.length} records`);
    
    // Test IndianAITool
    const tools = await prisma.indianAITool.findMany();
    console.log(`✅ IndianAITool: ${tools.length} records`);
    
    // Test FeaturedFounder
    const founders = await prisma.featuredFounder.findMany();
    console.log(`✅ FeaturedFounder: ${founders.length} records`);
    
    console.log('\n🎉 All tables working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testAllTables();
