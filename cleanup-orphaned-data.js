const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function cleanupOrphanedData() {
  console.log('🧹 Cleaning up orphaned startups and tools...\n');
  
  try {
    // Find orphaned startups (ownerId is not null but founder doesn't exist)
    const orphanedStartups = await sql`
      SELECT s.id, s.name, s."ownerId"
      FROM "Startup" s
      LEFT JOIN "FounderUser" f ON s."ownerId" = f.id
      WHERE s."ownerId" IS NOT NULL AND f.id IS NULL
    `;
    
    console.log(`📊 Found ${orphanedStartups.length} orphaned startups`);
    if (orphanedStartups.length > 0) {
      orphanedStartups.forEach(s => {
        console.log(`   - ${s.name} (ownerId: ${s.ownerId})`);
      });
    }
    
    // Find orphaned tools
    const orphanedTools = await sql`
      SELECT t.id, t.name, t."ownerId"
      FROM "AiTool" t
      LEFT JOIN "FounderUser" f ON t."ownerId" = f.id
      WHERE t."ownerId" IS NOT NULL AND f.id IS NULL
    `;
    
    console.log(`\n📊 Found ${orphanedTools.length} orphaned tools`);
    if (orphanedTools.length > 0) {
      orphanedTools.forEach(t => {
        console.log(`   - ${t.name} (ownerId: ${t.ownerId})`);
      });
    }
    
    if (orphanedStartups.length === 0 && orphanedTools.length === 0) {
      console.log('\n✅ No orphaned data found! Database is clean.');
      return;
    }
    
    console.log('\n⚠️  Deleting orphaned data...');
    
    // Delete orphaned startups
    if (orphanedStartups.length > 0) {
      const deletedStartups = await sql`
        DELETE FROM "Startup"
        WHERE "ownerId" IS NOT NULL 
        AND "ownerId" NOT IN (SELECT id FROM "FounderUser")
        RETURNING id, name
      `;
      console.log(`\n✅ Deleted ${deletedStartups.length} orphaned startups:`);
      deletedStartups.forEach(s => console.log(`   - ${s.name}`));
    }
    
    // Delete orphaned tools
    if (orphanedTools.length > 0) {
      const deletedTools = await sql`
        DELETE FROM "AiTool"
        WHERE "ownerId" IS NOT NULL 
        AND "ownerId" NOT IN (SELECT id FROM "FounderUser")
        RETURNING id, name
      `;
      console.log(`\n✅ Deleted ${deletedTools.length} orphaned tools:`);
      deletedTools.forEach(t => console.log(`   - ${t.name}`));
    }
    
    console.log('\n✅ Cleanup complete!');
    console.log('✅ Orphaned startups and tools are now removed from the website');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

cleanupOrphanedData().catch(console.error);
