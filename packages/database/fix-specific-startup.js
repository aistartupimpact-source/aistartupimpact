require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixSpecificStartup() {
  console.log('🔍 Checking startup: ai-startup-impact\n');
  
  try {
    // Check the specific startup
    const startup = await sql`
      SELECT id, name, slug, "createdAt", "updatedAt", pg_typeof("createdAt") as created_type, pg_typeof("updatedAt") as updated_type
      FROM "Startup"
      WHERE slug = 'ai-startup-impact'
    `;
    
    console.log('Startup data:', startup);
    
    if (startup.length === 0) {
      console.log('❌ Startup not found');
      return;
    }
    
    // Check all columns for this startup
    const allData = await sql`
      SELECT *
      FROM "Startup"
      WHERE slug = 'ai-startup-impact'
    `;
    
    console.log('\nAll columns:', Object.keys(allData[0]));
    console.log('\ncreatedAt value:', allData[0].createdAt);
    console.log('updatedAt value:', allData[0].updatedAt);
    
    // Try to fix if needed
    if (!allData[0].createdAt || allData[0].createdAt === '{}') {
      console.log('\n🔧 Fixing corrupted timestamps...');
      await sql`
        UPDATE "Startup"
        SET "createdAt" = NOW(), "updatedAt" = NOW()
        WHERE slug = 'ai-startup-impact'
      `;
      console.log('✅ Fixed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

fixSpecificStartup();
