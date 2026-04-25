import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_SOURCES = ['footer', 'sidebar', 'newsletter', 'website'];

export async function POST(req: NextRequest) {
  try {
    const { email, source = 'website' } = await req.json();

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ success: false, error: 'Valid email required' }, { status: 400 });
    }

    const safeSource = ALLOWED_SOURCES.includes(source) ? source : 'website';
    const emailLower = email.toLowerCase();

    // Check if email already exists and is active
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id, "isActive" FROM "NewsletterSubscriber"
      WHERE email = ${emailLower}
      LIMIT 1
    `;

    if (existing.length > 0 && existing[0].isActive) {
      return NextResponse.json({ 
        success: false, 
        error: 'You are already subscribed to our newsletter!' 
      }, { status: 400 });
    }

    // If previously unsubscribed, reactivate
    if (existing.length > 0 && !existing[0].isActive) {
      await prisma.$executeRaw`
        UPDATE "NewsletterSubscriber"
        SET "isActive" = true, source = ${safeSource}, "subscribedAt" = NOW(), "unsubscribedAt" = NULL
        WHERE email = ${emailLower}
      `;
      return NextResponse.json({ success: true, data: { message: 'Welcome back! Successfully resubscribed!' } });
    }

    // New subscriber
    await prisma.$executeRaw`
      INSERT INTO "NewsletterSubscriber" (id, email, "subscribedAt", source, "isActive")
      VALUES (gen_random_uuid(), ${emailLower}, NOW(), ${safeSource}, true)
    `;

    return NextResponse.json({ success: true, data: { message: 'Successfully subscribed!' } });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return NextResponse.json({ success: false, error: 'Subscription failed' }, { status: 500 });
  }
}
