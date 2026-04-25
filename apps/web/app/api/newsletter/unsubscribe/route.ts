import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, campaignId, reason, feedback } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const decodedEmail = decodeURIComponent(email);
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    // Check if subscriber exists
    const subscriber = await prisma.$queryRaw<any[]>`
      SELECT id, "isActive" FROM "NewsletterSubscriber"
      WHERE email = ${decodedEmail}
      LIMIT 1
    `;

    if (subscriber.length === 0) {
      return NextResponse.json({ success: false, error: "Email not found" }, { status: 404 });
    }

    if (!subscriber[0].isActive) {
      return NextResponse.json({ success: true, message: "Already unsubscribed" });
    }

    // Mark as inactive
    await prisma.$executeRaw`
      UPDATE "NewsletterSubscriber"
      SET "isActive" = false, "unsubscribedAt" = NOW()
      WHERE email = ${decodedEmail}
    `;

    // Record unsubscribe event
    await prisma.$executeRaw`
      INSERT INTO "NewsletterUnsubscribe" (id, "campaignId", email, reason, feedback, "ipAddress", "unsubscribedAt")
      VALUES (gen_random_uuid(), ${campaignId || null}, ${decodedEmail}, ${reason || null}, ${feedback || null}, ${ipAddress}, NOW())
    `;

    // Update campaign unsubscribe count if campaignId provided
    if (campaignId) {
      await prisma.$executeRaw`
        UPDATE "NewsletterCampaign"
        SET unsubscribes = unsubscribes + 1, "updatedAt" = NOW()
        WHERE id = ${campaignId}
      `;
    }

    return NextResponse.json({ success: true, message: "Successfully unsubscribed" });
  } catch (error: any) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
