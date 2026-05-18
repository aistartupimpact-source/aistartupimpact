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
    console.log('[Upload] Starting upload process...');
    console.log('[Upload] R2 Configuration check:', {
      hasAccountId: !!process.env.R2_ACCOUNT_ID,
      hasAccessKeyId: !!process.env.R2_ACCESS_KEY_ID,
      hasSecretAccessKey: !!process.env.R2_SECRET_ACCESS_KEY,
      hasBucketName: !!process.env.R2_BUCKET_NAME,
      hasPublicUrl: !!process.env.R2_PUBLIC_URL,
      isR2Configured: isR2Configured(),
    });

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('[Upload] No file provided in form data');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('[Upload] File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

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
      console.log('[Upload] R2 is configured, attempting R2 upload...');
      try {
        const s3Client = getS3Client();
        if (s3Client) {
          console.log('[Upload] S3 client created, uploading to R2...');
          const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
          });

          await s3Client.send(command);
          console.log('[Upload] R2 upload successful!');

          // Return public URL
          const publicUrl = `${process.env.R2_PUBLIC_URL}/${filename}`;
          console.log('[Upload] Returning public URL:', publicUrl);
          return NextResponse.json({ url: publicUrl, success: true });
        }
      } catch (r2Error: any) {
        console.error('[Upload] R2 upload failed:', {
          message: r2Error.message,
          code: r2Error.code,
          name: r2Error.name,
          stack: r2Error.stack,
        });
        // Fall through to local filesystem fallback
      }
    } else {
      console.log('[Upload] R2 not configured, will use local filesystem fallback');
    }

    // Fallback to local filesystem (development only)
    // Note: This won't work in Vercel production, but R2 should be configured there
    console.log('[Upload] Using local filesystem fallback...');
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
    console.log('[Upload] Local filesystem upload successful!');

    // Return the public URL
    const url = `/uploads/${localFilename}`;
    console.log('[Upload] Returning local URL:', url);
    return NextResponse.json({ url, success: true });

  } catch (error: any) {
    console.error('[Upload] Upload error:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
}
