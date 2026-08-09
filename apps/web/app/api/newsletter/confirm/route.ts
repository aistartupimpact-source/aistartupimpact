import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { newsletterWelcomeHtml } from '@aistartupimpact/utils/src/email-templates';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return redirectWithStatus(request, 'invalid');
  }

  try {
    const subscribers = await prisma.$queryRaw<any[]>`
      SELECT id, email, "isActive", "emailVerified"
      FROM "NewsletterSubscriber"
      WHERE "verificationToken" = ${token}
      LIMIT 1
    `;

    if (subscribers.length === 0) {
      return redirectWithStatus(request, 'invalid');
    }

    const subscriber = subscribers[0];

    if (subscriber.emailVerified && subscriber.isActive) {
      return redirectWithStatus(request, 'already');
    }

    await prisma.$executeRaw`
      UPDATE "NewsletterSubscriber"
      SET "isActive" = true,
          "emailVerified" = true,
          "verificationToken" = NULL,
          "subscribedAt" = NOW()
      WHERE id = ${subscriber.id}
    `;

    // Send welcome email now that they're confirmed
    try {
      const { Resend } = await import('resend');
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
        const fromName = process.env.RESEND_FROM_NAME || 'AI Startup Impact';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistartupimpact.com';

        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: subscriber.email,
          subject: 'Welcome to AI Startup Impact Newsletter!',
          headers: {
            'List-Unsubscribe': `<${siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          html: newsletterWelcomeHtml(false),
        });
      }
    } catch (emailError) {
      console.error('Welcome email error after confirmation:', emailError);
    }

    return redirectWithStatus(request, 'confirmed');
  } catch (error) {
    console.error('Newsletter confirm error:', error);
    return redirectWithStatus(request, 'error');
  }
}

function redirectWithStatus(request: NextRequest, status: string): NextResponse {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistartupimpact.com';
  const url = new URL(siteUrl);
  url.searchParams.set('newsletter', status);
  return NextResponse.redirect(url.toString());
}
