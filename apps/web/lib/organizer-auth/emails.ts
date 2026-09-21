import { organizerVerificationHtml, organizerPasswordResetHtml } from "@udyaibase/utils";
import { sendEmailFireAndForget } from "../email/send";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@udyaibase.com";

export async function sendOrganizerVerificationEmail(email: string, name: string, token: string) {
  const verifyUrl = `${SITE_URL}/api/organizer/auth/verify?token=${token}`;

  sendEmailFireAndForget({
    to: email,
    from: `Udyaibase Events <${FROM_EMAIL}>`,
    subject: "Verify your email — Udyaibase Events",
    html: organizerVerificationHtml(name, verifyUrl),
    type: "verification",
  });
}

export async function sendOrganizerPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${SITE_URL}/organizer/reset-password?token=${token}`;

  sendEmailFireAndForget({
    to: email,
    from: `Udyaibase Events <${FROM_EMAIL}>`,
    subject: "Reset your password — Udyaibase Events",
    html: organizerPasswordResetHtml(name, resetUrl),
    type: "password_reset",
  });
}
