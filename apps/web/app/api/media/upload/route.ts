import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Check if R2 is configured
const isR2Configured = () => {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_PUBLIC_URL
  );
};

// Initialize R2 client only if configured
const getS3Client = () => {
  if (!isR2Configured()) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const extension = originalName.split('.').pop();
    const filename = `logos/${timestamp}-${randomString}.${extension}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try R2 upload if configured (production)
    if (isR2Configured()) {
      try {
        const s3Client = getS3Client();
        if (s3Client) {
          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
          });

          await s3Client.send(command);

          // Return public URL
          const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
          return NextResponse.json({ url: publicUrl, success: true });
        }
      } catch (r2Error: any) {
        console.error('R2 upload failed:', r2Error);
        // Fall through to local filesystem fallback
      }
    }

    // Fallback to local filesystem (development only)
    // Note: This won't work in Vercel production, but R2 should be configured there
    const { writeFile, mkdir } = await import('fs/promises');
    const { join } = await import('path');
    const { existsSync } = await import('fs');

    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const localFilename = `${timestamp}-${originalName}`;
    const filepath = join(uploadsDir, localFilename);
    await writeFile(filepath, buffer);

    // Return the public URL
    const url = `/uploads/${localFilename}`;
    return NextResponse.json({ url, success: true });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
