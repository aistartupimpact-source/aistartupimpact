import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";

// 1x1 transparent tracking pixel
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("c");
  const email = searchParams.get("e");

  if (!campaignId || !email) {
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  }

  try {
    const decodedEmail = decodeURIComponent(email);
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check if this is the first open from this email for this campaign
    const existingOpen = await prisma.$queryRaw<any[]>`
      SELECT id FROM "NewsletterOpen"
      WHERE "campaignId" = ${campaignId} AND email = ${decodedEmail}
      LIMIT 1
    `;

    const isFirstOpen = existingOpen.length === 0;

    // Record the open
    await prisma.$executeRaw`
      INSERT INTO "NewsletterOpen" (id, "campaignId", email, "ipAddress", "userAgent", "openedAt")
      VALUES (gen_random_uuid(), ${campaignId}, ${decodedEmail}, ${ipAddress}, ${userAgent}, NOW())
    `;

    // Update campaign stats
    if (isFirstOpen) {
      await prisma.$executeRaw`
        UPDATE "NewsletterCampaign"
        SET opens = opens + 1, "uniqueOpens" = "uniqueOpens" + 1, "updatedAt" = NOW()
        WHERE id = ${campaignId}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "NewsletterCampaign"
        SET opens = opens + 1, "updatedAt" = NOW()
        WHERE id = ${campaignId}
      `;
    }

    // Update subscriber last opened
    await prisma.$executeRaw`
      UPDATE "NewsletterSubscriber"
      SET "lastOpenedAt" = NOW()
      WHERE email = ${decodedEmail}
    `;
  } catch (error) {
    console.error("Track open error:", error);
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    },
  });
}
