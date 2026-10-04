import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { apiRateLimit, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_SIZE = 500 * 1024; // 500KB strict limit

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const identifier = getClientIdentifier(req);
    const { success: allowed } = await checkRateLimit(apiRateLimit, identifier);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({
        error: `File size must be less than 500KB (current: ${Math.round(file.size / 1024)}KB). Please compress your resume.`,
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueId = crypto.randomUUID();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `resumes/${uniqueId}-${cleanName}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: 'application/pdf',
        Body: buffer,
      })
    );

    const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
    const url = `${publicUrl}/${key}`;

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      sizeBytes: file.size,
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({
      error: 'Failed to upload resume. Please try again.',
    }, { status: 500 });
  }
}
