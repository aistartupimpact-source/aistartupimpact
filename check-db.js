const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkFounders() {
  console.log('📊 Checking Founder Users in Database');
  console.log('=====================================\n');
  
  try {
    const founders = await sql`
      SELECT id, email, name, "emailVerified", status, "authProvider", "createdAt"
      FROM "FounderUser"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;
    
    if (founders.length === 0) {
      console.log('❌ No founders found in database\n');
      return;
    }
    
    console.log(`✅ Found ${founders.length} founder(s):\n`);
    
    founders.forEach((founder, index) => {
      console.log(`${index + 1}. ${founder.name} (${founder.email})`);
      console.log(`   Status: ${founder.status}`);
      console.log(`   Email Verified: ${founder.emailVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Auth Provider: ${founder.authProvider}`);
      console.log(`   Created: ${new Date(founder.createdAt).toLocaleString()}`);
      console.log('');
    });
    
    const unverified = founders.filter(f => !f.emailVerified);
    if (unverified.length > 0) {
      console.log(`⚠️  ${unverified.length} unverified account(s) found:`);
      unverified.forEach(f => console.log(`   - ${f.email}`));
      console.log('\nUse dev-tools to verify these accounts!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkFounders();
