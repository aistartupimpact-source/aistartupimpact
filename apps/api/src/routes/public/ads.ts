import { Router, Request, Response } from 'express';

const router = Router();

// GET /v1/ads/:zone — Fetch active creative for zone
router.get('/:zone', async (req: Request, res: Response) => {
  try {
    const { zone } = req.params;
    // TODO: Redis-cached lookup, 60s TTL
    res.json({ success: true, data: null }); // null = no active ad for zone
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Failed to fetch ad' });
  }
});

// POST /v1/ads/impression — Record impression
router.post('/impression', async (req: Request, res: Response) => {
  try {
    const { creativeId, articleId, sessionHash } = req.body;
    // TODO: Write to AdImpression table + increment denormalized counter
    res.json({ success: true, data: { recorded: true } });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Failed to record impression' });
  }
});

// POST /v1/ads/click — Record click
router.post('/click', async (req: Request, res: Response) => {
  try {
    const { creativeId, articleId, sessionHash } = req.body;
    // TODO: Write to AdClick table + increment denormalized counter
    res.json({ success: true, data: { recorded: true } });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Failed to record click' });
  }
});

export default router;
