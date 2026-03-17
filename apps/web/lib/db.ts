// Direct DB queries for server components — bypasses the need for the API server
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function getArticleBySlugDirect(slug: string) {
  try {
    const rows: any[] = await sql`
      SELECT
        a.id, a.title, a.slug, a.type, a.excerpt, a.content,
        a."coverImage", a."thumbnailImage", a."readTimeMinutes", a."viewCount", a."isFeatured",
        a."publishedAt"::text AS "publishedAt",
        u.name AS "authorName", u.slug AS "authorSlug",
        c.name AS "categoryName", c.slug AS "categorySlug"
      FROM "Article" a
      LEFT JOIN "User" u ON u.id = a."authorId"
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      WHERE a.slug = ${slug} AND a.status = 'PUBLISHED' AND a."deletedAt" IS NULL
      LIMIT 1
    `;
    if (!rows.length) return null;
    const a = rows[0];
    return {
      ...a,
      author: { name: a.authorName, slug: a.authorSlug },
      category: { name: a.categoryName, slug: a.categorySlug },
    };
  } catch (e) {
    console.error('getArticleBySlugDirect error:', e);
    return null;
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
        AND "startDate" <= NOW()
        AND "endDate" >= NOW()
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

export async function getActiveSponsorDirect() {
  try {
    const sponsors = await sql`
      SELECT brand, tagline, "ctaUrl", "logoUrl"
      FROM "Sponsor" 
      WHERE "isActive" = true 
      ORDER BY "sortOrder" ASC, "createdAt" DESC
      LIMIT 1
    `;
    return sponsors.length > 0 ? sponsors[0] : null;
  } catch (error) {
    console.error('Error fetching active sponsor:', error);
    return null;
  }
}