import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function fixTermsAccepted() {
  console.log('🔧 Fixing termsAcceptedAt column...');
  
  try {
    // Update all users to have NULL for termsAcceptedAt
    const result = await sql`
      UPDATE "WebUser"
      SET "termsAcceptedAt" = NULL
      WHERE "termsAcceptedAt" IS NOT NULL
    `;
    
    console.log('✅ Fixed termsAcceptedAt for all users');
    console.log('📊 Rows affected:', result);
    
    // Verify the fix
    const users = await sql`
      SELECT id, email, name, "termsAcceptedAt"
      FROM "WebUser"
      LIMIT 5
    `;
    
    console.log('\n📋 Sample users after fix:');
    users.forEach((user: any) => {
      console.log(`  - ${user.email}: termsAcceptedAt = ${user.termsAcceptedAt}`);
    });
    
    console.log('\n✅ All done! Users can now accept terms.');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixTermsAccepted();
