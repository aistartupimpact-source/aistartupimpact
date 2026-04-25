"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitToolReview(data: {
  toolSlug: string;
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
    const tools = await sql`
      SELECT id FROM "AiTool" 
      WHERE slug = ${data.toolSlug} AND status = 'APPROVED' AND "deletedAt" IS NULL
      LIMIT 1
    `;

    if (tools.length === 0) {
      return { success: false, error: "Tool not found" };
    }
    const toolId = tools[0].id;

    const existingReviews = await sql`
      SELECT id FROM "ToolReview"
      WHERE "toolId" = ${toolId} AND "userId" = ${userId}
      LIMIT 1
    `;

    if (existingReviews.length > 0) {
      return { success: false, error: "You have already reviewed this tool." };
    }

    const rating = Math.max(1, Math.min(5, data.rating));
    const title = data.title.trim();
    const body = data.body.trim();
    const isVerifiedPurchase = !!data.proofImageUrl;
    const proofImageUrl = data.proofImageUrl || null;

    // Velocity Rate Limiting
    const recentReviews = await sql`
      SELECT COUNT(id) as count FROM "ToolReview"
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
      INSERT INTO "ToolReview" (
        id, "toolId", "userId", rating, title, body, "isVerifiedPurchase", "proofImageUrl", status, "aiSpamScore", "helpfulCount", "createdAt", "publishedAt"
      ) VALUES (
        gen_random_uuid(), ${toolId}, ${userId}, ${rating}, ${title}, ${body}, ${isVerifiedPurchase}, ${proofImageUrl}, ${finalStatus}, 0, 0, NOW(), NOW()
      )
    `;

    revalidatePath(`/tools/${data.toolSlug}`);

    return { success: true };
  } catch (err: any) {
    console.error("Submit review error:", err);
    return { success: false, error: "Failed to submit review. Please try again later." };
  }
}

export async function incrementHelpfulCountAction(reviewId: string, toolSlug: string) {
  try {
    await sql`
      UPDATE "ToolReview" 
      SET "helpfulCount" = "helpfulCount" + 1 
      WHERE id = ${reviewId}
    `;
    revalidatePath(`/tools/${toolSlug}`);
    return { success: true };
  } catch (err) {
    console.error("Helpful upvote failed", err);
    return { success: false };
  }
}
