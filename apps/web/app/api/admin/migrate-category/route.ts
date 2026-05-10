import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  try {
    console.log('[migrate-category] Starting migration...');
    
    // Add category column
    await sql`
      ALTER TABLE "Startup" 
      ADD COLUMN IF NOT EXISTS category VARCHAR(100)
    `;
    console.log('[migrate-category] Category column added');
    
    // Add index
    await sql`
      CREATE INDEX IF NOT EXISTS "Startup_category_idx" 
      ON "Startup"(category)
    `;
    console.log('[migrate-category] Index created');
    
    // Verify
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'Startup' AND column_name = 'category'
    `;
    
    console.log('[migrate-category] Migration completed successfully');
    
    return NextResponse.json({ 
      success: true,
      message: 'Category column added successfully!',
      verification: result
    });
    
  } catch (error: any) {
    console.error('[migrate-category] Migration failed:', error);
    
    return NextResponse.json({ 
      success: false,
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Send a POST request to run the migration',
    instructions: [
      '1. Send POST request to this endpoint',
      '2. Migration will add category column to Startup table',
      '3. After success, you can select and save categories',
      '4. Selected categories will display on startup pages'
    ]
  });
}
