import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Generate 6-digit OTP
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this email
    await sql`DELETE FROM "EmailOtp" WHERE email = ${email.toLowerCase().trim()} AND purpose = 'employer_signup'`;

    // Store OTP (hashed)
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    await sql`
      INSERT INTO "EmailOtp" (id, email, code, purpose, "expiresAt", "createdAt")
      VALUES (gen_random_uuid()::text, ${email.toLowerCase().trim()}, ${hashedCode}, 'employer_signup', ${expiresAt.toISOString()}::timestamp, NOW())
    `;

    // Send email via Resend
    try {
      const { Resend } = await import('resend');
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
          to: email.toLowerCase().trim(),
          subject: 'Your Verification Code — AI Startup Impact Employer Portal',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
              <h2 style="color: #1a1a2e; margin-bottom: 8px;">Verify your email</h2>
              <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Enter this code to complete your Employer Portal signup:</p>
              <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1a1a2e;">${code}</span>
              </div>
              <p style="color: #999; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #999; font-size: 11px;">AI Startup Impact — Employer Portal</p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('[OTP Email Error]', emailErr);
      // Don't fail the request — OTP is stored, user can retry
    }

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error: any) {
    console.error('[POST /api/employer/auth/send-otp]', error);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}
