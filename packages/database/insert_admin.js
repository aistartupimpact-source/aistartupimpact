const { Pool } = require('pg');

const DO_URL = "postgresql://neondb_owner:npg_VPma5rRiXJ7I@ep-restless-shadow-a1jxwm0a.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function main() {
  const pool = new Pool({
    connectionString: DO_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();

  try {
    const email = 'lahorivenkatesh709@gmail.com';
    const slug = 'venkatesh-admin-' + Date.now().toString().slice(-4);

    // Check if exists
    const res = await client.query('SELECT id, role FROM "User" WHERE email = $1', [email]);

    if (res.rows.length > 0) {
      if (res.rows[0].role !== 'SUPER_ADMIN') {
        await client.query('UPDATE "User" SET role = $1 WHERE email = $2', ['SUPER_ADMIN', email]);
        console.log('✅ Updated existing user to SUPER_ADMIN');
      } else {
        console.log('✅ User already exists and is SUPER_ADMIN');
      }
    } else {
      // Insert new
      const insertQuery = `
        INSERT INTO "User" (id, email, name, role, slug, "isActive", "updatedAt") 
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())
      `;
      await client.query(insertQuery, [email, 'Venkatesh', 'SUPER_ADMIN', slug, true]);
      console.log('✅ Created new SUPER_ADMIN user');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
