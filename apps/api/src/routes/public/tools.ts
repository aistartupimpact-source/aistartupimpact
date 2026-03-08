import { Router, Request, Response } from 'express';
import { prisma } from '@aistartupimpact/database';

const router = Router();

// GET /v1/tools — List tools with filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category, pricingModel, hasApi, freeTrialDays, minRating, isFeatured,
      page = '1', limit = '12', sort = 'rating',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = { status: 'APPROVED' };
    if (category) where.category = { slug: category };
    if (pricingModel) where.pricingModel = pricingModel;
    if (hasApi === 'true') where.hasApi = true;
    if (minRating) where.avgRating = { gte: parseFloat(minRating as string) };
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';

    const [tools, total] = await Promise.all([
      prisma.aiTool.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: sort === 'rating' ? { avgRating: 'desc' } : { createdAt: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.aiTool.count({ where }),
    ]);

    res.json({
      success: true,
      data: tools,
      meta: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string)),
        hasNext: skip + tools.length < total,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch tools' });
  }
});

// GET /v1/tools/:slug — Single tool
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const tool = await prisma.aiTool.findUnique({
      where: { slug, status: 'APPROVED' },
      include: {
        category: { select: { name: true, slug: true } },
        pros: { select: { text: true } },
        cons: { select: { text: true } },
        useCases: { select: { text: true } }
      }
    });

    if (!tool) {
      return res.status(404).json({ success: false, data: null, error: 'Tool not found' });
    }

    res.json({ success: true, data: tool });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch tool' });
  }
});

// GET /v1/tools/compare — Compare up to 3 tools
router.get('/compare/:toolIds', async (req: Request, res: Response) => {
  try {
    const toolIds = req.params.toolIds.split(',').slice(0, 3);
    const tools = await prisma.aiTool.findMany({
      where: { id: { in: toolIds }, status: 'APPROVED' },
      include: {
        category: { select: { name: true, slug: true } },
        pros: { select: { text: true } },
        cons: { select: { text: true } },
      }
    });
    res.json({ success: true, data: { toolIds, comparison: tools } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Comparison failed' });
  }
});

export default router;
