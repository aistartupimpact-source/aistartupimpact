import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const campaignId = searchParams.get("c");
  const email = searchParams.get("e");
  const url = searchParams.get("url");
  const label = searchParams.get("label");

  if (!campaignId || !email || !url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decodedEmail = decodeURIComponent(email);
    const decodedUrl = decodeURIComponent(url);
    const decodedLabel = label ? decodeURIComponent(label) : null;
    const ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Check if this is the first click from this email for this campaign
    const existingClick = await prisma.$queryRaw<any[]>`
      SELECT id FROM "NewsletterClick"
      WHERE "campaignId" = ${campaignId} AND email = ${decodedEmail}
      LIMIT 1
    `;

    const isFirstClick = existingClick.length === 0;

    // Record the click
    await prisma.$executeRaw`
      INSERT INTO "NewsletterClick" (id, "campaignId", email, "linkUrl", "linkLabel", "ipAddress", "userAgent", "clickedAt")
      VALUES (gen_random_uuid(), ${campaignId}, ${decodedEmail}, ${decodedUrl}, ${decodedLabel}, ${ipAddress}, ${userAgent}, NOW())
    `;

    // Update campaign stats
    if (isFirstClick) {
      await prisma.$executeRaw`
        UPDATE "NewsletterCampaign"
        SET clicks = clicks + 1, "uniqueClicks" = "uniqueClicks" + 1, "updatedAt" = NOW()
        WHERE id = ${campaignId}
      `;
    } else {
      await prisma.$executeRaw`
        UPDATE "NewsletterCampaign"
        SET clicks = clicks + 1, "updatedAt" = NOW()
        WHERE id = ${campaignId}
      `;
    }

    // Update subscriber last clicked
    await prisma.$executeRaw`
      UPDATE "NewsletterSubscriber"
      SET "lastClickedAt" = NOW()
      WHERE email = ${decodedEmail}
    `;

    // Redirect to the actual URL
    return NextResponse.redirect(decodedUrl);
  } catch (error) {
    console.error("Track click error:", error);
    return NextResponse.redirect(decodeURIComponent(url));
  }
}
