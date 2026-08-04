import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { setEmployerSession } from '@/lib/employer-auth';

export const dynamic = 'force-dynamic';

const sql = neon(process.env.DATABASE_URL!);

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find employer
    const employers = await sql`
      SELECT id, "companyName", slug, email, "passwordHash", plan, "isActive",
             "emailVerified", "failedLoginAttempts", "lockedUntil"
      FROM "JobBoardEmployer"
      WHERE email = ${email.toLowerCase().trim()}
      LIMIT 1
    `;

    if (employers.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const employer = employers[0] as any;

    // Check if account is active
    if (!employer.isActive) {
      return NextResponse.json({ error: 'Account is suspended. Contact support.' }, { status: 403 });
    }

    // Check if account is locked
    if (employer.lockedUntil) {
      const lockExpiry = new Date(employer.lockedUntil + 'Z');
      if (lockExpiry > new Date()) {
        const minutesLeft = Math.ceil((lockExpiry.getTime() - Date.now()) / 60000);
        return NextResponse.json({
          error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''}.`
        }, { status: 429 });
      }
      // Lock expired — reset
      await sql`UPDATE "JobBoardEmployer" SET "lockedUntil" = NULL, "failedLoginAttempts" = 0 WHERE id = ${employer.id}`;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, employer.passwordHash);

    if (!isValid) {
      const newAttempts = (employer.failedLoginAttempts || 0) + 1;

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        // Lock account
        const lockUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
        await sql`
          UPDATE "JobBoardEmployer"
          SET "failedLoginAttempts" = ${newAttempts}, "lockedUntil" = ${lockUntil.toISOString()}::timestamp
          WHERE id = ${employer.id}
        `;

        // Send alert email
        try {
          const { Resend } = await import('resend');
          const resendKey = process.env.RESEND_API_KEY;
          if (resendKey) {
            const resend = new Resend(resendKey);
            await resend.emails.send({
              from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
              to: employer.email,
              subject: '⚠️ Security Alert — Failed Login Attempts',
              html: `
                <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                  <h2 style="color: #dc2626; margin-bottom: 8px;">⚠️ Security Alert</h2>
                  <p style="color: #666; font-size: 14px;">Someone attempted to sign in to your <strong>${employer.companyName}</strong> Employer Portal account ${newAttempts} times with an incorrect password.</p>
                  <p style="color: #666; font-size: 14px;">Your account has been temporarily locked for ${LOCKOUT_MINUTES} minutes.</p>
                  <p style="color: #666; font-size: 14px; margin-top: 16px;">If this wasn't you, we recommend <a href="${process.env.NEXT_PUBLIC_WEB_URL || 'https://aistartupimpact.com'}/employer/forgot-password" style="color: #ff3131;">changing your password immediately</a>.</p>
                  <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                  <p style="color: #999; font-size: 11px;">AI Startup Impact — Employer Portal Security</p>
                </div>
              `,
            });
          }
        } catch {}

        return NextResponse.json({
          error: `Account locked for ${LOCKOUT_MINUTES} minutes due to too many failed attempts. A security alert has been sent to your email.`
        }, { status: 429 });
      }

      // Increment failed attempts
      await sql`UPDATE "JobBoardEmployer" SET "failedLoginAttempts" = ${newAttempts} WHERE id = ${employer.id}`;

      const remaining = MAX_FAILED_ATTEMPTS - newAttempts;
      return NextResponse.json({
        error: `Invalid email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining before account lockout.`
      }, { status: 401 });
    }

    // ✅ Password correct — reset failed attempts + update last login
    await sql`
      UPDATE "JobBoardEmployer"
      SET "failedLoginAttempts" = 0, "lockedUntil" = NULL, "lastLoginAt" = NOW()
      WHERE id = ${employer.id}
    `;

    // Set session cookie
    await setEmployerSession({
      id: employer.id,
      email: employer.email,
      companyName: employer.companyName,
      slug: employer.slug,
      plan: employer.plan,
    });

    return NextResponse.json({
      success: true,
      emailVerified: employer.emailVerified,
      employer: { id: employer.id, companyName: employer.companyName, slug: employer.slug },
    });
  } catch (error: any) {
    console.error('[POST /api/employer/auth/login]', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
