import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import crypto from 'crypto';
import { prisma } from '@aistartupimpact/database';

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

    // Generate file hash to prevent duplicates
    const buffer = await file.arrayBuffer();
    const fileHash = crypto
      .createHash('sha256')
      .update(Buffer.from(buffer))
      .digest('hex');

    // Check if file already exists
    const existing = await prisma.mediaAsset.findUnique({
      where: { fileHash },
    });

    if (existing) {
      return NextResponse.json({
        url: existing.url,
        id: existing.id,
      });
    }

    // Upload to Cloudflare R2 via Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // Save to database
    const mediaAsset = await prisma.mediaAsset.create({
      data: {
        url: blob.url,
        fileHash,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });

    return NextResponse.json({
      url: mediaAsset.url,
      id: mediaAsset.id,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
}
