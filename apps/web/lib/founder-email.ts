import { Resend } from 'resend';
import { SignJWT } from 'jose';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export async function generateNewsletterUnsubscribeToken(email: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(secret);
}

// Transactional emails (verification, password reset, notifications)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'AI Startup Impact';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${SITE_URL}/auth/verify?token=${token}`;
  
  const client = getResend();
  if (!client) {
    console.warn('Resend API key not configured, skipping email send');
    return;
  }
  
  try {
    await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Verify your email - AI Startup Impact',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Welcome to AI Startup Impact, ${name}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Please verify your email address by clicking the button below:</p>
          <div style="margin: 30px 0;">
            <a href="${verifyUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${verifyUrl}</p>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`;
  
  const client = getResend();
  if (!client) {
    console.warn('Resend API key not configured, skipping email send');
    return;
  }
  
  try {
    await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Reset your password - AI Startup Impact',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4b5563; line-height: 1.6;">Click the button below to reset your password:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy this link: ${resetUrl}</p>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendSubmissionReceivedEmail(
  email: string,
  name: string,
  entityType: 'startup' | 'tool',
  entityName: string
) {
  const client = getResend();
  if (!client) {
    console.warn('Resend API key not configured, skipping email send');
    return;
  }
  
  try {
    await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `We received your ${entityType} submission!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Submission Received</h2>
          <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4b5563; line-height: 1.6;">Thank you for submitting "${entityName}" to AI Startup Impact.</p>
          <p style="color: #4b5563; line-height: 1.6;">Our team will review your submission within 2-3 business days.</p>
          <p style="color: #4b5563; line-height: 1.6;"><strong>Status:</strong> Pending Review</p>
          <div style="margin: 30px 0;">
            <a href="${SITE_URL}/founder/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View in Dashboard</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>AI Startup Impact Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send submission received email:', error);
  }
}

export async function sendApprovalEmail(
  email: string,
  name: string,
  entityType: 'startup' | 'tool',
  entityName: string,
  entitySlug: string
) {
  const emailSiteUrl = (SITE_URL && !SITE_URL.includes('localhost')) ? SITE_URL : 'https://aistartupimpact.com';
  const liveUrl = `${emailSiteUrl}/${entityType === 'startup' ? 'startups' : 'tools'}/${entitySlug}`;
  const dashboardUrl = `${emailSiteUrl}/founder/dashboard`;
  
  const client = getResend();
  if (!client) {
    console.warn('Resend API key not configured, skipping email send');
    return;
  }
  
  try {
    await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Your ${entityType} "${entityName}" is now live on AI Startup Impact`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${name},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Your ${entityType} <strong>"${entityName}"</strong> has been reviewed and approved by our editorial team. Your listing is now live and discoverable by investors, enterprise buyers, and the broader AI ecosystem.
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Your Live Listing</p>
            <a href="${liveUrl}" style="color: #6366f1; font-size: 15px; font-weight: 600; text-decoration: none;">${liveUrl}</a>
          </div>

          <div style="margin: 32px 0;">
            <a href="${liveUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">View Your Listing</a>
            <a href="${dashboardUrl}" style="background: #ffffff; color: #374151; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600; border: 1px solid #d1d5db; margin-left: 12px;">Founder Dashboard</a>
          </div>

          ${entityType === 'startup' ? `
          <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #4338ca; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Get Your Verified Badge</p>
            <p style="color: #374151; font-size: 14px; line-height: 1.5; margin: 0;">
              Verifying your startup through the DNS will help you get a verified badge and increase trust with investors and enterprise buyers. You can configure this easily from your <a href="${dashboardUrl}" style="color: #6366f1; font-weight: 600; text-decoration: none;">Founder Dashboard</a>.
            </p>
          </div>
          ` : ''}

          <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">
            To increase visibility, we recommend sharing your listing on LinkedIn and with your network.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
            Best regards,<br/>
            The AI Startup Impact Team<br/>
            <a href="${SITE_URL}" style="color: #6366f1; text-decoration: none;">${SITE_URL}</a>
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}
