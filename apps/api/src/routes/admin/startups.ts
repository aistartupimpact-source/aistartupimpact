import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { prisma } from '@aistartupimpact/database';

const router = Router();
router.use(authenticateToken as any);

// GET /v1/admin/startups — List all startups
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, sector, page = '1', limit = '20' } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (status) where.status = status;
      if (sector) where.sector = { contains: sector as string, mode: 'insensitive' };

      const [startups, total] = await Promise.all([
        prisma.startup.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.startup.count({ where }),
      ]);

      res.json({
        success: true,
        data: startups,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
          hasNext: skip + startups.length < total,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to fetch startups' });
    }
  }
);

// POST /v1/admin/startups — Create startup profile
router.post('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, slug, sector, fundingStage, totalFunding, founder, location, description, logo, websiteUrl } = req.body;

      const startup = await prisma.startup.create({
        data: {
          name,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          sector,
          fundingStage,
          totalFunding,
          founder,
          location,
          description,
          logo,
          websiteUrl,
          status: 'DRAFT',
          submittedBy: req.user!.id,
        },
      });

      res.status(201).json({ success: true, data: startup });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to create startup' });
    }
  }
);

// PUT /v1/admin/startups/:id — Update startup
router.put('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, slug, sector, fundingStage, totalFunding, founder, location, description, logo, websiteUrl, isFeatured, status } = req.body;

      const startup = await prisma.startup.update({
        where: { id },
        data: {
          name,
          ...(slug && { slug }),
          sector,
          fundingStage,
          totalFunding,
          founder,
          location,
          description,
          logo,
          websiteUrl,
          ...(isFeatured !== undefined && { isFeatured }),
          ...(status && { status }),
        },
      });

      res.json({ success: true, data: startup });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to update startup' });
    }
  }
);

// DELETE /v1/admin/startups/:id
router.delete('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.startup.delete({ where: { id } });
      res.json({ success: true, data: { id, deleted: true } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to delete startup' });
    }
  }
);

export default router;
