// Update JobApplication table to make mobile field nullable
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function updateJobApplicationTable() {
  try {
    console.log('Updating JobApplication table...');
    
    // Make mobile field nullable
    await sql`
      ALTER TABLE "JobApplication" 
      ALTER COLUMN mobile DROP NOT NULL
    `;
    console.log('✓ Made mobile field nullable');
    
    console.log('\n✅ JobApplication table updated successfully!');
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

updateJobApplicationTable();
