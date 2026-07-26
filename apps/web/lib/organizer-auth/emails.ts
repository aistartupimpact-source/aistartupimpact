import { Resend } from "resend";

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const FROM_NAME = process.env.RESEND_FROM_NAME || "AI Startup Impact";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Send email verification link after organizer signup.
 */
export async function sendOrganizerVerificationEmail(email: string, name: string, token: string) {
  const client = getResend();
  if (!client) {
    console.warn("Resend not configured, skipping verification email");
    return;
  }

  const verifyUrl = `${SITE_URL}/api/organizer/auth/verify?token=${token}`;

  await client.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: "Verify your email — AI Startup Impact Events",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="border-bottom: 3px solid #FF3131; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact Events</h1>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          Welcome! Please verify your email to start organizing AI events.
        </p>

        <div style="margin: 32px 0; text-align: center;">
          <a href="${verifyUrl}" style="background: #FF3131; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; display: inline-block; font-size: 15px; font-weight: 700;">
            Verify Email Address
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px;">Or copy this link: <a href="${verifyUrl}" style="color: #FF3131;">${verifyUrl}</a></p>
        <p style="color: #6b7280; font-size: 13px;">This link expires in 24 hours.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 11px;">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
}

/**
 * Send password reset link.
 */
export async function sendOrganizerPasswordResetEmail(email: string, name: string, token: string) {
  const client = getResend();
  if (!client) {
    console.warn("Resend not configured, skipping reset email");
    return;
  }

  const resetUrl = `${SITE_URL}/organizer/reset-password?token=${token}`;

  await client.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: "Reset your password — AI Startup Impact Events",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="border-bottom: 3px solid #FF3131; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact Events</h1>
        </div>

        <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          We received a request to reset your password. Click below to set a new one:
        </p>

        <div style="margin: 32px 0; text-align: center;">
          <a href="${resetUrl}" style="background: #111827; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; display: inline-block; font-size: 15px; font-weight: 700;">
            Reset Password
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px;">Or copy this link: <a href="${resetUrl}" style="color: #FF3131;">${resetUrl}</a></p>
        <p style="color: #6b7280; font-size: 13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #9ca3af; font-size: 11px;">AI Startup Impact Events Team</p>
      </div>
    `,
  });
}
