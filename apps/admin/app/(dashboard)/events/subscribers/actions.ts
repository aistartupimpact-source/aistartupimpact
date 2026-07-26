"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { Resend } from "resend";

const EVENT_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF"];

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const FROM_NAME = process.env.RESEND_FROM_NAME || "AI Startup Impact";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aistartupimpact.com";

/**
 * Preview audience count filtered by city and/or occupation from EventRegistration.
 */
export async function getAudiencePreviewAction(filters: { city?: string; occupation?: string }) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !EVENT_ROLES.includes(session.user.role)) return { count: 0 };

  try {
    // Query EventRegistration directly — this has city (via EventSubscriber) and occupation
    const where: any = { deletedAt: null, guestEmail: { not: null } };
    if (filters.occupation) where.guestOccupation = filters.occupation;

    let registrations = await prisma.eventRegistration.findMany({
      where,
      select: { guestEmail: true },
      distinct: ["guestEmail"],
    });

    // If city filter, cross-reference with EventSubscriber for location
    if (filters.city) {
      const cityEmails = await prisma.eventSubscriber.findMany({
        where: { subscribed: true, locationCity: filters.city },
        select: { email: true },
      });
      const citySet = new Set(cityEmails.map(e => e.email));
      registrations = registrations.filter(r => r.guestEmail && citySet.has(r.guestEmail));
    }

    return { count: registrations.length };
  } catch (error) {
    console.error("Audience preview error:", error);
    return { count: 0 };
  }
}

/**
 * Send bulk email campaign filtered by city + occupation.
 * Uses EventRegistration for occupation and EventSubscriber for city.
 * Only sends to people who have newsletter consent (exist in EventSubscriber with subscribed=true).
 */
export async function sendCampaignAction(data: { subject: string; body: string; city?: string; occupation?: string; eventSlug?: string }) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !EVENT_ROLES.includes(session.user.role)) return { success: false, error: "Unauthorized" };

  const client = getResend();
  if (!client) return { success: false, error: "Email not configured" };

  try {
    // Get all consented subscribers
    const subscriberWhere: any = { subscribed: true };
    if (data.city) subscriberWhere.locationCity = data.city;

    const subscribers = await prisma.eventSubscriber.findMany({
      where: subscriberWhere,
      select: { email: true, name: true },
    });

    if (subscribers.length === 0) return { success: false, error: "No subscribers match" };

    // If occupation filter, cross-reference with registrations
    let targetEmails = subscribers;
    if (data.occupation) {
      const regEmails = await prisma.eventRegistration.findMany({
        where: { guestOccupation: data.occupation, deletedAt: null },
        select: { guestEmail: true },
        distinct: ["guestEmail"],
      });
      const occSet = new Set(regEmails.map(r => r.guestEmail));
      targetEmails = subscribers.filter(s => occSet.has(s.email));
    }

    if (targetEmails.length === 0) return { success: false, error: "No matching subscribers" };

    // Send in batches
    let sent = 0;
    for (let i = 0; i < targetEmails.length; i += 50) {
      const batch = targetEmails.slice(i, i + 50);
      try {
        await client.batch.send(
          batch.map(s => ({
            from: `${FROM_NAME} <${FROM_EMAIL}>`,
            to: s.email,
            subject: data.subject,
            html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;"><div style="border-bottom:3px solid #FF3131;padding-bottom:16px;margin-bottom:24px;"><strong style="font-size:16px;">AI Startup Impact Events</strong></div><h2 style="margin:0 0 16px;font-size:20px;">${data.subject}</h2><div style="font-size:15px;line-height:1.7;color:#374151;white-space:pre-wrap;">${data.body}</div><div style="margin-top:32px;">${data.eventSlug ? `<a href="${SITE_URL}/events/${data.eventSlug}" style="background:#FF3131;color:#fff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">Register Now →</a>` : `<a href="${SITE_URL}/events" style="background:#FF3131;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">Browse Events</a>`}</div><hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;"/><p style="font-size:11px;color:#9ca3af;"><a href="${SITE_URL}/api/events/unsubscribe?email=${encodeURIComponent(s.email)}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a></p></div>`,
            headers: { "List-Unsubscribe": `<${SITE_URL}/api/events/unsubscribe?email=${encodeURIComponent(s.email)}>` },
          }))
        );
        sent += batch.length;
      } catch (e) { console.error("Batch error:", e); }
    }

    return { success: true, count: sent };
  } catch (error: any) {
    console.error("Campaign error:", error);
    return { success: false, error: "Send failed" };
  }
}
