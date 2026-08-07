// Direct DB queries for server components — bypasses the need for the API server
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { cached, CK } from './cache';

// Lazy sql client — not instantiated at module load time (avoids build-time DATABASE_URL errors)
let _sql: NeonQueryFunction<false, false> | undefined;
function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      // Build-time: return a stub that resolves to empty arrays so static pages can pre-render
      return ((() => Promise.resolve([])) as unknown) as NeonQueryFunction<false, false>;
    }
    _sql = neon(process.env.DATABASE_URL);
  }
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
        a."createdAt"::text AS "createdAt",
        a."updatedAt"::text AS "updatedAt",
        u.name AS "authorName", u.slug AS "authorSlug",
        c.name AS "categoryName", c.slug AS "categorySlug",
        a."toolId", a."startupId"
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

    // Cross-link: Fetch related startup if startupId is attached (for founder stories)
    let linkedStartup = null;
    if (a.startupId) {
      const startupRows = await sql`
        SELECT name, slug, founders
        FROM "Startup"
        WHERE id = ${a.startupId} AND "deletedAt" IS NULL
        LIMIT 1
      `;
      if (startupRows.length) {
        const startup = startupRows[0];
        linkedStartup = {
          name: startup.name,
          slug: startup.slug,
          founders: startup.founders || []
        };
      }
    }

    return {
      ...a,
      author: { name: a.authorName, slug: a.authorSlug },
      category: { name: a.categoryName, slug: a.categorySlug },
      linkedTool,
      linkedStartup
    };
  } catch (e) {
    console.error('getArticleBySlugDirect error:', e);
    return null;
  }
}

// ── Directory Entities ─────────────────────────────────────────────────────────

export async function getAiToolBySlugDirect(slug: string) {
  return cached(CK.tool(slug), { ttl: 120, staleTtl: 300 }, async () => {
    try {
      const rows = await sql`
        SELECT
          t.*,
          c.name AS "categoryName",
          c.slug AS "categorySlug",
          pc.name AS "parentCategoryName",
          pc.slug AS "parentCategorySlug",
          pc.icon AS "parentCategoryIcon",
          s.id AS "startupId", s.name AS "startupName", s.slug AS "startupSlug", s."logoUrl" AS "startupLogoUrl", s."totalFundingInr"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        LEFT JOIN "ToolCategory" pc ON pc.id = c."parentId"
        LEFT JOIN "Startup" s ON s.id = t."startupId"
        WHERE t.slug = ${slug} AND t."deletedAt" IS NULL
        LIMIT 1
      `;
      if (!rows.length) return null;
      const tool = rows[0];

      // Fetch all cross-linked data in parallel
      const [stories, fundingRounds, userReviews, useCases] = await Promise.all([
        sql`
          SELECT id, title, slug, excerpt, "coverImage", "publishedAt"::text AS "publishedAt"
          FROM "Article"
          WHERE "toolId" = ${tool.id} AND status = 'PUBLISHED' AND "deletedAt" IS NULL
          ORDER BY "publishedAt" DESC
        `,
        tool.startupId
          ? sql`
              SELECT "roundType", "amountInr", "amountUsd", "announcedAt"::text AS "announcedAt", "leadInvestors", sourceUrl
              FROM "FundingRound"
              WHERE "startupId" = ${tool.startupId}
              ORDER BY "announcedAt" DESC
            `
          : Promise.resolve([]),
        sql`
          SELECT r.id, r.rating, r.title, r.body, r."publishedAt"::text AS "publishedAt", r."helpfulCount",
                 u.name AS "authorName", u.role AS "authorRole"
          FROM "ToolReview" r
          JOIN "User" u ON u.id = r."userId"
          WHERE r."toolId" = ${tool.id} AND r.status = 'APPROVED'
          ORDER BY r."helpfulCount" DESC, r."publishedAt" DESC
        `,
        sql`
          SELECT id, text
          FROM "ToolUseCase"
          WHERE "toolId" = ${tool.id}
          ORDER BY id
        `,
      ]);

      return { ...tool, stories, fundingRounds, userReviews, useCases, category: tool.categoryName };
    } catch (e) {
      console.error('getAiToolBySlugDirect error:', e);
      return null;
    }
  });
}

