import { organizerVerificationHtml, organizerPasswordResetHtml } from "@aistartupimpact/utils";
import { sendEmailFireAndForget } from "../email/send";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";

export async function sendOrganizerVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${SITE_URL}/api/organizer/auth/verify?token=${token}`;

  sendEmailFireAndForget({
    to: email,
    from: `AI Startup Impact Events <${FROM_EMAIL}>`,
    subject: "Verify your email — AI Startup Impact Events",
    html: organizerVerificationHtml(name, verifyUrl),
    type: "verification",
  });
}

export async function sendOrganizerPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${SITE_URL}/organizer/reset-password?token=${token}`;

  sendEmailFireAndForget({
    to: email,
    from: `AI Startup Impact Events <${FROM_EMAIL}>`,
    subject: "Reset your password — AI Startup Impact Events",
    html: organizerPasswordResetHtml(name, resetUrl),
    type: "password_reset",
  });
}
