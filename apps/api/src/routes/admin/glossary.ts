import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';

const router = Router();
router.use(authenticateToken as any);

// GET /v1/admin/glossary — List all terms
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (_req: AuthRequest, res: Response) => {
    try {
      const mockTerms = [
        { id: '1', term: 'Large Language Model (LLM)', definition: 'A type of AI model trained on vast amounts of text data...', status: 'PUBLISHED' },
        { id: '2', term: 'Retrieval-Augmented Generation (RAG)', definition: 'A technique that combines retrieval of relevant documents...', status: 'PUBLISHED' },
        { id: '3', term: 'Fine-tuning', definition: 'The process of further training a pre-trained model...', status: 'DRAFT' },
      ];
      res.json({ success: true, data: mockTerms });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to fetch glossary' });
    }
  }
);

// POST /v1/admin/glossary — Add term
router.post('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { term, definition } = req.body;
      res.status(201).json({ success: true, data: { id: 'new-term', term } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to add term' });
    }
  }
);

// PUT /v1/admin/glossary/:id — Update term
router.put('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      res.json({ success: true, data: { id: req.params.id, updated: true } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to update term' });
    }
  }
);

// DELETE /v1/admin/glossary/:id
router.delete('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      res.json({ success: true, data: { id: req.params.id, deleted: true } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to delete term' });
    }
  }
);

export default router;
