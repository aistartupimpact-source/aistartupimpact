import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error('RESEND_API_KEY environment variable is not defined.');
}

export const resend = new Resend(resendApiKey);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export async function sendEmail({
  to,
  subject,
  html,
  react,
}: {
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
}) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      react,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
