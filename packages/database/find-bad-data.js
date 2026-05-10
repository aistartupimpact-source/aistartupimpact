require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function findBadData() {
  console.log('🔍 Looking for corrupted data...\n');
  
  try {
    // Check for NULL or invalid createdAt in Startup
    console.log('Checking Startup table...');
    const badStartups = await sql`
      SELECT id, name, slug, "createdAt"
      FROM "Startup"
      WHERE "createdAt" IS NULL
      LIMIT 10
    `;
    
    if (badStartups.length > 0) {
      console.log(`❌ Found ${badStartups.length} startups with NULL createdAt:`);
      badStartups.forEach(s => {
        console.log(`  - ${s.name} (${s.slug}): createdAt = ${s.createdAt}`);
      });
      
      // Fix them
      console.log('\n🔧 Fixing...');
      await sql`
        UPDATE "Startup"
        SET "createdAt" = NOW(), "updatedAt" = NOW()
        WHERE "createdAt" IS NULL
      `;
      console.log('✅ Fixed!');
    } else {
      console.log('✅ No NULL createdAt found in Startup table');
    }
    
    // Check for NULL or invalid createdAt in AiTool
    console.log('\nChecking AiTool table...');
    const badTools = await sql`
      SELECT id, name, slug, "createdAt"
      FROM "AiTool"
      WHERE "createdAt" IS NULL
      LIMIT 10
    `;
    
    if (badTools.length > 0) {
      console.log(`❌ Found ${badTools.length} tools with NULL createdAt:`);
      badTools.forEach(t => {
        console.log(`  - ${t.name} (${t.slug}): createdAt = ${t.createdAt}`);
      });
      
      // Fix them
      console.log('\n🔧 Fixing...');
      await sql`
        UPDATE "AiTool"
        SET "createdAt" = NOW(), "updatedAt" = NOW()
        WHERE "createdAt" IS NULL
      `;
      console.log('✅ Fixed!');
    } else {
      console.log('✅ No NULL createdAt found in AiTool table');
    }
    
    // Check for NULL or invalid createdAt in Article
    console.log('\nChecking Article table...');
    const badArticles = await sql`
      SELECT id, title, slug, "createdAt"
      FROM "Article"
      WHERE "createdAt" IS NULL
      LIMIT 10
    `;
    
    if (badArticles.length > 0) {
      console.log(`❌ Found ${badArticles.length} articles with NULL createdAt:`);
      badArticles.forEach(a => {
        console.log(`  - ${a.title} (${a.slug}): createdAt = ${a.createdAt}`);
      });
      
      // Fix them
      console.log('\n🔧 Fixing...');
      await sql`
        UPDATE "Article"
        SET "createdAt" = NOW(), "updatedAt" = NOW()
        WHERE "createdAt" IS NULL
      `;
      console.log('✅ Fixed!');
    } else {
      console.log('✅ No NULL createdAt found in Article table');
    }
    
    console.log('\n✅ All done!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findBadData();
