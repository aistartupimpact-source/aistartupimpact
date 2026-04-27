import { NextRequest, NextResponse } from 'next/server';

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

    // Convert file to base64 data URL (works in serverless environments)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:application/pdf;base64,${base64}`;
    
    return NextResponse.json({ 
      success: true, 
      url: dataUrl,
      filename: file.name 
    });
  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload resume. Please try again.' 
    }, { status: 500 });
  }
}
