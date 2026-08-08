import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { apiRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { newsletterSchema, validateInput } from '@/lib/validation';

export const runtime = 'edge';

function generateId(): string {
  // Use Web Crypto API for edge runtime
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    // Rate limiting (with fallback if Redis is unavailable)
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
        // Continue without rate limiting if it fails
      }
    }

    // Input validation
    const body = await request.json();
    const validation = validateInput(newsletterSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { email, source, name } = validation.data;
    const tags = body.tags; // Optional field
    // Check if email already exists
    const existing = await sql`
      SELECT id, "isActive" FROM "NewsletterSubscriber"
      WHERE email = ${email.toLowerCase()}
      LIMIT 1
    `;

    if (existing.length > 0) {
      if (existing[0].isActive) {
        return NextResponse.json(
          { success: false, error: 'This email is already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        await sql`
          UPDATE "NewsletterSubscriber"
          SET "isActive" = true,
              "subscribedAt" = NOW(),
              "unsubscribedAt" = NULL,
              source = ${source || 'india-ai'},
              tags = ${tags || ['india-ai']}
          WHERE email = ${email.toLowerCase()}
        `;

        // Send welcome-back email (fire-and-forget)
        try {
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            const { Resend } = await import('resend');
            const resend = new Resend(resendKey);
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
            const fromName = process.env.RESEND_FROM_NAME || 'AI Startup Impact';
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistartupimpact.com';

            await resend.emails.send({
              from: `${fromName} <${fromEmail}>`,
              to: email.toLowerCase(),
              subject: 'Welcome back to AI Startup Impact Newsletter!',
              headers: {
                'List-Unsubscribe': `<${siteUrl}/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                  <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
                    <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
                  </div>

                  <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi${name ? ` ${name}` : ''},</p>

                  <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                    Great to have you back! You've been resubscribed to the AI Startup Impact newsletter. Here's what you'll get:
                  </p>

                  <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 20px; margin: 24px 0;">
                    <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                      <li>Weekly roundup of India's AI startup ecosystem</li>
                      <li>Funding news and startup launches</li>
                      <li>AI tool discoveries and reviews</li>
                      <li>Founder stories and insights</li>
                    </ul>
                  </div>

                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${siteUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px; font-weight: 600;">Explore AI Startup Impact</a>
                  </div>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                  <p style="color: #9ca3af; font-size: 11px;">
                    <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> if you no longer want these updates.
                  </p>
                </div>
              `,
            });
          }
        } catch (emailError) {
          console.error('Welcome-back email error:', emailError);
        }

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed!',
        });
      }
    }

    // Insert new subscriber
    const subscriberId = generateId();
    
    await sql`
      INSERT INTO "NewsletterSubscriber" (
        id,
        email,
        name,
        source,
        tags,
        "isActive",
        "subscribedAt"
      ) VALUES (
        ${subscriberId},
        ${email.toLowerCase()},
        ${name || null},
        ${source || 'india-ai'},
        ${tags || ['india-ai']},
        true,
        NOW()
      )
    `;

    // Send welcome email (fire-and-forget)
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const { Resend } = await import('resend');
        const resend = new Resend(resendKey);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
        const fromName = process.env.RESEND_FROM_NAME || 'AI Startup Impact';
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistartupimpact.com';

        await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: email.toLowerCase(),
          subject: 'Welcome to AI Startup Impact Newsletter!',
          headers: {
            'List-Unsubscribe': `<${siteUrl}/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
              </div>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi${name ? ` ${name}` : ''},</p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Welcome aboard! You're now subscribed to the AI Startup Impact newsletter. Here's what you'll get:
              </p>

              <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Weekly roundup of India's AI startup ecosystem</li>
                  <li>Funding news and startup launches</li>
                  <li>AI tool discoveries and reviews</li>
                  <li>Founder stories and insights</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${siteUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px; font-weight: 600;">Explore AI Startup Impact</a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

              <p style="color: #9ca3af; font-size: 11px;">
                <a href="${siteUrl}/unsubscribe?email=${encodeURIComponent(email.toLowerCase())}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> if you no longer want these updates.
              </p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed! Check your email for confirmation.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