export async function getSimilarToolsDirect(categoryId: string, excludeSlug: string, limit = 8) {
  try {
    // Priority 1: same subcategory, sorted by rating
    const sameCategory = await sql`
      SELECT
        t.id, t.name, t.slug, t.tagline, t."logoUrl",
        t."avgRating", t."pricingModel", t."websiteUrl",
        c.name AS "categoryName", c.slug AS "categorySlug",
        'same-category' AS "matchType"
      FROM "AiTool" t
      LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
      WHERE t."categoryId" = ${categoryId}
        AND t.slug != ${excludeSlug}
        AND t.status = 'APPROVED'
        AND t."deletedAt" IS NULL
      ORDER BY t."avgRating" DESC NULLS LAST, t."listingTier" DESC
      LIMIT ${limit}
    `;

    // If we have enough from same subcategory, return early
    if (sameCategory.length >= limit) {
      return sameCategory as any[];
    }

    // Priority 2: same parent category (sibling subcategories)
    const slugsAlready = sameCategory.map((r: any) => r.slug).concat([excludeSlug]);
    const needed = limit - sameCategory.length;
    const sameParent = await sql`
      SELECT
        t.id, t.name, t.slug, t.tagline, t."logoUrl",
        t."avgRating", t."pricingModel", t."websiteUrl",
        c.name AS "categoryName", c.slug AS "categorySlug",
        'same-parent' AS "matchType"
      FROM "AiTool" t
      LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
      WHERE c."parentId" = (SELECT "parentId" FROM "ToolCategory" WHERE id = ${categoryId})
        AND t."categoryId" != ${categoryId}
        AND t.slug != ALL(${slugsAlready}::text[])
        AND t.status = 'APPROVED'
        AND t."deletedAt" IS NULL
      ORDER BY t."avgRating" DESC NULLS LAST
      LIMIT ${needed}
    `;

    const combined = [...sameCategory, ...sameParent];
    if (combined.length >= limit) {
      return combined as any[];
    }

    // Priority 3: top-rated approved tools as fallback filler
    const allSlugs = combined.map((r: any) => r.slug).concat([excludeSlug]);
    const fillerNeeded = limit - combined.length;
    const filler = await sql`
      SELECT
        t.id, t.name, t.slug, t.tagline, t."logoUrl",
        t."avgRating", t."pricingModel", t."websiteUrl",
        c.name AS "categoryName", c.slug AS "categorySlug",
        'top-rated' AS "matchType"
      FROM "AiTool" t
      LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
      WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
        AND t.slug != ALL(${allSlugs}::text[])
      ORDER BY t."avgRating" DESC NULLS LAST, t."listingTier" DESC
      LIMIT ${fillerNeeded}
    `;

    return [...combined, ...filler] as Array<{
      id: string;
      name: string;
      slug: string;
      tagline: string;
      logoUrl: string | null;
      avgRating: string | null;
      pricingModel: string;
      websiteUrl: string;
      categoryName: string;
      categorySlug?: string;
      matchType?: string;
    }>;
  } catch (e) {
    console.error('getSimilarToolsDirect error:', e);
    return [];
  }
}

export async function getFeaturedToolsDirect(limit = 4) {
  return cached(CK.FEATURED_TOOLS, { ttl: 300, staleTtl: 600 }, async () => {
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
  });
}

