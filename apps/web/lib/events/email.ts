import { Resend } from "resend";
import { generateUnsubscribeToken } from "./unsubscribe";

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const FROM_NAME = process.env.RESEND_FROM_NAME || "AI Startup Impact";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://aistartupimpact.com";

interface EventEmailData {
  eventTitle: string;
  eventSlug: string;
  eventDate: string;
  eventTime: string;
  eventTimezone: string;
  venueName?: string;
  address?: string;
  format: string;
  qrToken: string;
  googleCalendarUrl: string;
}

/**
 * Send registration confirmation email with QR code and calendar link.
 */
export async function sendRegistrationConfirmationEmail(
  email: string,
  name: string,
  data: EventEmailData
) {
  const client = getResend();
  if (!client) {
    console.warn("Resend not configured, skipping confirmation email");
    return;
  }

  const eventUrl = `${SITE_URL}/events/${data.eventSlug}`;
  const checkInUrl = `${SITE_URL}/events/check-in?token=${data.qrToken}`;

  // Generate QR code as a URL (using a free QR API for the email)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}`;

  const locationHtml =
    data.format === "VIRTUAL"
      ? `<p style="color: #6b7280; font-size: 14px;">📍 Virtual Event — link will be shared before the event</p>`
      : data.venueName
      ? `<p style="color: #6b7280; font-size: 14px;">📍 ${data.venueName}${data.address ? `, ${data.address}` : ""}</p>`
      : "";

  try {
    await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `You're registered! ${data.eventTitle}`,
      headers: {
        "List-Unsubscribe": `<${SITE_URL}/api/events/unsubscribe?email=${encodeURIComponent(email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="border-bottom: 3px solid #FF3131; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact Events</h1>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            You're confirmed for <strong>${data.eventTitle}</strong>! Here are your event details:
          </p>

          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h2 style="color: #111827; font-size: 18px; font-weight: 700; margin: 0 0 12px 0;">${data.eventTitle}</h2>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">📅 ${data.eventDate}</p>
            <p style="color: #6b7280; font-size: 14px; margin: 4px 0;">🕐 ${data.eventTime} (${data.eventTimezone})</p>
            ${locationHtml}
          </div>

          <!-- QR Code -->
          <div style="text-align: center; margin: 32px 0; padding: 24px; background: #ffffff; border: 2px dashed #e5e7eb; border-radius: 12px;">
            <p style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; font-weight: 600;">Your Check-In QR Code</p>
            <img src="${qrImageUrl}" alt="Check-in QR Code" width="180" height="180" style="display: block; margin: 0 auto;" />
            <p style="color: #9ca3af; font-size: 11px; margin-top: 12px;">Show this at the event entrance</p>
          </div>

          <!-- Actions -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.googleCalendarUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px; font-weight: 600; margin-right: 12px;">Add to Calendar</a>
            <a href="${eventUrl}" style="background: #ffffff; color: #374151; padding: 12px 28px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 14px; font-weight: 600; border: 1px solid #d1d5db;">View Event</a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
            See you there!<br/>
            AI Startup Impact Events Team
          </p>
          <p style="color: #9ca3af; font-size: 11px; margin-top: 24px;">
            <a href="${SITE_URL}/api/events/unsubscribe?email=${encodeURIComponent(email)}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe from event emails</a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send registration confirmation email:", error);
  }
}

/**
 * Send welcome email to new newsletter subscribers who opted in during registration.
 */
export async function sendNewsletterWelcomeEmail(
  email: string,
  name: string,
  subscriberId: string
) {
  const client = getResend();
  if (!client) return;

  const unsubToken = await generateUnsubscribeToken(subscriberId, email);
  const unsubUrl = `${SITE_URL}/api/events/unsubscribe?token=${unsubToken}`;

  try {
    await client.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "Welcome! You'll get AI event updates near you",
      headers: {
        "List-Unsubscribe": `<${unsubUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="border-bottom: 3px solid #FF3131; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact Events</h1>
          </div>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hi ${name},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            You're now on the list! We'll notify you about upcoming AI events, conferences, and hackathons near you.
          </p>

          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <p style="color: #991b1b; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">What you'll get:</p>
            <ul style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>New AI events in your area</li>
              <li>Hackathon and workshop announcements</li>
              <li>Early access to popular events</li>
            </ul>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            Browse upcoming events: <a href="${SITE_URL}/events" style="color: #FF3131; text-decoration: none; font-weight: 600;">${SITE_URL}/events</a>
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
          
          <p style="color: #9ca3af; font-size: 11px;">
            <a href="${unsubUrl}" style="color: #9ca3af; text-decoration: underline;">Unsubscribe</a> if you no longer want these updates.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send newsletter welcome email:", error);
  }
}
