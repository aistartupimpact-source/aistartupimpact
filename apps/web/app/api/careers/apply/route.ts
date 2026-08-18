import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { jobApplicationHtml } from '@aistartupimpact/utils';
import { sendEmailFireAndForget } from '@/lib/email/send';
import { apiRateLimit, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const identifier = getClientIdentifier(req);
    const { success: allowed } = await checkRateLimit(apiRateLimit, identifier);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const { role, fullName, email, resumeLink, consent } = body;

    // Validation
    if (!role || !fullName || !email || !resumeLink) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check for disposable email domains
    const disposableDomains = ['tempmail', 'throwaway', '10minutemail', 'guerrillamail', 'mailinator'];
    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.some(d => domain?.includes(d))) {
      return NextResponse.json({ error: 'Please use a valid working email address' }, { status: 400 });
    }

    // Consent is required
    if (!consent) {
      return NextResponse.json({ error: 'Newsletter consent is required to submit application' }, { status: 400 });
    }

    // Check if user already applied for the same role
    const existingApplication = await sql`
      SELECT id FROM "JobApplication" 
      WHERE email = ${email} AND role = ${role}
      LIMIT 1
    `;

    if (existingApplication.length > 0) {
      return NextResponse.json({ 
        error: 'You have already applied for this role. Please check your email for updates or apply for a different role.' 
      }, { status: 400 });
    }

    // Store job application (mobile field is nullable)
    try {
      await sql`
        INSERT INTO "JobApplication" (
          id, role, "fullName", email, mobile, "resumeLink", status, "createdAt"
        ) VALUES (
          gen_random_uuid(), ${role}, ${fullName}, ${email}, NULL, ${resumeLink}, 'NEW', NOW()
        )
      `;
      sendEmailFireAndForget({
        to: email,
        subject: `Application received — ${role} at AI Startup Impact`,
        html: jobApplicationHtml(fullName, role),
        type: 'job_application',
      });

    } catch (dbError: any) {
      console.error('Database insert error:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      throw dbError; // Re-throw to be caught by outer catch
    }

    // Add to newsletter subscribers with double opt-in (only if not already subscribed)
    try {
      const existing = await sql`
        SELECT id, "isActive", "emailVerified" FROM "NewsletterSubscriber" WHERE email = ${email} LIMIT 1
      `;

      if (existing.length === 0) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aistartupimpact.com';
        const token = crypto.randomUUID();
        await sql`
          INSERT INTO "NewsletterSubscriber" (
            id, email, name, source, "isActive", "emailVerified", "verificationToken", "subscribedAt", tags,
            "consentAt", "consentText", "consentVersion", "consentSource"
          ) VALUES (
            gen_random_uuid(), ${email}, ${fullName}, 'job_application', false, false, ${token}, NOW(), '{job_application}',
            NOW(), 'I agree to receive the AI Startup Impact newsletter with AI startup news, tools, and insights.', 1, 'job_application'
          )
          RETURNING id, email
        `;

        const { newsletterConfirmHtml } = await import('@aistartupimpact/utils');
        const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${token}`;
        sendEmailFireAndForget({
          to: email,
          subject: 'Confirm your newsletter subscription — AI Startup Impact',
          html: newsletterConfirmHtml(confirmUrl),
          type: 'newsletter_confirm',
        });
      }
    } catch (subError: any) {
      console.error('Newsletter subscriber error:', subError);
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Job application error:', e);
    return NextResponse.json({ error: 'Failed to submit application. Please try again.' }, { status: 500 });
  }
}