export async function getPriorityToolsDirect(limit = 6) {
  return cached(CK.PRIORITY_TOOLS, { ttl: 300, staleTtl: 600 }, async () => {
    try {
      const rows: any[] = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", c.name AS "categoryName"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        WHERE t."listingTier" = 'PRIORITY' AND t.status = 'APPROVED' AND t."deletedAt" IS NULL
        ORDER BY md5(t.id || (EXTRACT(EPOCH FROM NOW())::bigint / 300)::text)
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
  });
}

export async function getToolCategoriesDirect() {
  try {
    const rows = await sql`
      SELECT id, name, slug, icon, description, "parentId", level, "toolCount", "sortOrder"
      FROM "ToolCategory"
      WHERE "isActive" = true
      ORDER BY level ASC, "sortOrder" ASC, name ASC
    `;
    return rows;
  } catch (e) {
    console.error('getToolCategoriesDirect error:', e);
    return [];
  }
}

/**
 * Get hierarchical tool categories: parents with nested subcategories.
 */
export async function getToolCategoryTreeDirect() {
  return cached(CK.TOOL_CATEGORIES, { ttl: 900, staleTtl: 1800 }, async () => {
    try {
      const parents = await sql`
        SELECT id, name, slug, icon, description, "toolCount", "sortOrder"
        FROM "ToolCategory"
        WHERE level = 0 AND "isActive" = true
        ORDER BY "sortOrder" ASC
      `;
      const subcategories = await sql`
        SELECT id, name, slug, description, "parentId", "toolCount", "sortOrder"
        FROM "ToolCategory"
        WHERE level = 1 AND "isActive" = true
        ORDER BY "sortOrder" ASC, name ASC
      `;

      const subsByParent = new Map<string, any[]>();
      for (const sub of subcategories) {
        const parentId = sub.parentId;
        if (!subsByParent.has(parentId)) subsByParent.set(parentId, []);
        subsByParent.get(parentId)!.push(sub);
      }

      return parents.map((p: any) => ({
        ...p,
        subcategories: subsByParent.get(p.id) || [],
      }));
    } catch (e) {
      console.error('getToolCategoryTreeDirect error:', e);
      return [];
    }
  });
}

/**
 * Get tag groups with tags for the public tools listing filter sidebar.
 * Only returns active, non-admin-only groups with active tags that have tagCount > 0 OR are commonly needed.
 */
export async function getToolTagGroupsForFilterDirect() {
  return cached(CK.TAG_GROUPS, { ttl: 900, staleTtl: 1800 }, async () => {
    try {
      const groups = await sql`
        SELECT id, name, slug, icon, description, "sortOrder", "displayMode", "maxVisibleDefault"
        FROM "ToolTagGroup"
        WHERE "isActive" = true AND "isAdminOnly" = false
        ORDER BY "sortOrder" ASC
      `;

      const tags = await sql`
        SELECT id, name, slug, emoji, "groupId", "sortOrder", "tagCount"
        FROM "ToolSystemTag"
        WHERE "isActive" = true
        ORDER BY "sortOrder" ASC, name ASC
      `;

      const tagsByGroup: Record<string, any[]> = {};
      for (const tag of tags) {
        const gid = (tag as any).groupId;
        if (!tagsByGroup[gid]) tagsByGroup[gid] = [];
        tagsByGroup[gid].push(tag);
      }

      return groups.map((g: any) => ({
        ...g,
        tags: tagsByGroup[g.id] || [],
      }));
    } catch (e) {
      console.error('getToolTagGroupsForFilterDirect error:', e);
      return [];
    }
  });
}

/**
 * Get tag IDs mapped to tool IDs for client-side filtering.
 * Returns a map: { toolId -> [tagId, tagId, ...] }
 */
export async function getToolTagMappingsDirect() {
  return cached(CK.TOOL_TAG_MAP, { ttl: 300, staleTtl: 600 }, async () => {
    try {
      const mappings = await sql`
        SELECT "toolId", "tagId"
        FROM "ToolSystemTagMapping"
      `;
      const map: Record<string, string[]> = {};
      for (const m of mappings) {
        const tid = (m as any).toolId;
        if (!map[tid]) map[tid] = [];
        map[tid].push((m as any).tagId);
      }
      return map;
    } catch (e) {
      console.error('getToolTagMappingsDirect error:', e);
      return {};
    }
  });
}

/**
 * Get all tags for a specific tool, grouped by tag group.
 * Used on tool detail pages.
 */
export async function getToolTagsGroupedDirect(toolId: string) {
  return cached(CK.toolTags(toolId), { ttl: 300, staleTtl: 600 }, async () => {
  try {
    const rows = await sql`
      SELECT t.id, t.name, t.slug, t.emoji, 
             g.id AS "groupId", g.name AS "groupName", g.slug AS "groupSlug", g.icon AS "groupIcon", g."sortOrder" AS "groupSortOrder"
      FROM "ToolSystemTagMapping" m
      JOIN "ToolSystemTag" t ON t.id = m."tagId"
      JOIN "ToolTagGroup" g ON g.id = t."groupId"
      WHERE m."toolId" = ${toolId} AND t."isActive" = true AND g."isActive" = true
      ORDER BY g."sortOrder" ASC, t."sortOrder" ASC
    `;

    // Group by tag group
    const groupMap = new Map<string, { id: string; name: string; slug: string; icon: string | null; tags: any[] }>();
    for (const row of rows) {
      const r = row as any;
      if (!groupMap.has(r.groupId)) {
        groupMap.set(r.groupId, {
          id: r.groupId,
          name: r.groupName,
          slug: r.groupSlug,
          icon: r.groupIcon,
          tags: [],
        });
      }
      groupMap.get(r.groupId)!.tags.push({
        id: r.id,
        name: r.name,
        slug: r.slug,
        emoji: r.emoji,
      });
    }

    return Array.from(groupMap.values());
  } catch (e) {
    console.error('getToolTagsGroupedDirect error:', e);
    return [];
  }
  });
}

export async function getDirectoryToolsDirect(categorySlug?: string) {
  return cached(CK.toolDirectory(categorySlug || ''), { ttl: 60, staleTtl: 120 }, async () => {
  try {
    let rows: any[];
    if (categorySlug && categorySlug !== 'all') {
      // Check if slug is a parent category or subcategory
      rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, LEFT(t.description, 130) AS description, t."pricingModel", t."logoUrl", t."avgRating",
               t."hasApi", t."hasMobileApp", t."freeTrialDays", t."upvoteCount", t."launchYear", t."headquartersCountry", t."founderNames",
               c.name AS "categoryName", c.slug AS "categorySlug",
               pc.name AS "parentCategoryName", pc.slug AS "parentCategorySlug",
               tfc.tier AS "campaignTier"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        LEFT JOIN "ToolCategory" pc ON pc.id = c."parentId"
        LEFT JOIN "ToolFeaturedCampaign" tfc ON tfc."toolId" = t.id
          AND tfc."cancelledAt" IS NULL
          AND tfc."startDate" <= NOW() AND tfc."endDate" >= NOW()
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
          AND (
            c.slug = ${categorySlug}
            OR c."parentId" IN (SELECT id FROM "ToolCategory" WHERE slug = ${categorySlug})
          )
        ORDER BY
          CASE WHEN tfc.tier = 'FEATURED' THEN 1
               WHEN tfc.tier = 'PRIORITY' THEN 2
               WHEN t."listingTier" = 'FEATURED' THEN 1
               WHEN t."listingTier" = 'PRIORITY' THEN 2
               ELSE 3 END ASC,
          t."createdAt" DESC
      `;
    } else {
      rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, LEFT(t.description, 130) AS description, t."pricingModel", t."logoUrl", t."avgRating",
               t."hasApi", t."hasMobileApp", t."freeTrialDays", t."upvoteCount", t."launchYear", t."headquartersCountry", t."founderNames",
               c.name AS "categoryName", c.slug AS "categorySlug",
               pc.name AS "parentCategoryName", pc.slug AS "parentCategorySlug",
               tfc.tier AS "campaignTier"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        LEFT JOIN "ToolCategory" pc ON pc.id = c."parentId"
        LEFT JOIN "ToolFeaturedCampaign" tfc ON tfc."toolId" = t.id
          AND tfc."cancelledAt" IS NULL
          AND tfc."startDate" <= NOW() AND tfc."endDate" >= NOW()
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
        ORDER BY
          CASE WHEN tfc.tier = 'FEATURED' THEN 1
               WHEN tfc.tier = 'PRIORITY' THEN 2
               WHEN t."listingTier" = 'FEATURED' THEN 1
               WHEN t."listingTier" = 'PRIORITY' THEN 2
               ELSE 3 END ASC,
          t."createdAt" DESC
      `;
    }

    return rows.map((t: any) => ({
      id: t.id,
      slug: t.slug,
      name: t.name,
      tagline: t.tagline,
      logoUrl: t.logoUrl || null,
      category: t.categoryName || 'General',
      categorySlug: t.categorySlug || 'general',
      parentCategory: t.parentCategoryName || null,
      parentCategorySlug: t.parentCategorySlug || null,
      rating: parseFloat(t.avgRating || '4.0'),
      pricing: t.pricingModel || 'Free',
      verdict: t.description || 'An excellent AI tool optimized for productivity.',
      hasApi: t.hasApi || false,
      hasMobileApp: t.hasMobileApp || false,
      freeTrialDays: t.freeTrialDays || null,
      upvoteCount: parseInt(t.upvoteCount) || 0,
      launchYear: t.launchYear || null,
      country: t.headquartersCountry || null,
      founderNames: t.founderNames || []
    }));
  } catch (e) {
    console.error('getDirectoryToolsDirect error:', e);
    return [];
  }
  });
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
  return cached(CK.HERO_ARTICLE, { ttl: 120, staleTtl: 300 }, async () => {
    const rows = await getArticlesDirect({ isFeatured: true, limit: 1 });
    if (rows.length) return rows[0];
    const latest = await getArticlesDirect({ limit: 1 });
    return latest.length ? latest[0] : null;
  });
}

export async function getLatestStoriesDirect(limit = 3) {
  return cached(CK.LATEST_STORIES, { ttl: 60, staleTtl: 120 }, async () => {
    return getArticlesDirect({ limit });
  });
}

export async function getFounderSpotlightDirect(limit = 5) {
  return cached(CK.FOUNDER_SPOTLIGHTS, { ttl: 120, staleTtl: 300 }, async () => {
    const rows = await getArticlesDirect({ type: 'STORY', limit });
    return rows.length ? rows : null;
  });
}

export async function getIndiaAIEcosystemDirect(limit = 4) {
  return cached(CK.INDIA_AI_ECOSYSTEM, { ttl: 120, staleTtl: 300 }, async () => {
    return getArticlesDirect({ limit });
  });
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
      ORDER BY md5(cr.id || (EXTRACT(EPOCH FROM NOW())::bigint / 300)::text)
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
  return cached(CK.LIVE_TICKERS, { ttl: 60, staleTtl: 120 }, async () => {
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
  });
}

// ── Featured Startups ──────────────────────────────────────────────────────────────────

export async function getFeaturedStartupDirect() {
  return cached(CK.FEATURED_STARTUPS, { ttl: 300, staleTtl: 600 }, async () => {
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
  });
}

// ── Funding Digests ──────────────────────────────────────────────────────────────────

export async function getFundingDigestsDirect(limit = 3) {
  return cached(CK.FUNDING_DIGESTS, { ttl: 120, staleTtl: 300 }, async () => {
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
  });
}

export async function getAllFundingRoundsDirect() {
  try {
    const rows = await sql`
      SELECT 
        fr.id, fr."roundType", fr."amountInr", fr."amountUsd",
        fr."announcedAt"::text AS "announcedAt", fr."leadInvestors", fr."allInvestors",
        s.name AS "startupName", s.slug AS "startupSlug", s."headquartersCity",
        s.category AS "startupCategory"
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
  return cached(CK.HERO_SLOTS, { ttl: 300, staleTtl: 600 }, async () => {
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
  });
}

// ── Sponsors ──────────────────────────────────────────────────────────────────

export async function getActiveSponsorsDirect() {
  return cached(CK.ACTIVE_SPONSORS, { ttl: 300, staleTtl: 600 }, async () => {
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
  });
}

export async function getActiveSponsorDirect() {
  const sponsors = await getActiveSponsorsDirect();
  return sponsors ? sponsors[0] : null;
}

// ── Funding Rounds ──────────────────────────────────────────────────────────────────

export async function getFundingRoundBySlugDirect(slug: string) {
  try {
    const rows = await sql`
      SELECT 
        fr.id, fr.slug, fr."roundType", fr."amountInr", fr."amountUsd",
        fr."announcedAt"::text AS "announcedAt", 
        fr."leadInvestors", fr."allInvestors", fr."sourceUrl",
        s.name AS "startupName", 
        s.slug AS "startupSlug", 
        s."headquartersCity"
      FROM "FundingRound" fr
      JOIN "Startup" s ON s.id = fr."startupId"
      WHERE fr.slug = ${slug} AND s."deletedAt" IS NULL
      LIMIT 1
    `;
    return rows.length ? rows[0] : null;
  } catch (error) {
    console.error('getFundingRoundBySlugDirect error:', error);
    return null;
  }
}


// ── db adapter for API routes that use db.query() pattern ─────────────────────
export const db = {
  async query(text: string, params?: any[]) {
    const s = getSql();
    // Convert $1, $2 style params to tagged template
    if (params && params.length > 0) {
      // Use Neon's sql function with raw query
      const result = await s.call(s, [text] as any, ...params);
      return { rows: result as any[] };
    }
    const result = await s.call(s, [text] as any);
    return { rows: result as any[] };
  }
};


/**
 * Get pros and cons for a tool (for detail page display).
 */
export async function getToolProsConsDirect(toolId: string) {
  return cached(CK.toolProsCons(toolId), { ttl: 300, staleTtl: 600 }, async () => {
    try {
      const [pros, cons] = await Promise.all([
        sql`SELECT id, text FROM "ToolPro" WHERE "toolId" = ${toolId} ORDER BY id`,
        sql`SELECT id, text FROM "ToolCon" WHERE "toolId" = ${toolId} ORDER BY id`,
      ]);
      return { pros, cons };
    } catch (e) {
      console.error('getToolProsConsDirect error:', e);
      return { pros: [], cons: [] };
    }
  });
}


/**
 * Get alternative tools for a tool (for detail page).
 */
export async function getToolAlternativesDirect(toolId: string) {
  return cached(CK.toolAlternatives(toolId), { ttl: 300, staleTtl: 600 }, async () => {
    try {
      const rows = await sql`
        SELECT t.id, t.name, t.slug, t."logoUrl", t.tagline, t."avgRating", t."pricingModel",
               c.name AS "categoryName"
        FROM "ToolAlternative" a
        JOIN "AiTool" t ON t.id = a."alternativeId"
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        WHERE a."toolId" = ${toolId} AND t."deletedAt" IS NULL AND t.status = 'APPROVED'
        ORDER BY t."avgRating" DESC
        LIMIT 10
      `;
      return rows;
    } catch (e) {
      console.error('getToolAlternativesDirect error:', e);
      return [];
    }
  });
}


/**
 * Get founder responses to reviews for display on the detail page.
 * Returns a map: { reviewId -> { body, founderName, createdAt } }
 */
export async function getReviewResponsesDirect(toolId: string) {
  return cached(CK.toolReviewResponses(toolId), { ttl: 120, staleTtl: 300 }, async () => {
    try {
      const rows = await sql`
        SELECT rr."reviewId", rr.body, rr."createdAt", fu.name AS "founderName"
        FROM "ToolReviewResponse" rr
        JOIN "FounderUser" fu ON fu.id = rr."founderId"
        JOIN "ToolReview" tr ON tr.id = rr."reviewId"
        WHERE tr."toolId" = ${toolId}
      `;
      const map: Record<string, any> = {};
      for (const r of rows) {
        map[(r as any).reviewId] = { body: (r as any).body, founderName: (r as any).founderName, createdAt: (r as any).createdAt };
      }
      return map;
    } catch (e) {
      console.error('getReviewResponsesDirect error:', e);
      return {};
    }
  });
}


// ─── Discovery Sections ─────────────────────────────────────────────────────

/**
 * Get trending tools (by click velocity in last 7 days).
 */
export async function getTrendingToolsDirect(limit = 12) {
  return cached(CK.TRENDING, { ttl: 600, staleTtl: 1200 }, async () => {
    try {
      const rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", t."pricingModel",
               c.name AS "categoryName", c.slug AS "categorySlug",
               COUNT(ac.id)::int AS "recentClicks"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        LEFT JOIN "AffiliateClick" ac ON ac."toolId" = t.id AND ac."createdAt" >= NOW() - INTERVAL '7 days'
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
        GROUP BY t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", t."pricingModel", c.name, c.slug
        HAVING COUNT(ac.id) > 0
        ORDER BY COUNT(ac.id) DESC, t."avgRating" DESC
        LIMIT ${limit}
      `;
      return rows;
    } catch (e) {
      console.error('getTrendingToolsDirect error:', e);
      return [];
    }
  });
}

