import { Router, Request, Response } from 'express';
import { prisma } from '@aistartupimpact/database';

const router = Router();

// GET /v1/funding — List funding rounds
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '12' } = req.query;
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

    const serializedRounds = rounds.map((r: any) => ({
      ...r,
      amountInr: r.amountInr.toString(),
      amountUsd: r.amountUsd?.toString(),
      valuation: r.valuation?.toString(),
    }));

    res.json({
      success: true,
      data: serializedRounds,
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
});

// GET /v1/funding/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const round = await prisma.fundingRound.findUnique({
      where: { id },
      include: { startup: { select: { name: true, slug: true, logoUrl: true, description: true } } },
    });

    if (!round) {
      return res.status(404).json({ success: false, data: null, error: 'Funding round not found' });
    }

    const serializedRound = {
      ...round,
      amountInr: round.amountInr.toString(),
      amountUsd: round.amountUsd?.toString(),
      valuation: round.valuation?.toString(),
    };

    res.json({ success: true, data: serializedRound });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch funding round' });
  }
});

export default router;
