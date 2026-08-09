import { SignJWT } from 'jose';
import { sendEmail, sendEmailWithRetry, sendEmailFireAndForget } from './email/send';
import {
  verificationEmailHtml,
  passwordResetHtml,
  submissionReceivedHtml,
  startupApprovalHtml,
  toolApprovalHtml,
} from '@aistartupimpact/utils/src/email-templates';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export async function generateNewsletterUnsubscribeToken(email: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('90d')
    .sign(secret);
}

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${SITE_URL}/auth/verify?token=${token}`;
  const result = await sendEmailWithRetry({
    to: email,
    subject: 'Verify your email - AI Startup Impact',
    html: verificationEmailHtml(name, verifyUrl),
    type: 'verification',
  });
  if (!result.success) throw new Error(result.error);
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${SITE_URL}/auth/reset-password?token=${token}`;
  const result = await sendEmailWithRetry({
    to: email,
    subject: 'Reset your password - AI Startup Impact',
    html: passwordResetHtml(name, resetUrl),
    type: 'password_reset',
  });
  if (!result.success) throw new Error(result.error);
}

export async function sendSubmissionReceivedEmail(
  email: string,
  name: string,
  entityType: 'startup' | 'tool',
  entityName: string
) {
  sendEmailFireAndForget({
    to: email,
    subject: `We received your ${entityType} submission!`,
    html: submissionReceivedHtml(name, entityType, entityName),
    type: 'submission_received',
  });
}

export async function sendApprovalEmail(
  email: string,
  name: string,
  entityType: 'startup' | 'tool',
  entityName: string,
  entitySlug: string
) {
  const html = entityType === 'startup'
    ? startupApprovalHtml(entityName, name, entitySlug)
    : toolApprovalHtml(entityName, name, entitySlug);

  sendEmailFireAndForget({
    to: email,
    subject: `Your ${entityType} "${entityName}" is now live on AI Startup Impact`,
    html,
    type: 'approval',
  });
}
