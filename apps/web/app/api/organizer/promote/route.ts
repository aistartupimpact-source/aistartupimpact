import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const FROM_NAME = process.env.RESEND_FROM_NAME || "AI Startup Impact";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aistartupimpact.com";

/**
 * GET /api/organizer/promote — Get attendee stats (city + occupation breakdown)
 */
export async function GET() {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  // Get all attendees from organizer's events (with consent)
  const attendees = await prisma.eventRegistration.findMany({
    where: { event: { organizerId: session.id }, deletedAt: null },
    select: { guestEmail: true, guestName: true, guestOccupation: true, event: { select: { id: true } } },
  });

  // Get unique subscribers who consented (from EventSubscriber table)
  const subscriberEmails = await prisma.eventSubscriber.findMany({
    where: { subscribed: true, email: { in: attendees.map(a => a.guestEmail!).filter(Boolean) } },
    select: { email: true, locationCity: true },
  });

  const subscriberMap = new Map(subscriberEmails.map(s => [s.email, s.locationCity]));

  // Build city and occupation breakdowns
  const cityCount: Record<string, number> = {};
  const occupationCount: Record<string, number> = {};
  const promotableEmails: { email: string; name: string; city: string; occupation: string }[] = [];

  attendees.forEach(a => {
    if (!a.guestEmail) return;
    const city = subscriberMap.get(a.guestEmail) || "Unknown";
    const occ = a.guestOccupation || "Unknown";
    cityCount[city] = (cityCount[city] || 0) + 1;
    occupationCount[occ] = (occupationCount[occ] || 0) + 1;
    if (subscriberMap.has(a.guestEmail)) {
      promotableEmails.push({ email: a.guestEmail, name: a.guestName || "", city, occupation: occ });
    }
  });

  const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([city, count]) => ({ city, count }));
  const topOccupations = Object.entries(occupationCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([occupation, count]) => ({ occupation, count }));

  return NextResponse.json({ success: true, topCities, topOccupations, totalPromotable: promotableEmails.length });
}

/**
 * POST /api/organizer/promote — Send bulk email to filtered audience
 */
export async function POST(request: NextRequest) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const client = getResend();
  if (!client) return NextResponse.json({ success: false, error: "Email service not configured" }, { status: 500 });

  const { subject, body, filterCity, filterOccupation } = await request.json();
  if (!subject || !body) return NextResponse.json({ success: false, error: "Subject and body required" }, { status: 400 });

  // Get attendees with newsletter consent from organizer's events
  const attendees = await prisma.eventRegistration.findMany({
    where: {
      event: { organizerId: session.id },
      deletedAt: null,
      ...(filterOccupation ? { guestOccupation: filterOccupation } : {}),
    },
    select: { guestEmail: true, guestName: true, guestOccupation: true },
  });

  // Filter to only those who subscribed
  const subscriberEmails = await prisma.eventSubscriber.findMany({
    where: {
      subscribed: true,
      email: { in: attendees.map(a => a.guestEmail!).filter(Boolean) },
      ...(filterCity ? { locationCity: filterCity } : {}),
    },
    select: { email: true },
  });

  const targetEmails = new Set(subscriberEmails.map(s => s.email));
  const recipients = attendees.filter(a => a.guestEmail && targetEmails.has(a.guestEmail));

  if (recipients.length === 0) return NextResponse.json({ success: false, error: "No matching subscribers" }, { status: 400 });

  // Send in batches of 50
  let sent = 0;
  for (let i = 0; i < recipients.length; i += 50) {
    const batch = recipients.slice(i, i + 50);
    try {
      await client.batch.send(
        batch.map(r => ({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: r.guestEmail!,
          subject,
          html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;"><div style="border-bottom:3px solid #FF3131;padding-bottom:16px;margin-bottom:24px;"><strong style="font-size:16px;">AI Startup Impact Events</strong></div><h2 style="margin:0 0 16px;font-size:20px;">${subject}</h2><div style="font-size:15px;line-height:1.7;color:#374151;white-space:pre-wrap;">${body}</div><div style="margin-top:32px;"><a href="${SITE_URL}/events" style="background:#FF3131;color:#fff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">Browse Events</a></div><hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0;"/><p style="font-size:11px;color:#9ca3af;">You're receiving this because you opted in during event registration. <a href="${SITE_URL}/api/events/unsubscribe?email=${encodeURIComponent(r.guestEmail!)}" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a></p></div>`,
          headers: { "List-Unsubscribe": `<${SITE_URL}/api/events/unsubscribe?email=${encodeURIComponent(r.guestEmail!)}>` },
        }))
      );
      sent += batch.length;
    } catch (e) { console.error("Batch send error:", e); }
  }

  return NextResponse.json({ success: true, sent });
}
