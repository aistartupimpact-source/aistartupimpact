import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function fixTermsColumn() {
  console.log('🔧 Fixing termsAcceptedAt column...');
  
  try {
    // First, check the current state
    console.log('\n📊 Checking current data...');
    const before = await sql`
      SELECT id, email, "termsAcceptedAt"
      FROM "WebUser"
      LIMIT 3
    `;
    console.log('Before:', JSON.stringify(before, null, 2));
    
    // Drop the column
    console.log('\n🗑️  Dropping termsAcceptedAt column...');
    await sql`
      ALTER TABLE "WebUser"
      DROP COLUMN IF EXISTS "termsAcceptedAt"
    `;
    console.log('✅ Column dropped');
    
    // Recreate the column
    console.log('\n➕ Creating termsAcceptedAt column...');
    await sql`
      ALTER TABLE "WebUser"
      ADD COLUMN "termsAcceptedAt" TIMESTAMPTZ
    `;
    console.log('✅ Column created');
    
    // Verify
    console.log('\n📊 Verifying...');
    const after = await sql`
      SELECT id, email, "termsAcceptedAt"
      FROM "WebUser"
      LIMIT 3
    `;
    console.log('After:', JSON.stringify(after, null, 2));
    
    console.log('\n✅ All done! Column is now clean.');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixTermsColumn();
