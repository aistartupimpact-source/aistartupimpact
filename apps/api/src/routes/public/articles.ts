import { Router, Request, Response } from 'express';
import { prisma } from '@aistartupimpact/database';

const router = Router();

// GET /v1/articles — List published articles
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      type, category, tag, author, isFeatured,
      page = '1', limit = '10', sort = 'newest',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { status: 'PUBLISHED' };
    if (type) where.type = type;
    if (category) where.category = { slug: category };
    // if (tag) where.tags = { some: { tag: { slug: tag } } };
    if (author) where.author = { slug: author };
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { name: true, slug: true, avatar: true } },
          category: { select: { name: true, slug: true, color: true } }
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.article.count({ where }),
    ]);

    res.json({
      success: true,
      data: articles,
      meta: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
        hasNext: skip + articles.length < total,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch articles' });
  }
});

// GET /v1/articles/trending — Top 10 trending
router.get('/trending', async (_req: Request, res: Response) => {
  try {
    const trending = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 10,
      select: { id: true, title: true, slug: true, viewCount: true }
    });
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

    const article = await prisma.article.findUnique({
      where: { slug, status: 'PUBLISHED' },
      include: {
        author: { select: { name: true, slug: true, avatar: true } },
        category: { select: { name: true, slug: true } },
        tags: { include: { tag: true } }
      }
    });

    if (!article) {
      return res.status(404).json({ success: false, data: null, error: 'Article not found' });
    }

    res.json({ success: true, data: article });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch article' });
  }
});

export default router;
