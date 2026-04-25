import { neon } from "@neondatabase/serverless";
import ToolReviewsClient from "./ToolReviewsClient";

export const metadata = {
  title: "Tool Reviews | AIStartupImpact Admin",
};

export default async function ToolReviewsPage() {
  const sql = neon(process.env.DATABASE_URL!);
  
  const rawReviews = await sql`
     SELECT 
       r.id, r.rating, r.title, r.body, r.status, r."proofImageUrl", r."createdAt"::text AS "createdAt",
       u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar,
       t.name AS tool_name, t.slug AS tool_slug
     FROM "ToolReview" r
     LEFT JOIN "User" u ON u.id = r."userId"
     LEFT JOIN "AiTool" t ON t.id = r."toolId"
     ORDER BY r."createdAt" DESC
  `;

  // Map to match the expected formatting
  const reviews = rawReviews.map((r: any) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    status: r.status,
    proofImageUrl: r.proofImageUrl,
    createdAt: r.createdAt,
    user: { name: r.user_name, email: r.user_email, avatar: r.user_avatar },
    tool: { name: r.tool_name, slug: r.tool_slug }
  }));

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-sora font-bold text-navy dark:text-white">Tool Reviews Moderation</h1>
          <p className="text-gray-500 font-jakarta mt-1">Manage, approve, or flag user reviews written across all AI Tools.</p>
        </div>
      </div>

      <ToolReviewsClient initialReviews={reviews} />
    </div>
  );
}
