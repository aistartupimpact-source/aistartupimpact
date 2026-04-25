"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "newsletter@aistartupimpact.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const ALLOWED = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER"];

// ── Stats ────────────────────────────────────────────────────────────────────

export async function getNewsletterStatsAction() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED.includes(session.user.role))
    return { success: false, error: "Unauthorized" };

  try {
    const [totalRows, activeRows, campaignRows] = await Promise.all([
      prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM "NewsletterSubscriber"`,
      prisma.$queryRaw<any[]>`SELECT COUNT(*) as count FROM "NewsletterSubscriber" WHERE "isActive" = true`,
      prisma.$queryRaw<any[]>`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM("uniqueOpens"), 0) as total_opens,
          COALESCE(SUM("uniqueClicks"), 0) as total_clicks,
          COALESCE(SUM("totalSent"), 0) as total_sent
        FROM "NewsletterCampaign" WHERE status = 'SENT'
      `,
    ]);

    const total = Number(totalRows[0]?.count || 0);
    const active = Number(activeRows[0]?.count || 0);
    const sentCount = Number(campaignRows[0]?.total || 0);
    const totalOpens = Number(campaignRows[0]?.total_opens || 0);
    const totalClicks = Number(campaignRows[0]?.total_clicks || 0);
    const totalSent = Number(campaignRows[0]?.total_sent || 0);

    const openRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : "0";
    const ctr = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : "0";

    return {
      success: true,
      data: { total, active, sentCount, openRate, ctr },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Campaigns ────────────────────────────────────────────────────────────────

export async function getCampaignsAction() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED.includes(session.user.role))
    return { success: false, error: "Unauthorized", data: [] };

  try {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT id, subject, "previewText", status, "sentAt"::text AS "sentAt",
             "scheduledAt"::text AS "scheduledAt",
             "totalSent", opens, "uniqueOpens", clicks, "uniqueClicks", unsubscribes, "createdAt"::text AS "createdAt"
      FROM "NewsletterCampaign"
      ORDER BY "createdAt" DESC
    `;
    return { success: true, data: rows };
  } catch (e: any) {
    return { success: false, error: e.message, data: [] };
  }
}

