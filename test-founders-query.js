const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function testFoundersQuery() {
  console.log('🧪 Testing Founders Query');
  console.log('=========================\n');
  
  try {
    const founders = await sql`
      SELECT 
        fu.id,
        fu.name,
        fu.email,
        fu.company,
        fu."companyDomain",
        fu.role,
        fu.phone,
        fu."authProvider",
        fu."emailVerified",
        fu.status,
        fu."onboardingCompleted",
        fu."createdAt"::text AS "createdAt",
        fu."lastLoginAt"::text AS "lastLoginAt",
        COUNT(DISTINCT s.id) AS "startupCount",
        COUNT(DISTINCT t.id) AS "toolCount"
      FROM "FounderUser" fu
      LEFT JOIN "Startup" s ON s."ownerId" = fu.id
      LEFT JOIN "AiTool" t ON t."ownerId" = fu.id
      GROUP BY fu.id
      ORDER BY fu."createdAt" DESC
    `;
    
    console.log(`✅ Query successful! Found ${founders.length} founder(s)\n`);
    
    founders.forEach((founder, index) => {
      console.log(`${index + 1}. ${founder.name} (${founder.email})`);
      console.log(`   Company: ${founder.company || 'N/A'}`);
      console.log(`   Status: ${founder.status}`);
      console.log(`   Email Verified: ${founder.emailVerified ? '✅' : '❌'}`);
      console.log(`   Auth Provider: ${founder.authProvider}`);
      console.log(`   Startups: ${founder.startupCount}`);
      console.log(`   Tools: ${founder.toolCount}`);
      console.log(`   Created: ${new Date(founder.createdAt).toLocaleString()}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Error details:', error);
  }
}

testFoundersQuery();
