import { Router, Request, Response } from 'express';
import { prisma } from '@aistartupimpact/database';
import { cacheRoute } from '../../lib/redis';

const router = Router();

// GET /v1/articles — List published articles
router.get('/', cacheRoute(120), async (req: Request, res: Response) => {
  try {
    const {
      type, category, tag, author, isFeatured,
      page = '1', limit = '10',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    // Build WHERE conditions for raw SQL
    const conditions: string[] = [`a.status = 'PUBLISHED'`, `a."deletedAt" IS NULL`];
    if (type) conditions.push(`a.type = '${(type as string).replace(/'/g, "''")}'`);
    if (category) conditions.push(`c.slug = '${(category as string).replace(/'/g, "''")}'`);
    if (author) conditions.push(`u.slug = '${(author as string).replace(/'/g, "''")}'`);
    if (isFeatured !== undefined) conditions.push(`a."isFeatured" = ${isFeatured === 'true'}`);

    const whereClause = conditions.join(' AND ');

    const [articles, countResult]: [any[], any[]] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT
          a.id, a.title, a.slug, a.type, a.excerpt, a."coverImage",
          a."readTimeMinutes", a."viewCount", a."isFeatured",
          a."publishedAt"::text AS "publishedAt",
          u.name AS "authorName", u.slug AS "authorSlug", u.avatar AS "authorAvatar",
          c.name AS "categoryName", c.slug AS "categorySlug", c.color AS "categoryColor"
        FROM "Article" a
        LEFT JOIN "User" u ON u.id = a."authorId"
        LEFT JOIN "Category" c ON c.id = a."categoryId"
        WHERE ${whereClause}
        ORDER BY a."publishedAt" DESC NULLS LAST
        LIMIT ${take} OFFSET ${skip}
      `),
      prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "Article" a LEFT JOIN "Category" c ON c.id = a."categoryId" LEFT JOIN "User" u ON u.id = a."authorId" WHERE ${whereClause}`),
    ]);

    const total = countResult[0]?.count || 0;
    const data = articles.map((a: any) => ({
      id: a.id, title: a.title, slug: a.slug, type: a.type,
      excerpt: a.excerpt, coverImage: a.coverImage,
      readTimeMinutes: a.readTimeMinutes, viewCount: a.viewCount,
      isFeatured: a.isFeatured, publishedAt: a.publishedAt,
      author: { name: a.authorName, slug: a.authorSlug, avatar: a.authorAvatar },
      category: { name: a.categoryName, slug: a.categorySlug, color: a.categoryColor },
    }));

    res.json({
      success: true, data,
      meta: { page: parseInt(page as string), limit: take, total, pages: Math.ceil(total / take), hasNext: skip + data.length < total },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch articles' });
  }
});

// GET /v1/articles/trending — Top 10 trending
router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const trending: any[] = await prisma.$queryRaw`
      SELECT id, title, slug, "viewCount"
      FROM "Article"
      WHERE status = 'PUBLISHED' AND "deletedAt" IS NULL
      ORDER BY "viewCount" DESC
      LIMIT 10
    `;
    res.json({ success: true, data: trending });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch trending' });
  }
});

// GET /v1/articles/:slug — Single article by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const rows: any[] = await prisma.$queryRaw`
      SELECT
        a.id, a.title, a.slug, a.type, a.excerpt, a.content,
        a."coverImage", a."readTimeMinutes", a."viewCount", a."isFeatured",
        a."publishedAt"::text AS "publishedAt",
        u.name AS "authorName", u.slug AS "authorSlug", u.avatar AS "authorAvatar",
        c.name AS "categoryName", c.slug AS "categorySlug"
      FROM "Article" a
      LEFT JOIN "User" u ON u.id = a."authorId"
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      WHERE a.slug = ${slug} AND a.status = 'PUBLISHED' AND a."deletedAt" IS NULL
      LIMIT 1
    `;

    if (!rows.length) {
      return res.status(404).json({ success: false, data: null, error: 'Article not found' });
    }

    const a = rows[0];
    const article = {
      id: a.id, title: a.title, slug: a.slug, type: a.type,
      excerpt: a.excerpt, content: a.content, coverImage: a.coverImage,
      readTimeMinutes: a.readTimeMinutes, viewCount: a.viewCount,
      isFeatured: a.isFeatured, publishedAt: a.publishedAt,
      author: { name: a.authorName, slug: a.authorSlug, avatar: a.authorAvatar },
      category: { name: a.categoryName, slug: a.categorySlug },
    };

    res.json({ success: true, data: article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch article' });
  }
});

export default router;
