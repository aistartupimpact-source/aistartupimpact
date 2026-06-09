import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/roles';
import { s3Client } from '../../lib/s3';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const router = Router();
router.use(authenticateToken as any);

const prisma = new PrismaClient();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

// Helper to generate SHA-256 hash of a file buffer
const getFileHash = (buffer: Buffer): string => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

// POST /v1/admin/media/upload
router.post('/upload',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  upload.single('file') as any,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, data: null, error: 'No file uploaded' });
      }

      // Check for duplicates before uploading
      const fileHash = getFileHash(req.file.buffer);

      const existingAsset = await prisma.mediaAsset.findUnique({
        where: { fileHash },
      });

      if (existingAsset) {
        // Return existing asset immediately to block duplications
        return res.json({
          success: true,
          data: {
            url: existingAsset.url,
            id: existingAsset.id,
            fileName: existingAsset.fileName,
            isDuplicate: true
          }
        });
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

      // Upload to cloud storage
      await s3Client.send(command);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const url = `${apiUrl}/v1/media/${fileKey}`;

      // Save to Database
      const newAsset = await prisma.mediaAsset.create({
        data: {
          id: crypto.randomUUID(),
          url,
          fileHash,
          fileName: cleanFilename,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          uploadedBy: req.user?.id ?? null,
          updatedAt: new Date(),
        }
      });

      res.json({
        success: true,
        data: {
          url: newAsset.url,
          id: newAsset.id,
          fileName: newAsset.fileName,
          isDuplicate: false
        }
      });
    } catch (error) {
      console.error('Upload to Media Library failed:', error);
      res.status(500).json({ success: false, data: null, error: 'Upload failed' });
    }
  }
);

// GET /v1/admin/media — Media library listing using Prisma
router.get('/',
  requireRole(['SUPER_ADMIN', 'EDITOR_IN_CHIEF', 'SENIOR_WRITER', 'WRITER']) as any,
  async (req: AuthRequest, res: Response) => {
    try {
      // Direct DB query removes the slow external S3 API call
      const assets = await prisma.mediaAsset.findMany({
        orderBy: { createdAt: 'desc' },
      });

      // Map to keep frontend compatibility
      const files = assets.map(asset => ({
        id: asset.id,
        name: asset.fileName,
        size: `${Math.round(asset.sizeBytes / 1024)} KB`,
        type: asset.mimeType,
        uploadedAt: asset.createdAt.toISOString(),
        dimensions: asset.width && asset.height ? `${asset.width}x${asset.height}` : 'Unknown',
        url: asset.url,
      }));

      res.json({ success: true, data: files, meta: { page: 1, limit: files.length, total: files.length, pages: 1, hasNext: false } });
    } catch (error) {
      console.error('List media error:', error);
      res.status(500).json({ success: false, data: null, error: 'Failed to fetch media from database' });
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

      const assetId = req.params.id;

      // 1. Find asset in DB
      const asset = await prisma.mediaAsset.findUnique({
        where: { id: assetId }
      });

      if (!asset) {
        return res.status(404).json({ success: false, data: null, error: 'Asset not found' });
      }

      // Extract original fileKey from URL (assuming url is `${apiUrl}/v1/media/${fileKey}`)
      const fileKeyMatch = asset.url.split('/v1/media/')[1];
      if (fileKeyMatch) {
        const command = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: fileKeyMatch,
        });
        await s3Client.send(command).catch(err => console.error("S3 Deletion failed", err));
      }

      // 2. Delete from DB
      await prisma.mediaAsset.delete({
        where: { id: assetId }
      });

      res.json({ success: true, data: { deleted: true } });
    } catch (error) {
      console.error('Delete media error:', error);
      res.status(500).json({ success: false, data: null, error: 'Delete failed' });
    }
  }
);

export default router;
