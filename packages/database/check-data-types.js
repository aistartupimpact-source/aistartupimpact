require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkDataTypes() {
  console.log('🔍 Checking data types in database...\n');
  
  try {
    // Check actual data type of createdAt column
    console.log('Checking Startup table schema...');
    const startupSchema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'Startup' AND column_name IN ('createdAt', 'updatedAt')
    `;
    console.log('Startup columns:', startupSchema);
    
    // Get a sample startup to see actual data
    console.log('\nGetting sample startup data...');
    const sampleStartup = await sql`
      SELECT id, name, slug, "createdAt", "updatedAt"
      FROM "Startup"
      LIMIT 1
    `;
    console.log('Sample startup:', sampleStartup);
    
    // Check if there are any startups with weird createdAt values
    console.log('\nChecking for non-timestamp createdAt values...');
    const weirdData = await sql`
      SELECT id, name, slug, "createdAt", pg_typeof("createdAt") as type
      FROM "Startup"
      WHERE pg_typeof("createdAt") != 'timestamp with time zone'::regtype
      LIMIT 5
    `;
    
    if (weirdData.length > 0) {
      console.log('❌ Found startups with wrong data type:', weirdData);
    } else {
      console.log('✅ All createdAt values have correct type');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkDataTypes();
