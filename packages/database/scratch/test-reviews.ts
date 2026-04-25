import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function check() {
  const reviews = await sql`SELECT * FROM "ToolReview"`;
  console.log("All Reviews:", reviews);
}
check();
