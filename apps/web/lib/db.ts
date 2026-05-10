// Direct DB queries for server components — bypasses the need for the API server
import { neon, NeonQueryFunction } from '@neondatabase/serverless';

// Lazy sql client — not instantiated at module load time (avoids build-time DATABASE_URL errors)
let _sql: NeonQueryFunction<false, false> | undefined;
function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!, { fetchOptions: { cache: 'no-store' } });
  return _sql;
}
// sql is used as a tagged template literal throughout this file
export const sql: NeonQueryFunction<false, false> = new Proxy(
  ((...args: Parameters<NeonQueryFunction<false, false>>) => getSql()(...args)) as NeonQueryFunction<false, false>,
  {
    get(_target, prop) {
      return (getSql() as any)[prop];
    },
  }
);

export async function getArticleBySlugDirect(slug: string) {
  try {
    const rows: any[] = await sql`
      SELECT
        a.id, a.title, a.slug, a.type, a.excerpt, a.content,
        a."coverImage", a."thumbnailImage", a."readTimeMinutes", a."viewCount", a."isFeatured",
        a."likeCount",
        a."publishedAt"::text AS "publishedAt",
        u.name AS "authorName", u.slug AS "authorSlug",
        c.name AS "categoryName", c.slug AS "categorySlug",
        a."toolId"
      FROM "Article" a
      LEFT JOIN "User" u ON u.id = a."authorId"
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      WHERE a.slug = ${slug} AND a.status = 'PUBLISHED' AND a."deletedAt" IS NULL
      LIMIT 1
    `;
    if (!rows.length) return null;
    const a = rows[0];

    // Cross-link: Fetch related tool if toolId is attached
    let linkedTool = null;
    if (a.toolId) {
      const toolRows = await sql`
        SELECT name, slug, tagline, "logoUrl", "pricingModel", "avgRating"
        FROM "AiTool"
        WHERE id = ${a.toolId} AND "deletedAt" IS NULL
        LIMIT 1
      `;
      if (toolRows.length) linkedTool = toolRows[0];
    }

    return {
      ...a,
      author: { name: a.authorName, slug: a.authorSlug },
      category: { name: a.categoryName, slug: a.categorySlug },
      linkedTool
    };
  } catch (e) {
    console.error('getArticleBySlugDirect error:', e);
    return null;
  }
}

// ── Directory Entities ─────────────────────────────────────────────────────────

export async function getAiToolBySlugDirect(slug: string) {
  try {
    const rows = await sql`
      SELECT 
        t.*,
        c.name AS "categoryName",
        s.id AS "startupId", s.name AS "startupName", s."totalFundingInr"
      FROM "AiTool" t
      LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
      LEFT JOIN "Startup" s ON s.id = t."startupId"
      WHERE t.slug = ${slug} AND t."deletedAt" IS NULL
      LIMIT 1
    `;
    if (!rows.length) return null;
    const tool = rows[0];

    // Cross-link: Fetch Founder Stories for this tool
    const stories = await sql`
      SELECT id, title, slug, excerpt, "coverImage", "publishedAt"::text AS "publishedAt"
      FROM "Article"
      WHERE "toolId" = ${tool.id} AND status = 'PUBLISHED' AND "deletedAt" IS NULL
      ORDER BY "publishedAt" DESC
    `;

    // Cross-link: Fetch Funding Rounds if part of a Startup
    let fundingRounds: any[] = [];
    if (tool.startupId) {
      fundingRounds = await sql`
        SELECT "roundType", "amountInr", "amountUsd", "announcedAt"::text AS "announcedAt", "leadInvestors", sourceUrl
        FROM "FundingRound"
        WHERE "startupId" = ${tool.startupId}
        ORDER BY "announcedAt" DESC
      `;
    }

    // Cross-link: Fetch Approved Tool Reviews
    const userReviews = await sql`
      SELECT r.id, r.rating, r.title, r.body, r."publishedAt"::text AS "publishedAt", r."helpfulCount",
             u.name AS "authorName", u.role AS "authorRole"
      FROM "ToolReview" r
      JOIN "User" u ON u.id = r."userId"
      WHERE r."toolId" = ${tool.id} AND r.status = 'APPROVED'
      ORDER BY r."helpfulCount" DESC, r."publishedAt" DESC
    `;

    // Fetch Tool Use Cases (features and use cases)
    const useCases = await sql`
      SELECT id, text
      FROM "ToolUseCase"
      WHERE "toolId" = ${tool.id}
      ORDER BY id
    `;

    return { ...tool, stories, fundingRounds, userReviews, useCases, category: tool.categoryName };
  } catch (e) {
    console.error('getAiToolBySlugDirect error:', e);
    return null;
  }
}

