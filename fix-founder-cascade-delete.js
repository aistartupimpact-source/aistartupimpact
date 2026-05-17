const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixFounderCascadeDelete() {
  console.log('🔧 Updating founder deletion to CASCADE DELETE...\n');
  
  try {
    // Step 1: Drop existing constraints
    console.log('Step 1: Dropping existing foreign key constraints...');
    
    await sql`ALTER TABLE "Startup" DROP CONSTRAINT IF EXISTS "Startup_ownerId_fkey"`;
    console.log('  ✅ Dropped Startup.ownerId constraint');
    
    await sql`ALTER TABLE "AiTool" DROP CONSTRAINT IF EXISTS "AiTool_ownerId_fkey"`;
    console.log('  ✅ Dropped AiTool.ownerId constraint');
    
    // Step 2: Add new constraints with ON DELETE CASCADE
    console.log('\nStep 2: Adding new constraints with ON DELETE CASCADE...');
    
    await sql`
      ALTER TABLE "Startup"
      ADD CONSTRAINT "Startup_ownerId_fkey"
      FOREIGN KEY ("ownerId") 
      REFERENCES "FounderUser"(id) 
      ON DELETE CASCADE
    `;
    console.log('  ✅ Added Startup.ownerId constraint with CASCADE');
    
    await sql`
      ALTER TABLE "AiTool"
      ADD CONSTRAINT "AiTool_ownerId_fkey"
      FOREIGN KEY ("ownerId") 
      REFERENCES "FounderUser"(id) 
      ON DELETE CASCADE
    `;
    console.log('  ✅ Added AiTool.ownerId constraint with CASCADE');
    
    console.log('\n✅ Foreign key constraints updated successfully!');
    console.log('\n📋 NEW BEHAVIOR:');
    console.log('   ⚠️  When a founder is deleted:');
    console.log('     • ALL their startups will be DELETED');
    console.log('     • ALL their tools will be DELETED');
    console.log('     • This is PERMANENT and CANNOT be undone');
    console.log('\n   ✅ Startups and tools will NO LONGER be visible on the website');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

fixFounderCascadeDelete().catch(console.error);
