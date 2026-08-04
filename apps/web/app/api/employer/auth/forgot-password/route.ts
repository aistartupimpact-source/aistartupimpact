import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email?.trim()) return NextResponse.json({ error: 'Email required' }, { status: 400 });

    // Find employer (don't reveal if account exists)
    const employers = await sql`
      SELECT id, "companyName" FROM "JobBoardEmployer"
      WHERE email = ${email.toLowerCase().trim()} AND "isActive" = true
      LIMIT 1
    `;

    // Always return success (don't reveal account existence)
    if (employers.length === 0) {
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    const employer = employers[0] as any;

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sql`
      UPDATE "JobBoardEmployer"
      SET "resetToken" = ${resetToken}, "resetTokenExpiry" = ${resetTokenExpiry.toISOString()}::timestamp, "updatedAt" = NOW()
      WHERE id = ${employer.id}
    `;

    // Send reset email
    try {
      const { Resend } = await import('resend');
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const siteUrl = process.env.NEXT_PUBLIC_WEB_URL || 'https://aistartupimpact.com';
        const resetUrl = `${siteUrl}/employer/reset-password?token=${resetToken}`;

        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
          to: email.toLowerCase().trim(),
          subject: 'Reset Your Password — AI Startup Impact',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
              <h2 style="color: #1a1a2e; margin-bottom: 8px;">Reset your password</h2>
              <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Hi ${employer.companyName}, click the button below to reset your Employer Portal password:</p>
              <a href="${resetUrl}" style="display: inline-block; background: #ff3131; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">Reset Password</a>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="color: #999; font-size: 11px;">AI Startup Impact — Employer Portal</p>
            </div>
          `,
        });
      }
    } catch (emailErr) {
      console.error('[Reset Email Error]', emailErr);
    }

    return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
  } catch (error: any) {
    console.error('[POST /api/employer/auth/forgot-password]', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
