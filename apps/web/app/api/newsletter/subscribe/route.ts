import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { apiRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { newsletterSchema, validateInput } from '@/lib/validation';
import { newsletterConfirmHtml, newsletterWelcomeHtml } from '@aistartupimpact/utils/src/email-templates';

export const runtime = 'edge';

function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

async function sendEmailEdge(to: string, subject: string, html: string, headers?: Record<string, string>) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  const { Resend } = await import('resend');
  const resend = new Resend(resendKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
  const fromName = process.env.RESEND_FROM_NAME || 'AI Startup Impact';

  await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
    ...(headers && { headers }),
  });
}

export async function POST(request: Request) {
  try {
    const identifier = getClientIdentifier(request);

    if (apiRateLimit) {
      try {
        const { success: rateLimitSuccess } = await apiRateLimit.limit(identifier);
        if (!rateLimitSuccess) {
          return NextResponse.json(
            { success: false, error: 'Too many requests. Please try again later.' },
            { status: 429 }
          );
        }
      } catch (rateLimitError) {
        console.error('Rate limit check failed:', rateLimitError);
      }
    }

    const body = await request.json();
    const validation = validateInput(newsletterSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email, source, name } = validation.data;
    const tags = body.tags;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistartupimpact.com';

    const existing = await sql`
      SELECT id, "isActive", "emailVerified" FROM "NewsletterSubscriber"
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (existing.length > 0) {
      const sub = existing[0];

      if (sub.isActive && sub.emailVerified) {
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed' },
          { status: 400 }
        );
      }

      if (sub.isActive && !sub.emailVerified) {
        // Pending confirmation — resend the confirmation email
        const token = generateToken();
        await sql`
          UPDATE "NewsletterSubscriber"
          SET "verificationToken" = ${token}
          WHERE email = ${email.toLowerCase()}
        `;

        const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`;
        try {
          await sendEmailEdge(
            email.toLowerCase(),
            'Confirm your newsletter subscription — AI Startup Impact',
            newsletterConfirmHtml(confirmUrl),
          );
        } catch (emailError) {
          console.error('Confirmation resend error:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'We sent another confirmation email. Please check your inbox.',
          pendingConfirmation: true,
        });
      }

      // Inactive (previously unsubscribed) — resubscribe with verification
      // Previously verified subscribers skip double opt-in
      if (sub.emailVerified) {
        await sql`
          UPDATE "NewsletterSubscriber"
          SET "isActive" = true,
              "subscribedAt" = NOW(),
              "unsubscribedAt" = NULL,
              source = ${source || 'india-ai'},
              tags = ${tags || ['india-ai']}
          WHERE email = ${email.toLowerCase()}
        `;

        try {
          await sendEmailEdge(
            email.toLowerCase(),
            'Welcome back to AI Startup Impact Newsletter!',
            newsletterWelcomeHtml(true),
            {
              'List-Unsubscribe': `<${siteUrl}/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          );
        } catch (emailError) {
          console.error('Welcome-back email error:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed!',
        });
      }

      // Inactive and never verified — treat like new subscriber, send confirmation
      const token = generateToken();
      await sql`
        UPDATE "NewsletterSubscriber"
        SET "isActive" = false,
            "subscribedAt" = NOW(),
            "unsubscribedAt" = NULL,
            "verificationToken" = ${token},
            "emailVerified" = false,
            source = ${source || 'india-ai'},
            tags = ${tags || ['india-ai']}
        WHERE email = ${email.toLowerCase()}
      `;

      const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`;
      try {
        await sendEmailEdge(
          email.toLowerCase(),
          'Confirm your newsletter subscription — AI Startup Impact',
          newsletterConfirmHtml(confirmUrl),
        );
      } catch (emailError) {
        console.error('Confirmation email error:', emailError);
      }

      return NextResponse.json({
        success: true,
        message: 'Please check your email to confirm your subscription.',
        pendingConfirmation: true,
      });
    }

    // New subscriber — insert as inactive, send confirmation email
    const subscriberId = generateId();
    const token = generateToken();

    await sql`
      INSERT INTO "NewsletterSubscriber" (
        id, email, name, source, tags, "isActive", "emailVerified", "verificationToken", "subscribedAt"
      ) VALUES (
        ${subscriberId},
        ${email.toLowerCase()},
        ${name || null},
        ${source || 'india-ai'},
        ${tags || ['india-ai']},
        false,
        false,
        ${token},
        NOW()
      )
    `;

    const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`;
    try {
      await sendEmailEdge(
        email.toLowerCase(),
        'Confirm your newsletter subscription — AI Startup Impact',
        newsletterConfirmHtml(confirmUrl),
      );
    } catch (emailError) {
      console.error('Confirmation email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Please check your email to confirm your subscription.',
      pendingConfirmation: true,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
