"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "newsletter-noreply@aistartupimpact.com";
const FROM_NAME = process.env.RESEND_FROM_NAME || "AI Startup Impact Weekly";
const REPLY_TO = process.env.RESEND_REPLY_TO || "hello@aistartupimpact.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const LOGO_URL = "https://aistartupimpact.com/logo.png"; // Update with actual logo URL

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
      SELECT id, subject, "previewText", "contentJson", status, "sentAt"::text AS "sentAt",
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
      const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      
      return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${campaign.subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
  <!-- Preview Text -->
  <div style="display:none;font-size:1px;color:#f4f7fa;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">
    ${campaign.previewText || campaign.subject}
  </div>
  
  <!-- Email Container -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f7fa;padding:20px 0">
    <tr>
      <td align="center" style="padding:0 15px">
        <!-- Main Content Table -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          
          <!-- Header with Logo and Branding -->
          <tr>
            <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:32px 40px;text-align:center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <img src="${LOGO_URL}" alt="AI Startup Impact" width="180" height="45" style="display:block;margin:0 auto 16px;max-width:180px;height:auto" />
                    <!-- Tagline -->
                    <div style="color:#ffffff;font-size:14px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;opacity:0.95">
                      India's Premier AI Newsletter
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Edition Info Bar -->
          <tr>
            <td style="background-color:#f8f9fb;padding:12px 40px;border-bottom:1px solid #e2e8f0">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color:#64748b;font-size:13px;font-weight:500">
                    📬 Weekly Edition
                  </td>
                  <td align="right" style="color:#64748b;font-size:13px;font-weight:500">
                    ${currentDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding:40px 40px 32px">
              <!-- Subject as H1 -->
              <h1 style="color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                ${campaign.subject}
              </h1>
              
              <!-- Newsletter Content -->
              <div style="color:#475569;font-size:16px;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                ${trackedBody}
              </div>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px">
              <div style="border-top:2px solid #e2e8f0"></div>
            </td>
          </tr>
          
          <!-- Social Links -->
          <tr>
            <td style="padding:32px 40px;text-align:center;background-color:#f8f9fb">
              <p style="color:#64748b;font-size:14px;font-weight:600;margin:0 0 16px">
                Follow us for daily updates
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding:0 8px">
                    <a href="https://x.com/aistartupimapct" style="display:inline-block;width:36px;height:36px;background-color:#1da1f2;border-radius:50%;text-decoration:none" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="20" height="20" style="display:block;margin:8px auto" />
                    </a>
                  </td>
                  <td style="padding:0 8px">
                    <a href="https://www.linkedin.com/company/ai-startup-imapact" style="display:inline-block;width:36px;height:36px;background-color:#0077b5;border-radius:50%;text-decoration:none" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="20" height="20" style="display:block;margin:8px auto" />
                    </a>
                  </td>
                  <td style="padding:0 8px">
                    <a href="https://www.youtube.com/@aistartupimpact" style="display:inline-block;width:36px;height:36px;background-color:#ff0000;border-radius:50%;text-decoration:none" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" width="20" height="20" style="display:block;margin:8px auto" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#ffffff;border-top:1px solid #e2e8f0">
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 12px">
                You're receiving this because you subscribed to <strong style="color:#64748b">AI Startup Impact</strong>.<br>
                We respect your inbox and send only valuable content.
              </p>
              <p style="color:#94a3b8;font-size:12px;margin:0">
                <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}&c=${encodeURIComponent(campaignId)}" style="color:#667eea;text-decoration:underline">Unsubscribe</a>
                &nbsp;•&nbsp;
                <a href="${SITE_URL}" style="color:#667eea;text-decoration:none">Visit Website</a>
                &nbsp;•&nbsp;
                <a href="${SITE_URL}/contact" style="color:#667eea;text-decoration:none">Contact Us</a>
              </p>
              <p style="color:#cbd5e1;font-size:11px;margin:12px 0 0">
                © ${new Date().getFullYear()} AI Startup Impact. All rights reserved.<br>
                Bengaluru, India
              </p>
            </td>
          </tr>
          
        </table>
        <!-- End Main Content Table -->
      </td>
    </tr>
  </table>
  
  <!-- Tracking Pixel -->
  <img src="${trackingPixel}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0" />
</body>
</html>`;
    };

    // Send in batches of 100 (Resend limit)
    let totalSent = 0;
    const CHUNK = 100;
    for (let i = 0; i < subscribers.length; i += CHUNK) {
      const chunk = subscribers.slice(i, i + CHUNK);
      const batch = chunk.map((sub: any) => ({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        replyTo: REPLY_TO,
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
      SELECT subject, "previewText", "contentJson" FROM "NewsletterCampaign" WHERE id = ${id}
    `;
    if (!campaigns.length) return { success: false, error: "Campaign not found" };

    const campaign = campaigns[0];
    const htmlBody = (campaign.contentJson as any)?.html || "";
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    // Build full branded template for test email
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${campaign.subject}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale">
  <!-- Preview Text -->
  <div style="display:none;font-size:1px;color:#f4f7fa;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden">
    ${campaign.previewText || campaign.subject}
  </div>
  
  <!-- Email Container -->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f7fa;padding:20px 0">
    <tr>
      <td align="center" style="padding:0 15px">
        <!-- Main Content Table -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          
          <!-- TEST BANNER -->
          <tr>
            <td style="background:#fef3c7;padding:12px 20px;text-align:center;border-bottom:2px solid #fbbf24">
              <p style="margin:0;color:#92400e;font-size:13px;font-weight:600">
                ⚠️ <strong>TEST EMAIL</strong> - This is a preview. Only you can see this message.
              </p>
            </td>
          </tr>
          
          <!-- Header with Logo and Branding -->
          <tr>
            <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:32px 40px;text-align:center">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Logo -->
                    <img src="${LOGO_URL}" alt="AI Startup Impact" width="180" height="45" style="display:block;margin:0 auto 16px;max-width:180px;height:auto" />
                    <!-- Tagline -->
                    <div style="color:#ffffff;font-size:14px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;opacity:0.95">
                      India's Premier AI Newsletter
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Edition Info Bar -->
          <tr>
            <td style="background-color:#f8f9fb;padding:12px 40px;border-bottom:1px solid #e2e8f0">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color:#64748b;font-size:13px;font-weight:500">
                    📬 Weekly Edition
                  </td>
                  <td align="right" style="color:#64748b;font-size:13px;font-weight:500">
                    ${currentDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding:40px 40px 32px">
              <!-- Subject as H1 -->
              <h1 style="color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                ${campaign.subject}
              </h1>
              
              <!-- Newsletter Content -->
              <div style="color:#475569;font-size:16px;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                ${htmlBody}
              </div>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px">
              <div style="border-top:2px solid #e2e8f0"></div>
            </td>
          </tr>
          
          <!-- Social Links -->
          <tr>
            <td style="padding:32px 40px;text-align:center;background-color:#f8f9fb">
              <p style="color:#64748b;font-size:14px;font-weight:600;margin:0 0 16px">
                Follow us for daily updates
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding:0 8px">
                    <a href="https://x.com/aistartupimapct" style="display:inline-block;width:36px;height:36px;background-color:#1da1f2;border-radius:50%;text-decoration:none" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter" width="20" height="20" style="display:block;margin:8px auto" />
                    </a>
                  </td>
                  <td style="padding:0 8px">
                    <a href="https://www.linkedin.com/company/ai-startup-imapact" style="display:inline-block;width:36px;height:36px;background-color:#0077b5;border-radius:50%;text-decoration:none" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" width="20" height="20" style="display:block;margin:8px auto" />
                    </a>
                  </td>
                  <td style="padding:0 8px">
                    <a href="https://www.youtube.com/@aistartupimpact" style="display:inline-block;width:36px;height:36px;background-color:#ff0000;border-radius:50%;text-decoration:none" target="_blank">
                      <img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" width="20" height="20" style="display:block;margin:8px auto" />
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#ffffff;border-top:1px solid #e2e8f0">
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 12px">
                You're receiving this because you subscribed to <strong style="color:#64748b">AI Startup Impact</strong>.<br>
                We respect your inbox and send only valuable content.
              </p>
              <p style="color:#94a3b8;font-size:12px;margin:0">
                <a href="${SITE_URL}/unsubscribe?email=${encodeURIComponent(testEmail)}" style="color:#667eea;text-decoration:underline">Unsubscribe</a>
                &nbsp;•&nbsp;
                <a href="${SITE_URL}" style="color:#667eea;text-decoration:none">Visit Website</a>
                &nbsp;•&nbsp;
                <a href="${SITE_URL}/contact" style="color:#667eea;text-decoration:none">Contact Us</a>
              </p>
              <p style="color:#cbd5e1;font-size:11px;margin:12px 0 0">
                © ${new Date().getFullYear()} AI Startup Impact. All rights reserved.<br>
                Bengaluru, India
              </p>
            </td>
          </tr>
          
        </table>
        <!-- End Main Content Table -->
      </td>
    </tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      replyTo: REPLY_TO,
      to: [testEmail],
      subject: `[TEST] ${campaign.subject}`,
      html: fullHtml,
    });

    return { success: true };
  } catch (e: any) {
    console.error('Test email error:', e);
    return { success: false, error: e.message };
  }
}