/**
 * Get recently added tools (last 30 days, approved).
 */
export async function getRecentlyAddedToolsDirect(limit = 12) {
  return cached(CK.RECENT_TOOLS, { ttl: 300, staleTtl: 600 }, async () => {
    try {
      const rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", t."pricingModel",
               c.name AS "categoryName", c.slug AS "categorySlug"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
          AND t."createdAt" >= NOW() - INTERVAL '30 days'
        ORDER BY t."createdAt" DESC
        LIMIT ${limit}
      `;
      return rows;
    } catch (e) {
      console.error('getRecentlyAddedToolsDirect error:', e);
      return [];
    }
  });
}

/**
 * Get editor's picks (featured tools with active campaigns).
 */
export async function getEditorPicksDirect(limit = 12) {
  return cached(CK.EDITORS_PICKS, { ttl: 900, staleTtl: 1800 }, async () => {
    try {
      const rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", t."pricingModel",
               c.name AS "categoryName", c.slug AS "categorySlug"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        LEFT JOIN "ToolFeaturedCampaign" tfc ON tfc."toolId" = t.id
          AND tfc."cancelledAt" IS NULL AND tfc."startDate" <= NOW() AND tfc."endDate" >= NOW()
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
          AND (tfc.tier = 'FEATURED' OR t."listingTier" = 'FEATURED')
        ORDER BY t."avgRating" DESC
        LIMIT ${limit}
      `;
      return rows;
    } catch (e) {
      console.error('getEditorPicksDirect error:', e);
      return [];
    }
  });
}


