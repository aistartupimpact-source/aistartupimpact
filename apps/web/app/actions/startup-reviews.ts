"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitStartupReview(data: {
  startupSlug: string;
  rating: number;
  title: string;
  body: string;
  proofImageUrl?: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!(session?.user as any)?.id) {
    return { success: false, error: "Authentication required" };
  }
  const userId = (session!.user as any).id;

  try {
    const startups = await sql`
      SELECT id FROM "Startup" 
      WHERE slug = ${data.startupSlug} AND "deletedAt" IS NULL
      LIMIT 1
    `;

    if (startups.length === 0) {
      return { success: false, error: "Startup not found" };
    }
    const startupId = startups[0].id;

    const existingReviews = await sql`
      SELECT id FROM "StartupReview"
      WHERE "startupId" = ${startupId} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (existingReviews.length > 0) {
      return { success: false, error: "You have already reviewed this startup." };
    }

    const rating = Math.max(1, Math.min(5, data.rating));
    const title = data.title.trim();
    const body = data.body.trim();
    const proofImageUrl = data.proofImageUrl || null;

    // Velocity Rate Limiting
    const recentReviews = await sql`
      SELECT COUNT(id) as count FROM "StartupReview"
      WHERE "userId" = ${userId} AND "createdAt" > NOW() - INTERVAL '24 hours'
    `;
    if (recentReviews[0].count >= 3) {
      return { success: false, error: "You have reached your review limit for today." };
    }

    // Account Age Gating
    const user = await sql`SELECT "createdAt" FROM "User" WHERE id = ${userId}`;
    let finalStatus = 'APPROVED';
    
    if (user.length > 0) {
      // 48 hours = 48 * 60 * 60 * 1000 = 172800000 ms
      const ageMs = Date.now() - new Date(user[0].createdAt).getTime();
      if (ageMs < 172800000) {
        finalStatus = 'PENDING';
      }
    }

    await sql`
      INSERT INTO "StartupReview" (
        id, "startupId", "userId", rating, title, body, "proofImageUrl", status, "aiSpamScore", "helpfulCount", "createdAt", "publishedAt"
      ) VALUES (
        gen_random_uuid(), ${startupId}, ${userId}, ${rating}, ${title}, ${body}, ${proofImageUrl}, ${finalStatus}, 0, 0, NOW(), NOW()
      )
    `;

    revalidatePath(`/startups/${data.startupSlug}`);

    return { success: true };
  } catch (err: any) {
    console.error("Submit startup review error:", err);
    return { success: false, error: "Failed to submit review. Please try again later." };
  }
}

export async function incrementStartupReviewHelpful(reviewId: string, startupSlug: string) {
  try {
    await sql`
      UPDATE "StartupReview" 
      SET "helpfulCount" = "helpfulCount" + 1 
      WHERE id = ${reviewId}
    `;
    revalidatePath(`/startups/${startupSlug}`);
    return { success: true };
  } catch (err) {
    console.error("Helpful upvote failed", err);
    return { success: false };
  }
}
