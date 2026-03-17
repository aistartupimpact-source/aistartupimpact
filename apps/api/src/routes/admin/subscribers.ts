import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { prisma } from '@aistartupimpact/database';

const router = Router();
router.use(authenticateToken as any);

// GET /v1/admin/subscribers
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'AD_MANAGER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
      const skip = (page - 1) * limit;

      const search = req.query.search as string | undefined;

      const where: any = {};

      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, subscribers] = await Promise.all([
        prisma.newsletterSubscriber.count({ where }),
        prisma.newsletterSubscriber.findMany({
          where,
          skip,
          take: limit,
          orderBy: { subscribedAt: 'desc' },
        })
      ]);

      const pages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: subscribers.map((sub: any) => ({
          id: sub.id,
          email: sub.email,
          name: sub.name,
          source: sub.source || 'website',
          isActive: sub.isActive,
          tags: sub.tags,
          subscribedAt: sub.subscribedAt.toISOString(),
        })),
        meta: {
          page,
          limit,
          total,
          pages,
          hasNext: page < pages,
        }
      });
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      res.status(500).json({ success: false, data: null, error: 'Failed to fetch subscribers' });
    }
  }
);

// DELETE /v1/admin/subscribers/:id
router.delete('/:id',
  requireRole(['SUPER_ADMIN']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      await prisma.newsletterSubscriber.delete({
        where: { id }
      });

      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      console.error('Failed to delete subscriber:', error);
      res.status(500).json({ success: false, data: null, error: 'Failed to delete subscriber' });
    }
  }
);

export default router;
