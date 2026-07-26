import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { generateQrToken } from "@/lib/events/qr-token";

export const dynamic = "force-dynamic";

/**
 * POST /api/organizer/walk-in — Register a walk-in attendee manually
 */
export async function POST(request: NextRequest) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const { eventId, name, email, phone, company } = await request.json();
  if (!eventId || !name || !email) return NextResponse.json({ success: false, error: "Name and email required" }, { status: 400 });

  // Verify organizer owns event
  const event = await prisma.event.findFirst({ where: { id: eventId, organizerId: session.id, deletedAt: null }, select: { id: true, capacity: true, registrationCount: true } });
  if (!event) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });

  // Check capacity
  if (event.capacity && event.registrationCount >= event.capacity) {
    return NextResponse.json({ success: false, error: "Event is full" }, { status: 400 });
  }

  // Check duplicate
  const existing = await prisma.eventRegistration.findFirst({ where: { eventId, guestEmail: email, deletedAt: null } });
  if (existing) return NextResponse.json({ success: false, error: "Already registered", qrToken: existing.qrToken }, { status: 409 });

  const qrToken = generateQrToken(16);
  const reg = await prisma.eventRegistration.create({
    data: {
      eventId, guestName: name, guestEmail: email, guestPhone: phone || null,
      guestCompany: company || null, status: "CONFIRMED", qrToken,
      registrationSource: "WALK_IN",
    },
  });

  return NextResponse.json({ success: true, data: { id: reg.id, qrToken: reg.qrToken } });
}
