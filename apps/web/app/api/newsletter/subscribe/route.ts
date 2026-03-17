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

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      update: { isActive: true, source: safeSource },
      create: { email: email.toLowerCase(), source: safeSource },
    });

    return NextResponse.json({ success: true, data: { message: 'Successfully subscribed!' } });
  } catch {
    return NextResponse.json({ success: false, error: 'Subscription failed' }, { status: 500 });
  }
}
