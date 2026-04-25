import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@aistartupimpact.com';
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
      from: FROM_EMAIL,
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
      from: FROM_EMAIL,
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
      from: FROM_EMAIL,
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
  const liveUrl = `${SITE_URL}/${entityType === 'startup' ? 'startups' : 'tools'}/${entitySlug}`;
  
  const client = getResend();
  if (!client) {
    console.warn('Resend API key not configured, skipping email send');
    return;
  }
  
  try {
    await client.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `🎉 Your ${entityType} is now live!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Congratulations!</h2>
          <p style="color: #4b5563; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4b5563; line-height: 1.6;">Great news! "${entityName}" has been approved and is now live on AI Startup Impact.</p>
          <div style="margin: 30px 0;">
            <a href="${liveUrl}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">View Live Listing</a>
            <a href="${SITE_URL}/founder/dashboard" style="background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Analytics</a>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">Start sharing your listing to get more visibility!</p>
          <p style="color: #6b7280; font-size: 14px;">Best regards,<br>AI Startup Impact Team</p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send approval email:', error);
  }
}
