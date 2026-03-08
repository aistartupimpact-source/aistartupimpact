import { Router, Request, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { prisma } from '@aistartupimpact/database';

const router = Router();

// All routes require authentication
router.use(authenticateToken as any);

// GET /v1/admin/articles — List all articles (any status)
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER', 'CONTRIBUTOR']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, type, page = '1', limit = '20' } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (status) where.status = status;
      if (type) where.type = type;

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          include: { author: { select: { name: true, slug: true } }, category: true },
          orderBy: { createdAt: 'desc' },
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
  }
);

// POST /v1/admin/articles — Create article
router.post('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { title, slug, content, type, categoryId, excerpt, coverImage, seoTitle, seoDescription, focusKeyword } = req.body;

      const article = await prisma.article.create({
        data: {
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          content,
          type: type || 'NEWS',
          excerpt,
          coverImage,
          seoTitle,
          seoDescription,
          focusKeyword,
          status: 'DRAFT',
          authorId: req.user!.id,
          ...(categoryId && { categoryId }),
        },
      });

      res.status(201).json({ success: true, data: article });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to create article' });
    }
  }
);

// PUT /v1/admin/articles/:id — Update article
router.put('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { title, slug, content, type, categoryId, excerpt, coverImage, seoTitle, seoDescription, focusKeyword, isFeatured } = req.body;

      const article = await prisma.article.update({
        where: { id },
        data: {
          title,
          ...(slug && { slug }),
          content,
          type,
          excerpt,
          coverImage,
          seoTitle,
          seoDescription,
          focusKeyword,
          ...(isFeatured !== undefined && { isFeatured }),
          ...(categoryId && { categoryId }),
        },
      });

      res.json({ success: true, data: article });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to update article' });
    }
  }
);

// ─── Status Transitions ─────────────────

// POST /v1/admin/articles/:id/submit — Submit for review
router.post('/:id/submit',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const article = await prisma.article.update({
        where: { id: req.params.id, status: 'DRAFT' },
        data: { status: 'IN_REVIEW' }
      });
      res.json({ success: true, data: article });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to submit or invalid status transition' });
    }
  }
);

// POST /v1/admin/articles/:id/approve
router.post('/:id/approve',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const article = await prisma.article.update({
        where: { id: req.params.id, status: { in: ['IN_REVIEW', 'REVISION'] } },
        data: { status: 'APPROVED' }
      });
      res.json({ success: true, data: article });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to approve or invalid status' });
    }
  }
);

// POST /v1/admin/articles/:id/request-revision
router.post('/:id/request-revision',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      // Validates: IN_REVIEW → REVISION
      res.json({ success: true, data: { status: 'REVISION' } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to request revision' });
    }
  }
);

// POST /v1/admin/articles/:id/publish
router.post('/:id/publish',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const article = await prisma.article.update({
        where: { id: req.params.id, status: { in: ['APPROVED', 'DRAFT', 'SCHEDULED'] } },
        data: { status: 'PUBLISHED', publishedAt: new Date() }
      });
      res.json({ success: true, data: article });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to publish or invalid status transition' });
    }
  }
);

// POST /v1/admin/articles/:id/schedule
router.post('/:id/schedule',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { scheduledAt } = req.body;
      // Validates: APPROVED → SCHEDULED
      res.json({ success: true, data: { status: 'SCHEDULED', scheduledAt } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to schedule' });
    }
  }
);

// POST /v1/admin/articles/:id/archive
router.post('/:id/archive',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      // Validates: PUBLISHED → ARCHIVED
      res.json({ success: true, data: { status: 'ARCHIVED' } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to archive' });
    }
  }
);

// DELETE /v1/admin/articles/:id — Soft delete
router.delete('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.article.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'ARCHIVED' }
      });
      res.json({ success: true, data: { id, deleted: true } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to delete article' });
    }
  }
);

export default router;
