import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { prisma } from '@aistartupimpact/database';

const router = Router();
router.use(authenticateToken as any);

// GET /v1/admin/funding — List all funding rounds
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { page = '1', limit = '20' } = req.query;
      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const [rounds, total] = await Promise.all([
        prisma.fundingRound.findMany({
          include: { startup: { select: { name: true, slug: true, logoUrl: true } } },
          orderBy: { announcedAt: 'desc' },
          skip,
          take: parseInt(limit as string),
        }),
        prisma.fundingRound.count(),
      ]);

      res.json({
        success: true,
        data: rounds,
        meta: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
          hasNext: skip + rounds.length < total,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to fetch funding rounds' });
    }
  }
);

// POST /v1/admin/funding — Create funding round
router.post('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { startupId, roundType, amountInr, amountUsd, announcedAt, leadInvestors, allInvestors, valuation, sourceUrl } = req.body;

      const round = await prisma.fundingRound.create({
        data: {
          startupId,
          roundType,
          amountInr: BigInt(amountInr),
          amountUsd: amountUsd ? BigInt(amountUsd) : null,
          announcedAt: new Date(announcedAt),
          leadInvestors: leadInvestors || [],
          allInvestors: allInvestors || [],
          valuation: valuation ? BigInt(valuation) : null,
          sourceUrl,
        },
      });

      // Convert BigInt to string for JSON serialization
      const serializedRound = {
        ...round,
        amountInr: round.amountInr.toString(),
        amountUsd: round.amountUsd?.toString(),
        valuation: round.valuation?.toString(),
      };

      res.status(201).json({ success: true, data: serializedRound });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to create funding round' });
    }
  }
);

// PUT /v1/admin/funding/:id — Update round
router.put('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { startupId, roundType, amountInr, amountUsd, announcedAt, leadInvestors, allInvestors, valuation, sourceUrl } = req.body;

      const round = await prisma.fundingRound.update({
        where: { id },
        data: {
          ...(startupId && { startupId }),
          ...(roundType && { roundType }),
          ...(amountInr && { amountInr: BigInt(amountInr) }),
          ...(amountUsd && { amountUsd: BigInt(amountUsd) }),
          ...(announcedAt && { announcedAt: new Date(announcedAt) }),
          ...(leadInvestors && { leadInvestors }),
          ...(allInvestors && { allInvestors }),
          ...(valuation && { valuation: BigInt(valuation) }),
          ...(sourceUrl && { sourceUrl }),
        },
      });

      const serializedRound = {
        ...round,
        amountInr: round.amountInr.toString(),
        amountUsd: round.amountUsd?.toString(),
        valuation: round.valuation?.toString(),
      };

      res.json({ success: true, data: serializedRound });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to update funding round' });
    }
  }
);

// DELETE /v1/admin/funding/:id
router.delete('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.fundingRound.delete({ where: { id } });
      res.json({ success: true, data: { id, deleted: true } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, data: null, error: 'Failed to delete funding round' });
    }
  }
);

export default router;
