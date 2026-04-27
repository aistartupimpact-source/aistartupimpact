import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

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
