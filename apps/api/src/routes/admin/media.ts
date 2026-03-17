import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { s3Client } from '../../lib/s3';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

const router = Router();
router.use(authenticateToken as any);

import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// POST /v1/admin/media/upload
router.post('/upload',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  upload.single('file') as any,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, data: null, error: 'No file uploaded' });
      }

      const bucketName = process.env.R2_BUCKET_NAME;
      if (!bucketName) throw new Error('R2_BUCKET_NAME missing');

      const uniqueId = crypto.randomUUID();
      const cleanFilename = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileKey = `uploads/${uniqueId}-${cleanFilename}`;

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
        ContentType: req.file.mimetype,
        Body: req.file.buffer,
      });

      await s3Client.send(command);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = `${apiUrl}/v1/media/${fileKey}`;

      res.json({
        success: true,
        data: {
          url,
          id: fileKey,
          fileName: cleanFilename
        }
      });
    } catch (error) {
      console.error('Upload to R2 failed:', error);
      res.status(500).json({ success: false, data: null, error: 'Upload failed' });
    }
  }
);

// GET /v1/admin/media — Media library listing
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const bucketName = process.env.R2_BUCKET_NAME;
      if (!bucketName) throw new Error('R2_BUCKET_NAME missing');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const command = new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'uploads/',
      });

      const response = await s3Client.send(command);

      const files = (response.Contents || []).map(item => ({
        id: item.Key,
        name: item.Key?.replace('uploads/', ''),
        size: `${Math.round((item.Size || 0) / 1024)} KB`,
        type: 'image/unknown',
        uploadedAt: item.LastModified ? item.LastModified.toISOString() : '',
        dimensions: 'Unknown',
        url: `${apiUrl}/v1/media/${item.Key}`,
      })).sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

      res.json({ success: true, data: files, meta: { page: 1, limit: files.length, total: files.length, pages: 1, hasNext: false } });
    } catch (error) {
      console.error('List media error:', error);
      res.status(500).json({ success: false, data: null, error: 'Failed to fetch media' });
    }
  }
);

// DELETE /v1/admin/media/:id
router.delete('/:id(*)',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const bucketName = process.env.R2_BUCKET_NAME;
      if (!bucketName) throw new Error('R2_BUCKET_NAME missing');

      const fileKey = req.params.id; // Express handles id(*) to match slashes too

      const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileKey,
      });

      await s3Client.send(command);

      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      console.error('Delete media error:', error);
      res.status(500).json({ success: false, data: null, error: 'Delete failed' });
    }
  }
);

export default router;
