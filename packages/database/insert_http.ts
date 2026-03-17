import { neon } from '@neondatabase/serverless';

async function main() {
  console.log("Inserting user via Neon HTTP DB directly...");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");
  const sql = neon(url);

  try {
    const email = 'lahorivenkatesh709@gmail.com';
    const slug = 'venkatesh-admin-' + Date.now().toString().slice(-4);

    // Check if exists
    const res = await sql`SELECT id, role FROM "User" WHERE email = ${email}`;

    if (res.length > 0) {
      if (res[0].role !== 'SUPER_ADMIN') {
        await sql`UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = ${email}`;
        console.log('✅ Updated existing user to SUPER_ADMIN!');
      } else {
        console.log('✅ User already exists and is SUPER_ADMIN!');
      }
    } else {
      // Insert new
      const insertQuery = await sql`
                INSERT INTO "User" (id, email, name, role, slug, "isActive", "updatedAt") 
                VALUES (gen_random_uuid(), ${email}, 'Venkatesh', 'SUPER_ADMIN', ${slug}, true, NOW())
                RETURNING id;
            `;
      console.log('✅ Created new SUPER_ADMIN user! ID:', insertQuery[0].id);
    }
  } catch (err) {
    console.error("DB Error:", err);
  }
}

main();
