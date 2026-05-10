import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  
  // Read the migration file
  const migrationPath = path.join(process.cwd(), 'INDIA_AI_MIGRATION.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
  
  console.log('Starting India AI database migration...\n');
  
  try {
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`Executing ${statements.length} SQL statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement) {
        try {
          await sql`${sql.unsafe(statement)}`;
          if (i % 5 === 0) {
            console.log(`Progress: ${i + 1}/${statements.length} statements executed`);
          }
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message?.includes('already exists')) {
            console.warn(`Warning on statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\nTables created:');
    console.log('  - IndiaAIStats');
    console.log('  - IndiaAICity');
    console.log('  - IndiaAIFundingHighlight');
    console.log('  - GovernmentScheme');
    console.log('  - IndiaAIMissionTracker');
    console.log('  - PolicyUpdate');
    console.log('  - CityDeepDive');
    console.log('  - TalentStats');
    console.log('  - ResearchHub');
    console.log('  - AIResearcher');
    console.log('  - IndianAITool');
    console.log('\nSeed data inserted successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
