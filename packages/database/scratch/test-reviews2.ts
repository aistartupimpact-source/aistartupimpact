import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!, { fetchOptions: { cache: 'no-store' } });

async function check() {
  const toolId = '249f2db3-cc85-4e84-9a51-cebdf61c3197';
  const userReviews = await sql`
      SELECT r.id, r.rating, r.title, r.body, r."publishedAt"::text AS "publishedAt", r."helpfulCount",
             u.name AS "authorName", u.role AS "authorRole"
      FROM "ToolReview" r
      JOIN "User" u ON u.id = r."userId"
      WHERE r."toolId" = ${toolId} AND r.status = 'APPROVED'
      ORDER BY r."helpfulCount" DESC, r."publishedAt" DESC
    `;
  console.log("Joined:", userReviews);
}
check();
