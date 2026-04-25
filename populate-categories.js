// Populate categories for existing startups
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function populateCategories() {
  try {
    console.log('Populating categories for existing startups...');
    
    // Get all startups without categories
    const startups = await sql`
      SELECT id, name, tagline, description
      FROM "Startup"
      WHERE "deletedAt" IS NULL AND category IS NULL
    `;
    
    console.log(`Found ${startups.length} startups without categories`);
    
    // Update each one individually to avoid trigger issues
    let updated = 0;
    for (const startup of startups) {
      const combined = `${startup.name} ${startup.tagline || ''} ${startup.description || ''}`.toLowerCase();
      
      let category = null;
      if (combined.includes('llm') || combined.includes('language model') || combined.includes('indic')) {
        category = 'Indic LLM';
      } else if (combined.includes('infrastructure') || combined.includes('cloud') || combined.includes('compute')) {
        category = 'AI Infrastructure';
      } else if (combined.includes('health') || combined.includes('medical')) {
        category = 'Health AI';
      } else if (combined.includes('fintech') || combined.includes('finance')) {
        category = 'FinTech AI';
      } else if (combined.includes('sales') || combined.includes('crm')) {
        category = 'Sales AI';
      } else if (combined.includes('data') || combined.includes('analytics')) {
        category = 'Data AI';
      } else if (combined.includes('devtools') || combined.includes('developer')) {
        category = 'DevTools AI';
      } else if (combined.includes('education') || combined.includes('edtech')) {
        category = 'EdTech AI';
      }
      
      if (category) {
        await sql`UPDATE "Startup" SET category = ${category} WHERE id = ${startup.id}`;
        updated++;
        console.log(`✓ ${startup.name} → ${category}`);
      }
    }
    
    console.log(`\n✅ Updated ${updated} startups with categories`);
    
    // Show distribution
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
    
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

populateCategories();
