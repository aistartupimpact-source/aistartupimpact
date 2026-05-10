require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixSearchVector() {
  console.log('🔍 Fixing search vector...\n');
  
  try {
    // Check if searchVector column exists
    console.log('Checking if searchVector column exists...');
    const columns = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'Startup' AND column_name = 'searchVector'
    `;
    
    if (columns.length === 0) {
      console.log('❌ searchVector column does not exist. Creating it...');
      
      // Add searchVector column
      await sql`
        ALTER TABLE "Startup"
        ADD COLUMN IF NOT EXISTS "searchVector" tsvector
      `;
      console.log('✅ Added searchVector column');
      
      // Create GIN index
      await sql`
        CREATE INDEX IF NOT EXISTS "Startup_searchVector_idx"
        ON "Startup" USING GIN ("searchVector")
      `;
      console.log('✅ Created GIN index');
      
      // Populate existing data
      await sql`
        UPDATE "Startup"
        SET "searchVector" = 
          setweight(to_tsvector('english', COALESCE(name, '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(tagline, '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(description, '')), 'C')
      `;
      console.log('✅ Populated searchVector for existing startups');
    } else {
      console.log('✅ searchVector column already exists');
    }
    
    // Check if trigger exists
    console.log('\nChecking triggers...');
    const triggers = await sql`
      SELECT trigger_name
      FROM information_schema.triggers
      WHERE event_object_table = 'Startup' AND trigger_name = 'startup_search_vector_update'
    `;
    
    if (triggers.length === 0) {
      console.log('❌ Trigger does not exist. Creating it...');
      
      // Create trigger function
      await sql`
        CREATE OR REPLACE FUNCTION update_startup_search_vector()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW."searchVector" := 
            setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
            setweight(to_tsvector('english', COALESCE(NEW.tagline, '')), 'B') ||
            setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `;
      console.log('✅ Created trigger function');
      
      // Create trigger
      await sql`
        CREATE TRIGGER startup_search_vector_update
        BEFORE INSERT OR UPDATE ON "Startup"
        FOR EACH ROW
        EXECUTE FUNCTION update_startup_search_vector();
      `;
      console.log('✅ Created trigger');
    } else {
      console.log('✅ Trigger already exists');
    }
    
    console.log('\n✅ All done! Search functionality is ready.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

fixSearchVector();
