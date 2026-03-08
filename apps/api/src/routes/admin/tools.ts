import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { prisma } from '@aistartupimpact/database';

const router = Router();
router.use(authenticateToken as any);

// GET /v1/admin/tools
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, categoryId, page = '1', limit = '20' } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (status) where.status = status;
      if (categoryId) where.categoryId = categoryId;

      const [tools, total] = await Promise.all([
        prisma.aiTool.findMany({
          where,
          include: { category: true },
          orderBy: { createdAt: 'desc' },
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
  }
);

// POST /v1/admin/tools
router.post('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, slug, tagline, description, websiteUrl, categoryId, pricingModel } = req.body;

      const tool = await prisma.aiTool.create({
        data: {
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          tagline,
          description,
          websiteUrl,
          categoryId,
          pricingModel: pricingModel || 'FREEMIUM',
          status: 'PENDING',
          submittedBy: req.user!.id,
        },
      });

      res.status(201).json({ success: true, data: tool });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to create tool' });
    }
  }
);

// PUT /v1/admin/tools/:id
router.put('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, slug, tagline, description, websiteUrl, categoryId, pricingModel, isFeatured, avgRating } = req.body;

      const tool = await prisma.aiTool.update({
        where: { id },
        data: {
          name,
          ...(slug && { slug }),
          tagline,
          description,
          websiteUrl,
          ...(categoryId && { categoryId }),
          ...(pricingModel && { pricingModel }),
          ...(isFeatured !== undefined && { isFeatured }),
          ...(avgRating !== undefined && { avgRating }),
        },
      });

      res.json({ success: true, data: tool });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to update tool' });
    }
  }
);

// POST /v1/admin/tools/:id/approve
router.post('/:id/approve',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const tool = await prisma.aiTool.update({
        where: { id: req.params.id, status: 'PENDING' },
        data: { status: 'APPROVED', approvedBy: req.user!.id, approvedAt: new Date() }
      });
      res.json({ success: true, data: tool });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to approve tool' });
    }
  }
);

export default router;