export async function saveCampaignAction(payload: {
  id?: string;
  subject: string;
  previewText: string;
  body: string; // HTML body
  scheduledAt?: string;
}) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role))
    return { success: false, error: "Unauthorized" };

  const { id, subject, previewText, body, scheduledAt } = payload;
  const contentJson = JSON.stringify({ html: body });

  try {
    if (id) {
      await prisma.$executeRaw`
        UPDATE "NewsletterCampaign"
        SET subject = ${subject}, "previewText" = ${previewText},
            "contentJson" = ${contentJson}::jsonb,
            "scheduledAt" = ${scheduledAt ? new Date(scheduledAt) : null},
            "updatedAt" = NOW()
        WHERE id = ${id}
      `;
      return { success: true, id };
    } else {
      const rows = await prisma.$queryRaw<any[]>`
        INSERT INTO "NewsletterCampaign" (id, subject, "previewText", "contentJson", status, "scheduledAt", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${subject}, ${previewText}, ${contentJson}::jsonb, 'DRAFT', ${scheduledAt ? new Date(scheduledAt) : null}, NOW(), NOW())
        RETURNING id
      `;
      return { success: true, id: rows[0]?.id };
    }
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function deleteCampaignAction(id: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role))
    return { success: false, error: "Unauthorized" };

  try {
    await prisma.$executeRaw`DELETE FROM "NewsletterCampaign" WHERE id = ${id}`;
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Send ─────────────────────────────────────────────────────────────────────

export async function sendCampaignAction(id: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role))
    return { success: false, error: "Unauthorized" };

  try {
    const campaigns = await prisma.$queryRaw<any[]>`
      SELECT id, subject, "previewText", "contentJson" FROM "NewsletterCampaign"
      WHERE id = ${id} AND status IN ('DRAFT', 'SCHEDULED')
    `;
    if (!campaigns.length) return { success: false, error: "Campaign not found or already sent" };

    const campaign = campaigns[0];
    const htmlBody = (campaign.contentJson as any)?.html || "";

    // Mark as SENDING
    await prisma.$executeRaw`
      UPDATE "NewsletterCampaign" SET status = 'SENDING', "updatedAt" = NOW() WHERE id = ${id}
    `;

    // Fetch active subscribers
    const subscribers = await prisma.$queryRaw<any[]>`
      SELECT email, name FROM "NewsletterSubscriber" WHERE "isActive" = true
    `;

    if (subscribers.length === 0) {
      await prisma.$executeRaw`
        UPDATE "NewsletterCampaign"
        SET status = 'SENT', "sentAt" = NOW(), "totalSent" = 0, "updatedAt" = NOW()
        WHERE id = ${id}
      `;
      return { success: true, sent: 0 };
    }

    // Wrap links with tracking
    const wrapLinksWithTracking = (html: string, email: string, campaignId: string) => {
      // Match all <a> tags and wrap their href with tracking
      return html.replace(
        /<a\s+([^>]*href=["']([^"']+)["'][^>]*)>([^<]*)<\/a>/gi,
        (match, attrs, url, text) => {
          // Skip if already a tracking link or unsubscribe link
          if (url.includes('/api/newsletter/track-click') || url.includes('/unsubscribe')) {
            return match;
          }
          const trackingUrl = `${SITE_URL}/api/newsletter/track-click?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}&url=${encodeURIComponent(url)}&label=${encodeURIComponent(text)}`;
          return `<a ${attrs.replace(/href=["'][^"']+["']/, `href="${trackingUrl}"`)}>${text}</a>`;
        }
      );
    };

    // Build unsubscribe-aware HTML with tracking pixel
    const buildHtml = (email: string, campaignId: string) => {
      const trackedBody = wrapLinksWithTracking(htmlBody, email, campaignId);
      const trackingPixel = `${SITE_URL}/api/newsletter/track-open?c=${encodeURIComponent(campaignId)}&e=${encodeURIComponent(email)}`;
      
      return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.05)">
    <div style="background:#0a0a0a;padding:24px;text-align:center">
      <span style="color:#fff;font-size:20px;font-weight:700">AIStartupImpact</span>
    </div>
    <div style="padding:32px 40px">
      <h1 style="color:#1a1a1a;font-size:24px;font-weight:700;margin:0 0 24px">${campaign.subject}</h1>
      ${trackedBody}
    </div>
    <div style="padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="color:#8898aa;font-size:12px;margin:0">
        You're receiving this because you subscribed to AIStartupImpact.<br>
        <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}&c=${encodeURIComponent(campaignId)}" style="color:#3b82f6;text-decoration:underline">Unsubscribe</a>
      </p>
    </div>
  </div>
  <img src="${trackingPixel}" width="1" height="1" alt="" style="display:block;width:1px;height:1px" />
</body>
</html>`;
    };

    // Send in batches of 100 (Resend limit)
    let totalSent = 0;
    const CHUNK = 100;
    for (let i = 0; i < subscribers.length; i += CHUNK) {
      const chunk = subscribers.slice(i, i + CHUNK);
      const batch = chunk.map((sub: any) => ({
        from: FROM_EMAIL,
        to: [sub.email],
        subject: campaign.subject,
        html: buildHtml(sub.email, id),
      }));
      await resend.batch.send(batch);
      totalSent += chunk.length;
    }

    await prisma.$executeRaw`
      UPDATE "NewsletterCampaign"
      SET status = 'SENT', "sentAt" = NOW(), "totalSent" = ${totalSent}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    return { success: true, sent: totalSent };
  } catch (e: any) {
    await prisma.$executeRaw`
      UPDATE "NewsletterCampaign" SET status = 'FAILED', "updatedAt" = NOW() WHERE id = ${id}
    `;
    return { success: false, error: e.message };
  }
}

export async function sendTestEmailAction(id: string, testEmail: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role))
    return { success: false, error: "Unauthorized" };

  try {
    const campaigns = await prisma.$queryRaw<any[]>`
      SELECT subject, "contentJson" FROM "NewsletterCampaign" WHERE id = ${id}
    `;
    if (!campaigns.length) return { success: false, error: "Campaign not found" };

    const campaign = campaigns[0];
    const htmlBody = (campaign.contentJson as any)?.html || "";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: [testEmail],
      subject: `[TEST] ${campaign.subject}`,
      html: `<div style="background:#fef3c7;padding:12px;text-align:center;font-family:sans-serif;font-size:13px;color:#92400e">⚠️ This is a test email</div>${htmlBody}`,
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
