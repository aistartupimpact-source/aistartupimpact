import { Router, Request, Response } from 'express';
import { prisma } from '@aistartupimpact/database';

const router = Router();

// GET /v1/startups
router.get('/', async (req: Request, res: Response) => {
  try {
    const { stage, isIndian, isFeatured, minImpactScore, page = '1', limit = '12' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (stage) where.stage = stage;
    if (isIndian !== undefined) where.isIndian = isIndian === 'true';
    if (isFeatured !== undefined) where.isFeatured = isFeatured === 'true';
    if (minImpactScore) where.impactScore = { gte: parseInt(minImpactScore as string) };

    const [startups, total] = await Promise.all([
      prisma.startup.findMany({
        where,
        orderBy: { impactScore: 'desc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.startup.count({ where }),
    ]);

    // Serialize BigInt if applicable (though Prisma handles numbers or strings best in JSON)
    const serializedStartups = startups.map((s: any) => ({
      ...s,
      totalFundingInr: s.totalFundingInr.toString(),
    }));

    res.json({
      success: true,
      data: serializedStartups,
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
});

// GET /v1/startups/:slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const startup = await prisma.startup.findUnique({
      where: { slug },
      include: {
        fundingRounds: { orderBy: { announcedAt: 'desc' } },
        jobs: { where: { isActive: true }, orderBy: { createdAt: 'desc' } }
      }
    });

    if (!startup) {
      return res.status(404).json({ success: false, data: null, error: 'Startup not found' });
    }

    const serializedStartup = {
      ...startup,
      totalFundingInr: startup.totalFundingInr.toString(),
      fundingRounds: startup.fundingRounds.map((r: any) => ({
        ...r,
        amountInr: r.amountInr.toString(),
        amountUsd: r.amountUsd?.toString(),
        valuation: r.valuation?.toString(),
      }))
    };

    res.json({ success: true, data: serializedStartup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch startup' });
  }
});

// GET /v1/startups/:slug/funding — Funding history
router.get('/:slug/funding', async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const startup = await prisma.startup.findUnique({ where: { slug }, select: { id: true } });
    if (!startup) return res.status(404).json({ success: false, data: null, error: 'Startup not found' });

    const funding = await prisma.fundingRound.findMany({
      where: { startupId: startup.id },
      orderBy: { announcedAt: 'desc' }
    });

    const serializedFunding = funding.map((r: any) => ({
      ...r,
      amountInr: r.amountInr.toString(),
      amountUsd: r.amountUsd?.toString(),
      valuation: r.valuation?.toString(),
    }));

    res.json({ success: true, data: serializedFunding });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch funding rounds' });
  }
});

export default router;
