"use server";

import { prisma } from "@aistartupimpact/database";

export async function getMyPlacementsAction() {
  try {
    const campaigns = await prisma.$queryRaw<any[]>`
      SELECT
        c.id, c."clientName", c."companyName", c."clientEmail",
        c.status, c."startDate"::text AS "startDate", c."endDate"::text AS "endDate",
        c."totalBudgetPaise", c.notes, c."createdAt"::text AS "createdAt",
        COALESCE(
          json_agg(
            json_build_object(
              'id', cr.id, 'zone', cr.zone, 'headline', cr.headline,
              'bodyText', cr."bodyText", 'ctaText', cr."ctaText", 'ctaUrl', cr."ctaUrl",
              'imageUrl', cr."imageUrl", 'isActive', cr."isActive",
              'impressionCount', cr."impressionCount", 'clickCount', cr."clickCount"
            )
          ) FILTER (WHERE cr.id IS NOT NULL),
          '[]'
        ) AS creatives
      FROM "AdCampaign" c
      LEFT JOIN "AdCreative" cr ON cr."campaignId" = c.id
      GROUP BY c.id
      ORDER BY c."createdAt" DESC
    `;
    return { success: true, data: campaigns };
  } catch (e: any) {
    return { success: false, error: e.message, data: [] };
  }
}

export async function getPlacementStatsAction() {
  try {
    const [campaigns, creatives] = await Promise.all([
      prisma.$queryRaw<any[]>`SELECT COUNT(*) as count, status FROM "AdCampaign" GROUP BY status`,
      prisma.$queryRaw<any[]>`SELECT COALESCE(SUM("impressionCount"),0) as impressions, COALESCE(SUM("clickCount"),0) as clicks FROM "AdCreative"`,
    ]);
    const active = campaigns.find((r: any) => r.status === 'ACTIVE');
    const total = campaigns.reduce((s: number, r: any) => s + Number(r.count), 0);
    return {
      success: true,
      data: {
        total,
        active: Number(active?.count || 0),
        impressions: Number(creatives[0]?.impressions || 0),
        clicks: Number(creatives[0]?.clicks || 0),
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message, data: null };
  }
}
