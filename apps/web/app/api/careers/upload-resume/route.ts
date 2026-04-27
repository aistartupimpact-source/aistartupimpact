import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Validate file size (300KB)
    const maxSize = 300 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size must be less than 300KB (current: ${Math.round(file.size / 1024)}KB)` 
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'temp-resumes');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    const filepath = path.join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Schedule deletion after 3 minutes (180000 ms)
    setTimeout(async () => {
      try {
        const { unlink } = await import('fs/promises');
        await unlink(filepath);
        console.log(`Deleted temporary resume: ${filename}`);
      } catch (err) {
        console.error(`Failed to delete temporary resume: ${filename}`, err);
      }
    }, 180000);

    // Return the public URL
    const fileUrl = `/temp-resumes/${filename}`;
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      filename: file.name 
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload resume. Please try again.' 
    }, { status: 500 });
  }
}
