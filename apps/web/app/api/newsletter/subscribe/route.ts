import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { apiRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { newsletterSchema, validateInput } from '@/lib/validation';

export const runtime = 'edge';

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

    const sql = neon(process.env.DATABASE_URL!);

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

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed!',
        });
      }
    }

    // Insert new subscriber
    await sql`
      INSERT INTO "NewsletterSubscriber" (
        email,
        name,
        source,
        tags,
        "isActive",
        "subscribedAt"
      ) VALUES (
        ${email.toLowerCase()},
        ${name || null},
        ${source || 'india-ai'},
        ${tags || ['india-ai']},
        true,
        NOW()
      )
    `;

    // TODO: Send welcome email via Resend
    // TODO: Add to Mailchimp/Beehiiv if integrated

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
