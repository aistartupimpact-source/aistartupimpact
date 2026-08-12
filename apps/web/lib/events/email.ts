import { generateUnsubscribeToken } from "./unsubscribe";
import { eventRegistrationHtml, eventNewsletterWelcomeHtml } from "@aistartupimpact/utils";
import type { EventEmailData } from "@aistartupimpact/utils";
import { sendEmailFireAndForget } from "../email/send";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aistartupimpact.com";

export type { EventEmailData };

export async function sendRegistrationConfirmationEmail(
  email: string,
  name: string,
  data: EventEmailData
) {
  sendEmailFireAndForget({
    to: email,
    from: `AI Startup Impact Events <${FROM_EMAIL}>`,
    subject: `You're registered! ${data.eventTitle}`,
    html: eventRegistrationHtml(name, data),
    type: "event_registration",
    headers: {
      "List-Unsubscribe": `<${SITE_URL}/api/events/unsubscribe?email=${encodeURIComponent(email)}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}

export async function sendNewsletterWelcomeEmail(
  email: string,
  name: string,
  subscriberId: string
) {
  const unsubToken = await generateUnsubscribeToken(subscriberId, email);
  const unsubUrl = `${SITE_URL}/api/events/unsubscribe?token=${unsubToken}`;

  sendEmailFireAndForget({
    to: email,
    from: `AI Startup Impact Events <${FROM_EMAIL}>`,
    subject: "Welcome! You'll get AI event updates near you",
    html: eventNewsletterWelcomeHtml(name, unsubUrl),
    type: "event_newsletter_welcome",
    headers: {
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
}
