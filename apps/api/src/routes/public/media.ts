import { Router, Request, Response } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../../lib/s3';
import { Readable } from 'stream';

const router = Router();

// GET /v1/media/*
// Acts as a public proxy for the private R2 bucket
router.get('/*', async (req: Request, res: Response) => {
  try {
    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) throw new Error('R2_BUCKET_NAME missing');

    const fileKey = req.params[0]; // Gets the wildcard path
    if (!fileKey) {
      return res.status(400).send('No file specified');
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
    });

    const s3Item = await s3Client.send(command);

    if (!s3Item.Body) {
      return res.status(404).send('Not found');
    }

    if (s3Item.ContentType) {
      res.set('Content-Type', s3Item.ContentType);
    }
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.set('Cross-Origin-Resource-Policy', 'cross-origin'); // Override Helmet to allow images
    res.set('Access-Control-Allow-Origin', '*'); // Ensure CORS doesn't block

    // Type casting to Readable to satisfy TypeScript
    const bodyStream = s3Item.Body as Readable;
    bodyStream.pipe(res);

  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return res.status(404).send('Image not found');
    }
    console.error('Image Proxy Error:', error);
    res.status(500).send('Failed to retrieve image');
  }
});

export default router;
