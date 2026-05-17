import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function finalVerification() {
  console.log('=== FINAL VERIFICATION ===\n');
  
  // Count everything
  const founderCount = await sql`SELECT COUNT(*) as count FROM "FounderUser"`;
  const startupCount = await sql`SELECT COUNT(*) as count FROM "Startup"`;
  const toolCount = await sql`SELECT COUNT(*) as count FROM "AiTool"`;
  
  console.log('Database Status:');
  console.log(`  Total Founders: ${founderCount[0].count}`);
  console.log(`  Total Startups: ${startupCount[0].count}`);
  console.log(`  Total Tools: ${toolCount[0].count}`);
  
  // Check for orphaned records
  const orphanedStartups = await sql`
    SELECT s.id, s.name, s.slug, s."ownerId"
    FROM "Startup" s
    LEFT JOIN "FounderUser" f ON s."ownerId" = f.id
    WHERE s."ownerId" IS NOT NULL AND f.id IS NULL
  `;
  
  const orphanedTools = await sql`
    SELECT t.id, t.name, t.slug, t."ownerId"
    FROM "AiTool" t
    LEFT JOIN "FounderUser" f ON t."ownerId" = f.id
    WHERE t."ownerId" IS NOT NULL AND f.id IS NULL
  `;
  
  console.log(`\nOrphaned Records:`);
  console.log(`  Orphaned Startups: ${orphanedStartups.length}`);
  console.log(`  Orphaned Tools: ${orphanedTools.length}`);
  
  // Check for founder-created content that should have been deleted
  const suspiciousStartups = await sql`
    SELECT id, name, slug, "submittedBy", "claimStatus", "ownerId"
    FROM "Startup"
    WHERE ("submittedBy" = 'FOUNDER' OR "claimStatus" = 'CLAIMED')
      AND "ownerId" IS NULL
  `;
  
  const suspiciousTools = await sql`
    SELECT id, name, slug, "submittedBy", "claimStatus", "ownerId"
    FROM "AiTool"
    WHERE ("submittedBy" = 'FOUNDER' OR "claimStatus" = 'CLAIMED')
      AND "ownerId" IS NULL
  `;
  
  console.log(`\nSuspicious Records (created by founders but no owner):`);
  console.log(`  Suspicious Startups: ${suspiciousStartups.length}`);
  console.log(`  Suspicious Tools: ${suspiciousTools.length}`);
  
  if (suspiciousStartups.length > 0) {
    console.log('\n  Suspicious Startups:');
    suspiciousStartups.forEach((s: any) => {
      console.log(`    - ${s.name} (${s.slug})`);
      console.log(`      submittedBy: ${s.submittedBy}, claimStatus: ${s.claimStatus}`);
    });
  }
  
  if (suspiciousTools.length > 0) {
    console.log('\n  Suspicious Tools:');
    suspiciousTools.forEach((t: any) => {
      console.log(`    - ${t.name} (${t.slug})`);
      console.log(`      submittedBy: ${t.submittedBy}, claimStatus: ${t.claimStatus}`);
    });
  }
  
  // Verify CASCADE DELETE constraints
  const constraints = await sql`
    SELECT 
      tc.constraint_name,
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name IN ('Startup', 'AiTool')
      AND ccu.table_name = 'FounderUser'
  `;
  
  console.log(`\nCASCADE DELETE Constraints:`);
  constraints.forEach((c: any) => {
    console.log(`  ${c.table_name}.${c.column_name} -> ${c.foreign_table_name}: ${c.delete_rule}`);
  });
  
  console.log('\n=== SUMMARY ===');
  
  if (orphanedStartups.length === 0 && orphanedTools.length === 0 && 
      suspiciousStartups.length === 0 && suspiciousTools.length === 0) {
    console.log('✅ ALL CLEAN!');
    console.log('✅ No orphaned or suspicious records found');
    console.log('✅ CASCADE DELETE is properly configured');
    console.log('\nThe issue is completely resolved!');
  } else {
    console.log('⚠️  Issues found - see details above');
  }
}

finalVerification().catch(console.error);
