// Verify database has clean data with a completely fresh client
const { PrismaClient } = require('@prisma/client');

async function verify() {
  const prisma = new PrismaClient();
  
  try {
    console.log('=== Verifying Clean Data ===\n');
    
    // Test each table
    console.log('Testing GovernmentScheme...');
    const schemes = await prisma.governmentScheme.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    console.log(`✅ GovernmentScheme: ${schemes.length} records`);
    if (schemes.length > 0) {
      console.log(`   First: ${schemes[0].shortName} - createdAt: ${schemes[0].createdAt}`);
    }
    
    console.log('\nTesting PolicyUpdate...');
    const policies = await prisma.policyUpdate.findMany();
    console.log(`✅ PolicyUpdate: ${policies.length} records`);
    
    console.log('\nTesting AIResearcher...');
    const researchers = await prisma.aIResearcher.findMany();
    console.log(`✅ AIResearcher: ${researchers.length} records`);
    
    console.log('\nTesting IndianAITool...');
    const tools = await prisma.indianAITool.findMany();
    console.log(`✅ IndianAITool: ${tools.length} records`);
    
    console.log('\nTesting FeaturedFounder...');
    const founders = await prisma.featuredFounder.findMany();
    console.log(`✅ FeaturedFounder: ${founders.length} records`);
    
    console.log('\n🎉 All tables verified successfully!');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nThis means there is still corrupted data in the database.');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
