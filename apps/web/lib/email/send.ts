import { Resend } from 'resend';

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'AI Startup Impact';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  headers?: Record<string, string>;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  type?: string;
}

interface SendResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

async function logEmail(opts: { type: string; to: string; subject: string; status: string; resendId?: string; error?: string }) {
  try {
    const { prisma } = await import('@aistartupimpact/database');
    await prisma.$executeRaw`
      INSERT INTO "EmailLog" (id, type, "to", subject, status, "resendId", error, "sentAt")
      VALUES (gen_random_uuid(), ${opts.type}, ${opts.to}, ${opts.subject}, ${opts.status}, ${opts.resendId || null}, ${opts.error || null}, NOW())
    `;
  } catch (err) {
    console.error('Failed to log email:', err);
  }
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendResult> {
  const client = getResend();
  if (!client) {
    console.warn('Resend API key not configured, skipping email send');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data, error } = await client.emails.send({
      from: opts.from || `${FROM_NAME} <${FROM_EMAIL}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      ...(opts.headers && { headers: opts.headers }),
      ...(opts.replyTo && { replyTo: opts.replyTo }),
      ...(opts.tags && { tags: opts.tags }),
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

export async function sendEmailWithRetry(
  opts: SendEmailOptions,
  maxAttempts = 3
): Promise<SendResult> {
  const delays = [1000, 3000, 9000];

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await sendEmail(opts);
    if (result.success) return result;

    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, delays[attempt]));
    } else {
      return result;
    }
  }

  return { success: false, error: 'Max retries exceeded' };
}

export function sendEmailFireAndForget(opts: SendEmailOptions): void {
  sendEmail(opts).catch(err => console.error('Fire-and-forget email error:', err));
}
