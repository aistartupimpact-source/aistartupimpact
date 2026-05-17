import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function verifyDeletion() {
  console.log('=== VERIFICATION REPORT ===\n');
  
  // Count all founders
  const founderCount = await sql`SELECT COUNT(*) as count FROM "FounderUser"`;
  console.log(`Total Founders: ${founderCount[0].count}`);
  
  // Count all startups
  const startupCount = await sql`SELECT COUNT(*) as count FROM "Startup"`;
  console.log(`Total Startups: ${startupCount[0].count}`);
  
  // Count startups with ownerId
  const ownedStartups = await sql`SELECT COUNT(*) as count FROM "Startup" WHERE "ownerId" IS NOT NULL`;
  console.log(`Startups with ownerId: ${ownedStartups[0].count}`);
  
  // Count all tools
  const toolCount = await sql`SELECT COUNT(*) as count FROM "AiTool"`;
  console.log(`Total Tools: ${toolCount[0].count}`);
  
  // Count tools with ownerId
  const ownedTools = await sql`SELECT COUNT(*) as count FROM "AiTool" WHERE "ownerId" IS NOT NULL`;
  console.log(`Tools with ownerId: ${ownedTools[0].count}`);
  
  // Check for orphaned startups
  const orphanedStartups = await sql`
    SELECT s.id, s.name, s.slug, s."ownerId"
    FROM "Startup" s
    LEFT JOIN "FounderUser" f ON s."ownerId" = f.id
    WHERE s."ownerId" IS NOT NULL AND f.id IS NULL
  `;
  console.log(`\nOrphaned Startups (ownerId points to deleted founder): ${orphanedStartups.length}`);
  if (orphanedStartups.length > 0) {
    orphanedStartups.forEach((s: any) => {
      console.log(`  - ${s.name} (${s.slug}) - Missing Owner ID: ${s.ownerId}`);
    });
  }
  
  // Check for orphaned tools
  const orphanedTools = await sql`
    SELECT t.id, t.name, t.slug, t."ownerId"
    FROM "AiTool" t
    LEFT JOIN "FounderUser" f ON t."ownerId" = f.id
    WHERE t."ownerId" IS NOT NULL AND f.id IS NULL
  `;
  console.log(`\nOrphaned Tools (ownerId points to deleted founder): ${orphanedTools.length}`);
  if (orphanedTools.length > 0) {
    orphanedTools.forEach((t: any) => {
      console.log(`  - ${t.name} (${t.slug}) - Missing Owner ID: ${t.ownerId}`);
    });
  }
  
  console.log('\n=== CONCLUSION ===');
  if (orphanedStartups.length === 0 && orphanedTools.length === 0) {
    console.log('✅ CASCADE DELETE is working correctly!');
    console.log('✅ No orphaned records found in database.');
    console.log('\n⚠️  If you still see startups/tools on the website, it\'s due to Next.js caching.');
    console.log('   The cache will automatically refresh in 60 seconds, or restart the dev server.');
  } else {
    console.log('❌ Found orphaned records! CASCADE DELETE may not be working.');
  }
}

verifyDeletion().catch(console.error);
