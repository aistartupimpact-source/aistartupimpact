import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import crypto from 'crypto';
import { otpEmailHtml } from '@aistartupimpact/utils';
import { sendEmail } from '@/lib/email/send';
import { authRateLimit, checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const { success: allowed } = await checkRateLimit(authRateLimit, identifier);
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sql`DELETE FROM "EmailOtp" WHERE email = ${email.toLowerCase().trim()} AND purpose = 'employer_signup'`;

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    await sql`
      INSERT INTO "EmailOtp" (id, email, code, purpose, "expiresAt", "createdAt")
      VALUES (gen_random_uuid()::text, ${email.toLowerCase().trim()}, ${hashedCode}, 'employer_signup', ${expiresAt.toISOString()}::timestamp, NOW())
    `;

    sendEmail({
      to: email.toLowerCase().trim(),
      subject: 'Your Verification Code — AI Startup Impact Employer Portal',
      html: otpEmailHtml(code, 'employer'),
      type: 'otp',
    }).catch(err => console.error('[OTP Email Error]', err));

    return NextResponse.json({ success: true, message: 'Verification code sent' });
  } catch (error: any) {
    console.error('[POST /api/employer/auth/send-otp]', error);
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}
