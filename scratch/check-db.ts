import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL!);

async function run() {
  try {
    const aiToolCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'AiTool'`;
    console.log("AiTool columns:");
    console.table(aiToolCols);

    const startupCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Startup'`;
    console.log("Startup columns:");
    console.table(startupCols);
  } catch(e) {
    console.error(e);
  }
}
run();
