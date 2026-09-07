"use server";

import { prisma } from "@aistartupimpact/database";
import { getFounderSession } from "@/lib/founder-auth";

export async function getClientPortalDataAction() {
  const session = await getFounderSession();
  if (!session) return { success: false, error: "Authentication required", data: null };

  try {
    const [campaigns, creatives, articles] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT id, "companyName", "clientName", "clientEmail", status,
               "startDate"::text AS "startDate", "endDate"::text AS "endDate",
               "totalBudgetPaise"
        FROM "AdCampaign"
        ORDER BY "createdAt" DESC
        LIMIT 5
      `,
      prisma.$queryRaw<any[]>`
        SELECT cr.zone, cr.headline, cr."impressionCount", cr."clickCount",
               c."companyName", c."endDate"::text AS "endDate", c.status
        FROM "AdCreative" cr
        JOIN "AdCampaign" c ON c.id = cr."campaignId"
        WHERE c.status = 'ACTIVE'
        ORDER BY cr."impressionCount" DESC
        LIMIT 5
      `,
      prisma.$queryRaw<any[]>`
        SELECT a.id, a.title, a.status, a."publishedAt"::text AS "publishedAt", a."viewCount"
        FROM "Article" a
        WHERE a."deletedAt" IS NULL
        ORDER BY a."createdAt" DESC
        LIMIT 5
      `,
    ]);

    const totalBudget = campaigns.reduce((s: number, c: any) => s + Number(c.totalBudgetPaise || 0), 0);
    const totalImp = creatives.reduce((s: number, cr: any) => s + Number(cr.impressionCount || 0), 0);
    const totalClk = creatives.reduce((s: number, cr: any) => s + Number(cr.clickCount || 0), 0);
    const activeCampaigns = campaigns.filter((c: any) => c.status === 'ACTIVE');

    return {
      success: true,
      data: {
        campaigns,
        activeCampaigns,
        creatives,
        articles,
        stats: {
          totalBudget,
          totalImpressions: totalImp,
          totalClicks: totalClk,
          activeCampaigns: activeCampaigns.length,
          totalCampaigns: campaigns.length,
          avgCTR: totalImp > 0 ? ((totalClk / totalImp) * 100).toFixed(1) + '%' : '0%',
        },
      },
    };
  } catch (e) {
    console.error("Error fetching client portal data:", e);
    return { success: false, error: "Failed to load data", data: null };
  }
}