/**
 * Get most upvoted tools this month (30-day window for time decay).
 */
export async function getMostUpvotedThisMonthDirect(limit = 12) {
  return cached(CK.UPVOTED_MONTH, { ttl: 600, staleTtl: 1200 }, async () => {
    try {
      const rows = await sql`
        SELECT t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", t."pricingModel",
               c.name AS "categoryName", c.slug AS "categorySlug",
               COUNT(u.id)::int AS "monthlyUpvotes"
        FROM "AiTool" t
        LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
        JOIN "ToolUpvote" u ON u."toolId" = t.id AND u."createdAt" >= NOW() - INTERVAL '30 days'
        WHERE t.status = 'APPROVED' AND t."deletedAt" IS NULL
        GROUP BY t.id, t.name, t.slug, t.tagline, t."logoUrl", t."avgRating", t."pricingModel", c.name, c.slug
        ORDER BY COUNT(u.id) DESC
        LIMIT ${limit}
      `;
      return rows;
    } catch (e) {
      console.error('getMostUpvotedThisMonthDirect error:', e);
      return [];
    }
  });
}


// ─── Homepage Statistics (PostgreSQL = source of truth, Redis = cache) ───────

export async function getHomepageStatsDirect() {
  return cached(CK.HOMEPAGE_STATS, { ttl: 300, staleTtl: 600 }, async () => {
    try {
      const [tools, startups, events, funding] = await Promise.all([
        sql`SELECT COUNT(*)::int AS c FROM "AiTool" WHERE status = 'APPROVED' AND "deletedAt" IS NULL`,
        sql`SELECT COUNT(*)::int AS c FROM "Startup" WHERE "isApproved" = true AND "deletedAt" IS NULL`,
        sql`SELECT COUNT(*)::int AS c FROM "Event" WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL`,
        sql`SELECT COUNT(*)::int AS c FROM "FundingRound"`,
      ]);
      return {
        toolCount: tools[0]?.c || 0,
        startupCount: startups[0]?.c || 0,
        eventCount: events[0]?.c || 0,
        fundingCount: funding[0]?.c || 0,
      };
    } catch (e) {
      console.error('getHomepageStatsDirect error:', e);
      return { toolCount: 0, startupCount: 0, eventCount: 0, fundingCount: 0 };
    }
  });
}
