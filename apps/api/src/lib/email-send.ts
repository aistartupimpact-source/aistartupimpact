import { PrismaClient } from '@prisma/client';
import { resend, FROM_EMAIL } from './email';

const prisma = new PrismaClient();

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  headers?: Record<string, string>;
  type?: string;
}

interface SendResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

async function logEmail(opts: { type: string; to: string; subject: string; status: string; resendId?: string; error?: string }) {
  try {
    await prisma.$executeRaw`
      INSERT INTO "EmailLog" (id, type, "to", subject, status, "resendId", error, "sentAt")
      VALUES (gen_random_uuid(), ${opts.type}, ${opts.to}, ${opts.subject}, ${opts.status}, ${opts.resendId || null}, ${opts.error || null}, NOW())
    `;
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

export async function sendEmailLogged(opts: SendEmailOptions): Promise<SendResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: opts.from || FROM_EMAIL,
      to: Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html: opts.html,
      ...(opts.headers && { headers: opts.headers }),
    });

    if (error) {
      console.error(`Email send failed [${opts.subject}]:`, error);
      logEmail({ type: opts.type || 'unknown', to: opts.to, subject: opts.subject, status: 'failed', error: error.message });
      return { success: false, error: error.message };
    }

    logEmail({ type: opts.type || 'unknown', to: opts.to, subject: opts.subject, status: 'sent', resendId: data?.id });
    return { success: true, resendId: data?.id };
  } catch (err: any) {
    console.error(`Email send error [${opts.subject}]:`, err);
    logEmail({ type: opts.type || 'unknown', to: opts.to, subject: opts.subject, status: 'failed', error: err.message });
    return { success: false, error: err.message };
  }
}

export function sendEmailFireAndForget(opts: SendEmailOptions): void {
  sendEmailLogged(opts).catch(err => console.error('Fire-and-forget email error:', err));
}
