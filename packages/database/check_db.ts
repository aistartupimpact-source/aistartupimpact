import { neon } from '@neondatabase/serverless';

async function checkUser() {
  console.log("Checking Neon DB directly...");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");
  const sql = neon(url);

  try {
    const users = await sql`SELECT email, role, "isActive" FROM "User"`;
    console.log("All Users currently in DB:", users);

    const target = await sql`SELECT * FROM "User" WHERE email = 'lahorivenkatesh709@gmail.com'`;
    console.log("Target user lookup:", target);
  } catch (err) {
    console.error("DB Error:", err);
  }
}

checkUser();
