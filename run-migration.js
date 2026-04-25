// Run database migration
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Temporarily disable triggers
    await sql`ALTER TABLE "Startup" DISABLE TRIGGER ALL`;
    console.log('✓ Disabled triggers');
    
    // Add category column
    await sql`
      ALTER TABLE "Startup" 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100)
    `;
    console.log('✓ Added category column');
    
    // Add useCases column
    await sql`
      ALTER TABLE "Startup" 
      ADD COLUMN IF NOT EXISTS "useCases" TEXT[]
    `;
    console.log('✓ Added useCases column');
    
    // Add employeeGrowthData column
    await sql`
      ALTER TABLE "Startup" 
      ADD COLUMN IF NOT EXISTS "employeeGrowthData" JSONB
    `;
    console.log('✓ Added employeeGrowthData column');
    
    // Add index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_startup_category ON "Startup"(category)
    `;
    console.log('✓ Created index on category');
    
    // Re-enable triggers
    await sql`ALTER TABLE "Startup" ENABLE TRIGGER ALL`;
    console.log('✓ Re-enabled triggers');
    
    // Auto-detect categories for existing startups (with triggers disabled for update)
    console.log('Auto-detecting categories for existing startups...');
    await sql`ALTER TABLE "Startup" DISABLE TRIGGER ALL`;
    
    await sql`
      UPDATE "Startup" 
      SET category = CASE
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%llm%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%language model%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%indic%' 
          THEN 'Indic LLM'
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%infrastructure%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%cloud%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%compute%' 
          THEN 'AI Infrastructure'
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%health%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%medical%' 
          THEN 'Health AI'
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%fintech%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%finance%' 
          THEN 'FinTech AI'
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%sales%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%crm%' 
          THEN 'Sales AI'
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%data%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%analytics%' 
          THEN 'Data AI'
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%devtools%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%developer%' 
          THEN 'DevTools AI'
        WHEN LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%education%' 
          OR LOWER(name || ' ' || COALESCE(description, '') || ' ' || COALESCE(tagline, '')) LIKE '%edtech%' 
          THEN 'EdTech AI'
        ELSE NULL
      END
      WHERE category IS NULL AND "deletedAt" IS NULL
    `;
    
    await sql`ALTER TABLE "Startup" ENABLE TRIGGER ALL`;
    console.log('✓ Auto-detected categories');
    
    // Show results
    const results = await sql`
      SELECT category, COUNT(*) as count 
      FROM "Startup" 
      WHERE "deletedAt" IS NULL 
      GROUP BY category 
      ORDER BY count DESC
    `;
    
    console.log('\n📊 Category Distribution:');
    results.forEach(row => {
      console.log(`  ${row.category || 'NULL'}: ${row.count}`);
    });
    
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    // Try to re-enable triggers even if migration fails
    try {
      await sql`ALTER TABLE "Startup" ENABLE TRIGGER ALL`;
    } catch (e) {}
    process.exit(1);
  }
}

runMigration();
