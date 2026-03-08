import { Router, Request, Response } from 'express';

const router = Router();

// GET /v1/search?q=
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, type, page = '1', limit = '20' } = req.query;

    if (!q) {
      return res.status(400).json({ success: false, data: null, error: 'Query parameter "q" is required' });
    }

    // TODO: Replace with Meilisearch cross-entity search
    const results = {
      articles: [],
      tools: [],
      startups: [],
    };

    res.json({
      success: true,
      data: results,
      meta: { query: q, page: parseInt(page as string), limit: parseInt(limit as string), total: 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Search failed' });
  }
});

export default router;
