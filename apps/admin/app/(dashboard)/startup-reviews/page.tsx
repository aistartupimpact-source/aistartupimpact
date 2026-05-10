import { neon } from "@neondatabase/serverless";
import StartupReviewsClient from "./StartupReviewsClient";

export const metadata = {
  title: "Startup Reviews | AIStartupImpact Admin",
};

export default async function StartupReviewsPage() {
  const sql = neon(process.env.DATABASE_URL!);
  
  const rawReviews = await sql`
     SELECT 
       r.id, r.rating, r.title, r.body, r.status, r."proofImageUrl", r."createdAt"::text AS "createdAt", r."helpfulCount",
       u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar,
       s.name AS startup_name, s.slug AS startup_slug
     FROM "StartupReview" r
     LEFT JOIN "WebUser" u ON u.id = r."userId"
     LEFT JOIN "Startup" s ON s.id = r."startupId"
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
    helpfulCount: r.helpfulCount || 0,
    user: { name: r.user_name, email: r.user_email, avatar: r.user_avatar },
    startup: { name: r.startup_name, slug: r.startup_slug }
  }));

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-sora font-bold text-navy dark:text-white">Startup Reviews Moderation</h1>
          <p className="text-gray-500 font-jakarta mt-1">Manage, approve, or flag user reviews written across all Startups.</p>
        </div>
      </div>

      <StartupReviewsClient initialReviews={reviews} />
    </div>
  );
}