export async function getFeaturedToolsDirect(limit = 4) {
  try {
    const rows: any[] = await sql`
      SELECT t.id, t.name, t.slug, t.tagline, t.description, t."logoUrl", t."websiteUrl", t."avgRating", c.name AS "categoryName"
      FROM "AiTool" t
      LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
      WHERE t."listingTier" = 'FEATURED' AND t.status = 'APPROVED' AND t."deletedAt" IS NULL
      ORDER BY t."updatedAt" DESC
      LIMIT ${limit}
    `;
    return rows.map((t: any) => ({
      ...t,
      category: { name: t.categoryName }
    }));
  } catch (e) {
    console.error('getFeaturedToolsDirect error:', e);
    return [];
  }
}

export async function getPriorityToolsDirect(limit = 6) {
  try {
    const rows: any[] = await sql`
      SELECT t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", c.name AS "categoryName"
      FROM "AiTool" t
      LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
      WHERE t."listingTier" = 'PRIORITY' AND t.status = 'APPROVED' AND t."deletedAt" IS NULL
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;
    return rows.map((t: any) => ({
      ...t,
      category: { name: t.categoryName }
    }));
  } catch (e) {
    console.error('getPriorityToolsDirect error:', e);
    return [];
  }
}

export async function getToolCategoriesDirect() {
  try {
    const rows = await sql`SELECT id, name, slug FROM "ToolCategory" ORDER BY name ASC`;
    return rows;
  } catch (e) {
    console.error('getToolCategoriesDirect error:', e);
    return [];
  }
}

export async function getDirectoryToolsDirect(categorySlug?: string) {
  try {
    let rows: any[];
    if (categorySlug && categorySlug !== 'all') {
      rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, t.description, t."pricingModel", t."logoUrl", t."avgRating", 
               t."hasApi", t."hasMobileApp", t."launchYear", t."headquartersCountry", t."founderNames",
               c.name AS "categoryName", c.slug AS "categorySlug"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL AND c.slug = ${categorySlug}
        ORDER BY 
          CASE WHEN t."listingTier" = 'FEATURED' THEN 1
               WHEN t."listingTier" = 'PRIORITY' THEN 2
               ELSE 3 END ASC,
          t."createdAt" DESC
      `;
    } else {
      rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, t.description, t."pricingModel", t."logoUrl", t."avgRating",
               t."hasApi", t."hasMobileApp", t."launchYear", t."headquartersCountry", t."founderNames",
               c.name AS "categoryName", c.slug AS "categorySlug"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
        ORDER BY 
          CASE WHEN t."listingTier" = 'FEATURED' THEN 1
               WHEN t."listingTier" = 'PRIORITY' THEN 2
               ELSE 3 END ASC,
          t."createdAt" DESC
      `;
    }

    return rows.map((t: any) => ({
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      logoUrl: t.logoUrl || null,
      category: t.categoryName || 'General',
      categorySlug: t.categorySlug || 'general',
      rating: parseFloat(t.avgRating || '4.0'),
      pricing: t.pricingModel || 'Free',
      verdict: t.description ? t.description.substring(0, 120) + '...' : 'An excellent AI tool optimized for productivity.',
      hasApi: t.hasApi || false,
      hasMobileApp: t.hasMobileApp || false,
      launchYear: t.launchYear || null,
      country: t.headquartersCountry || null,
      founderNames: t.founderNames || []
    }));
  } catch (e) {
    console.error('getDirectoryToolsDirect error:', e);
    return [];
  }
}

export async function getArticlesDirect(params: { type?: string; limit?: number; isFeatured?: boolean } = {}) {
  try {
    const limit = params.limit || 10;

    if (params.type && params.isFeatured !== undefined) {
      const rows: any[] = await sql`
        SELECT
          a.id, a.title, a.slug, a.type, a.excerpt, a."coverImage", a."thumbnailImage",
          a."readTimeMinutes", a."isFeatured",
          a."publishedAt"::text AS "publishedAt",
          u.name AS "authorName",
          c.name AS "categoryName"
        FROM "Article" a
        LEFT JOIN "User" u ON u.id = a."authorId"
        LEFT JOIN "Category" c ON c.id = a."categoryId"
        WHERE a.status = 'PUBLISHED' AND a."deletedAt" IS NULL
          AND a.type = ${params.type} AND a."isFeatured" = ${params.isFeatured}
        ORDER BY a."publishedAt" DESC NULLS LAST
        LIMIT ${limit}
      `;
      return rows.map((a: any) => ({
        ...a,
        author: { name: a.authorName },
        category: { name: a.categoryName },
      }));
    } else if (params.type) {
      const rows: any[] = await sql`
        SELECT
          a.id, a.title, a.slug, a.type, a.excerpt, a."coverImage", a."thumbnailImage",
          a."readTimeMinutes", a."isFeatured",
          a."publishedAt"::text AS "publishedAt",
          u.name AS "authorName",
          c.name AS "categoryName"
        FROM "Article" a
        LEFT JOIN "User" u ON u.id = a."authorId"
        LEFT JOIN "Category" c ON c.id = a."categoryId"
        WHERE a.status = 'PUBLISHED' AND a."deletedAt" IS NULL AND a.type = ${params.type}
        ORDER BY a."publishedAt" DESC NULLS LAST
        LIMIT ${limit}
      `;
      return rows.map((a: any) => ({
        ...a,
        author: { name: a.authorName },
        category: { name: a.categoryName },
      }));
    } else if (params.isFeatured !== undefined) {
      const rows: any[] = await sql`
        SELECT
          a.id, a.title, a.slug, a.type, a.excerpt, a."coverImage", a."thumbnailImage",
          a."readTimeMinutes", a."isFeatured",
          a."publishedAt"::text AS "publishedAt",
          u.name AS "authorName",
          c.name AS "categoryName"
        FROM "Article" a
        LEFT JOIN "User" u ON u.id = a."authorId"
        LEFT JOIN "Category" c ON c.id = a."categoryId"
        WHERE a.status = 'PUBLISHED' AND a."deletedAt" IS NULL AND a."isFeatured" = ${params.isFeatured}
        ORDER BY a."publishedAt" DESC NULLS LAST
        LIMIT ${limit}
      `;
      return rows.map((a: any) => ({
        ...a,
        author: { name: a.authorName },
        category: { name: a.categoryName },
      }));
    } else {
      const rows: any[] = await sql`
        SELECT
          a.id, a.title, a.slug, a.type, a.excerpt, a."coverImage", a."thumbnailImage",
          a."readTimeMinutes", a."isFeatured",
          a."publishedAt"::text AS "publishedAt",
          u.name AS "authorName",
          c.name AS "categoryName"
        FROM "Article" a
        LEFT JOIN "User" u ON u.id = a."authorId"
        LEFT JOIN "Category" c ON c.id = a."categoryId"
        WHERE a.status = 'PUBLISHED' AND a."deletedAt" IS NULL
        ORDER BY a."publishedAt" DESC NULLS LAST
        LIMIT ${limit}
      `;
      return rows.map((a: any) => ({
        ...a,
        author: { name: a.authorName },
        category: { name: a.categoryName },
      }));
    }
  } catch (e) {
    console.error('getArticlesDirect error:', e);
    return [];
  }
}

export async function getHeroArticleDirect() {
  const rows = await getArticlesDirect({ isFeatured: true, limit: 1 });
  if (rows.length) return rows[0];
  const latest = await getArticlesDirect({ limit: 1 });
  return latest.length ? latest[0] : null;
}

export async function getLatestStoriesDirect(limit = 3) {
  return getArticlesDirect({ limit });
}

export async function getFounderSpotlightDirect(limit = 5) {
  const rows = await getArticlesDirect({ type: 'STORY', limit });
  return rows.length ? rows : null;
}

export async function getIndiaAIEcosystemDirect(limit = 4) {
  return getArticlesDirect({ limit });
}

// ── Ad Zones ──────────────────────────────────────────────────────────────────

export async function getActiveCreativeForZone(zone: string) {
  try {
    const rows: any[] = await sql`
      SELECT
        cr.id, cr.zone, cr.headline, cr."bodyText", cr."ctaText", cr."ctaUrl", cr."imageUrl",
        c."companyName", c.status AS "campaignStatus"
      FROM "AdCreative" cr
      JOIN "AdCampaign" c ON c.id = cr."campaignId"
      WHERE cr.zone = ${zone}::"AdZoneType"
        AND cr."isActive" = true
        AND c.status = 'ACTIVE'
        AND c."startDate" <= NOW()
        AND c."endDate" >= NOW()
      ORDER BY RANDOM()
      LIMIT 1
    `;
    return rows.length ? rows[0] : null;
  } catch (e) {
    console.error('getActiveCreativeForZone error:', e);
    return null;
  }
}
// ── Tickers ──────────────────────────────────────────────────────────────────

export async function getActiveBreakingTickers() {
  try {
    const tickers = await sql`
      SELECT text
      FROM "BreakingTicker"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `;
    return (tickers as any[]).map(t => t.text);
  } catch (error) {
    console.error('Error fetching breaking tickers:', error);
    return [];
  }
}

export async function getActiveLiveTickers() {
  try {
    const tickers = await sql`
      SELECT text
      FROM "LiveTicker"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `;
    return (tickers as any[]).map(t => t.text);
  } catch (error) {
    console.error('Error fetching live tickers:', error);
    return [];
  }
}

// ── Featured Startups ──────────────────────────────────────────────────────────────────

export async function getFeaturedStartupDirect() {
  try {
    const startups = await sql`
      SELECT id, name, tagline, description, "websiteUrl", "logoUrl", "statValue", "statLabel"
      FROM "Startup" 
      WHERE "isFeatured" = true AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
    `;
    if (!startups.length) return null;
    return startups.map((s: any) => ({
      name: s.name,
      tagline: s.tagline,
      description: s.description,
      ctaUrl: s.websiteUrl || '#',
      logoUrl: s.logoUrl,
      statValue: s.statValue || null,
      statLabel: s.statLabel || null,
    }));
  } catch (error) {
    console.error('getFeaturedStartupDirect: Error fetching featured startups:', error);
    return null;
  }
}

// ── Funding Digests ──────────────────────────────────────────────────────────────────

export async function getFundingDigestsDirect(limit = 3) {
  try {
    const digests = await sql`
      SELECT 
        id, title, date, status, "dealsCount", "totalRaised", deals
      FROM "FundingDigest"
      WHERE status = 'PUBLISHED'
      ORDER BY date DESC
      LIMIT ${limit}
    `;
    return digests.map((digest: any) => ({
      slug: `week-${digest.id.substring(0, 8)}`,
      title: digest.title,
      date: digest.date,
      dealsCount: digest.dealsCount,
      totalRaised: digest.totalRaised,
      deals: typeof digest.deals === 'string' ? JSON.parse(digest.deals) : digest.deals || [],
    }));
  } catch (error) {
    console.error('getFundingDigestsDirect error:', error);
    return [];
  }
}

export async function getAllFundingRoundsDirect() {
  try {
    const rows = await sql`
      SELECT 
        fr.id, fr."roundType", fr."amountInr", fr."amountUsd",
        fr."announcedAt"::text AS "announcedAt", fr."leadInvestors", fr."allInvestors",
        s.name AS "startupName", s.slug AS "startupSlug", s."headquartersCity"
      FROM "FundingRound" fr
      JOIN "Startup" s ON s.id = fr."startupId"
      WHERE s."deletedAt" IS NULL
      ORDER BY fr."announcedAt" DESC
    `;
    return rows;
  } catch (error) {
    console.error('getAllFundingRoundsDirect error:', error);
    return [];
  }
}

// Helper function to format rupees from paise
function formatRupeesFromPaise(paise: number): string {
  const crores = paise / 1000000000;
  if (crores >= 1) {
    return `₹${crores.toFixed(0)}Cr`;
  }
  const lakhs = paise / 10000000;
  return `₹${lakhs.toFixed(0)}L`;
}

// ── Hero Slots ──────────────────────────────────────────────────────────────────

export async function getActiveHeroSlotsDirect() {
  try {
    const rows: any[] = await sql`
      SELECT id, title, excerpt, "coverImage", "ctaUrl", "ctaLabel",
             "badgeText", "authorName", "readTimeMinutes",
             "startDate"::text AS "startDate", "endDate"::text AS "endDate",
             "sortOrder"
      FROM "HeroSlot"
      WHERE "isActive" = true
        AND ("startDate" IS NULL OR "startDate" <= NOW())
        AND ("endDate" IS NULL OR "endDate" >= NOW())
      ORDER BY "sortOrder" ASC, "createdAt" DESC
      LIMIT 5
    `;
    return rows;
  } catch (e) {
    console.error('getActiveHeroSlotsDirect error:', e);
    return [];
  }
}

// ── Sponsors ──────────────────────────────────────────────────────────────────

export async function getActiveSponsorsDirect() {
  try {
    const sponsors = await sql`
      SELECT brand, tagline, "ctaUrl", "logoUrl"
      FROM "Sponsor"
      WHERE "isActive" = true
        AND ("startDate" IS NULL OR "startDate" <= NOW())
        AND ("endDate" IS NULL OR "endDate" >= NOW())
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `;
    return sponsors.length > 0 ? sponsors : null;
  } catch (error) {
    console.error('Error fetching active sponsors:', error);
    return null;
  }
}

export async function getActiveSponsorDirect() {
  const sponsors = await getActiveSponsorsDirect();
  return sponsors ? sponsors[0] : null;
}