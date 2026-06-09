import express, { Request, Response } from 'express';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../lib/s3';

const router = express.Router();

router.post('/presign', async (req: Request, res: Response) => {
  try {
    const { filename, contentType } = req.body;

    if (!filename || !contentType) {
      return res.status(400).json({ error: 'Filename and contentType are required' });
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      throw new Error('R2_BUCKET_NAME is not configured');
    }

    // Generate a unique file key to prevent overwrites
    const uniqueId = crypto.randomUUID();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `uploads/${uniqueId}-${cleanFilename}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    // The URL expires in 5 minutes
    const presignedUrl = await getSignedUrl(s3Client as any, command, { expiresIn: 300 });

    const accountId = process.env.R2_ACCOUNT_ID;
    const publicUrlBase = process.env.R2_PUBLIC_URL || `https://pub-${accountId}.r2.dev`;
    const finalUrl = `${publicUrlBase.replace(/\/$/, '')}/${fileKey}`;

    return res.json({
      presignedUrl,
      finalUrl,
      fileKey,
    });
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
  }
});

export default router;
