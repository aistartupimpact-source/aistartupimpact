import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("Adding helpfulCount column via neon HTTP...");
    await sql`ALTER TABLE "ToolReview" ADD COLUMN IF NOT EXISTS "helpfulCount" INTEGER NOT NULL DEFAULT 0;`;
    console.log("Success!");
  } catch(e) {
    console.error("Error modifying table:", e);
  }
}

main();
