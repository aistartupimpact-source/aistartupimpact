require('dotenv').config({ path: '../../.env' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function restoreSearch() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🔍 Restoring search functionality...');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'prisma/migrations/20260501000000_add_fulltext_search/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Executing full migration...');
    // Execute the entire migration as one statement
    await sql.unsafe(migrationSQL);
    
    console.log('✅ Search functionality restored!');
  } catch (error) {
    console.error('❌ Error restoring search:', error.message);
    console.log('This is expected if search vectors already exist.');
  }
}

restoreSearch();
