import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
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

    // Log resume link size for debugging
    console.log('Resume link size:', resumeLink.length, 'characters');

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
      console.log('Job application saved successfully for:', email);

      // Send application confirmation email (fire-and-forget)
      try {
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const { Resend } = await import('resend');
          const resend = new Resend(resendKey);
          const fromEmail = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
          const fromName = process.env.RESEND_FROM_NAME || 'AI Startup Impact';

          await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: email,
            subject: `Application received — ${role} at AI Startup Impact`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
                  <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
                </div>

                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${fullName},</p>

                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Thank you for applying for the <strong>${role}</strong> position at AI Startup Impact. We've received your application and our team will review it shortly.
                </p>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Application Details</p>
                  <p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Role:</strong> ${role}</p>
                  <p style="color: #374151; font-size: 14px; margin: 4px 0;"><strong>Name:</strong> ${fullName}</p>
                </div>

                <p style="color: #374151; font-size: 14px; line-height: 1.6;">
                  We typically respond within 5-7 business days. If your profile matches our requirements, we'll reach out to schedule next steps.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />

                <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
                  Best regards,<br/>
                  AI Startup Impact Team
                </p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error('Application confirmation email error:', emailError);
      }

    } catch (dbError: any) {
      console.error('Database insert error:', dbError);
      console.error('Error code:', dbError.code);
      console.error('Error message:', dbError.message);
      throw dbError; // Re-throw to be caught by outer catch
    }

    // Add to newsletter subscribers with job_application label (only if not already subscribed)
    try {
      const existing = await sql`
        SELECT id FROM "NewsletterSubscriber" WHERE email = ${email} LIMIT 1
      `;

      if (existing.length === 0) {
        // Add as new subscriber with job application label
        // Using string literal for array to avoid type casting issues
        const insertResult = await sql`
          INSERT INTO "NewsletterSubscriber" (
            id, email, name, source, "isActive", "subscribedAt", tags
          ) VALUES (
            gen_random_uuid(), ${email}, ${fullName}, 'job_application', true, NOW(), '{job_application}'
          )
          RETURNING id, email
        `;
        console.log('Newsletter subscriber added:', insertResult);
      } else {
        console.log('Newsletter subscriber already exists:', email);
      }
      // If already exists, don't update - they're already a subscriber
    } catch (subError: any) {
      console.error('Newsletter subscriber update error:', subError);
      console.error('Error details:', subError.message, subError.code);
      // Don't fail the application if subscriber update fails
      // The job application was still saved successfully
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('Job application error:', e);
    return NextResponse.json({ error: 'Failed to submit application. Please try again.' }, { status: 500 });
  }
}
