require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkStatuses() {
  console.log('🔍 Checking startup statuses...\n');
  
  try {
    const startups = await sql`
      SELECT 
        s.id, 
        s.name, 
        s.slug,
        s."claimStatus",
        s."isVerified",
        s."ownerId",
        f.name as "founderName",
        f.email as "founderEmail"
      FROM "Startup" s
      LEFT JOIN "FounderUser" f ON f.id = s."ownerId"
      WHERE s."ownerId" IS NOT NULL
      ORDER BY s."createdAt" DESC
      LIMIT 20
    `;
    
    console.log('📊 Founder-Submitted Startups:\n');
    console.log('═'.repeat(80));
    
    const statusCounts = {
      UNCLAIMED: 0,
      PENDING: 0,
      CLAIMED: 0,
      VERIFIED: 0,
      REJECTED: 0
    };
    
    startups.forEach((s, i) => {
      const statusEmoji = {
        UNCLAIMED: '⚪',
        PENDING: '🟡',
        CLAIMED: '🟢',
        VERIFIED: '🔵',
        REJECTED: '🔴'
      }[s.claimStatus] || '❓';
      
      console.log(`${i + 1}. ${statusEmoji} ${s.name}`);
      console.log(`   Status: ${s.claimStatus}`);
      console.log(`   Verified: ${s.isVerified ? '✓' : '✗'}`);
      console.log(`   Founder: ${s.founderName} (${s.founderEmail})`);
      console.log(`   Slug: ${s.slug}`);
      console.log('');
      
      statusCounts[s.claimStatus] = (statusCounts[s.claimStatus] || 0) + 1;
    });
    
    console.log('═'.repeat(80));
    console.log('\n📈 Status Summary:');
    console.log(`   ⚪ UNCLAIMED: ${statusCounts.UNCLAIMED}`);
    console.log(`   🟡 PENDING: ${statusCounts.PENDING} ← Approve/Reject buttons show for these`);
    console.log(`   🟢 CLAIMED: ${statusCounts.CLAIMED}`);
    console.log(`   🔵 VERIFIED: ${statusCounts.VERIFIED}`);
    console.log(`   🔴 REJECTED: ${statusCounts.REJECTED}`);
    
    if (statusCounts.PENDING === 0) {
      console.log('\n⚠️  No PENDING startups found!');
      console.log('   To test approve/reject:');
      console.log('   1. Submit a new startup from founder portal');
      console.log('   2. Or run: UPDATE "Startup" SET "claimStatus" = \'PENDING\' WHERE slug = \'your-slug\';');
    } else {
      console.log(`\n✅ Found ${statusCounts.PENDING} PENDING startup(s) - buttons should be visible!`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStatuses();
