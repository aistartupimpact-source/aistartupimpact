import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';

const router = Router();
router.use(authenticateToken as any);

// POST /v1/admin/media/upload
router.post('/upload',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      // TODO: multer upload → R2 → WebP conversion queue → return CDN URL
      res.json({ success: true, data: { url: '', id: '', fileName: '' } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Upload failed' });
    }
  }
);

// GET /v1/admin/media — Media library listing
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      res.json({ success: true, data: [], meta: { page: 1, limit: 40, total: 0, pages: 0, hasNext: false } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Failed to fetch media' });
    }
  }
);

// DELETE /v1/admin/media/:id
router.delete('/:id',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      // TODO: Check usage before allowing deletion
      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      res.status(500).json({ success: false, data: null, error: 'Delete failed' });
    }
  }
);

export default router;
