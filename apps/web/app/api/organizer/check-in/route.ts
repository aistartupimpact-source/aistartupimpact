import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/organizer/check-in
 * Check in an attendee by QR token, email, or name.
 */
export async function POST(request: NextRequest) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const { eventId, input, action } = await request.json();

  if (!eventId || !input) {
    return NextResponse.json({ success: false, error: "Event and search input required" }, { status: 400 });
  }

  // Verify organizer owns this event
  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: session.id, deletedAt: null },
    select: { id: true, title: true },
  });
  if (!event) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });

  // Find registration by QR token, email, or name
  let registration = await prisma.eventRegistration.findFirst({
    where: { eventId, qrToken: input, deletedAt: null },
    select: { id: true, guestName: true, guestEmail: true, guestCompany: true, guestOccupation: true, status: true, checkedInAt: true, ticketTier: { select: { name: true } } },
  });

  if (!registration) {
    registration = await prisma.eventRegistration.findFirst({
      where: { eventId, guestEmail: { equals: input, mode: "insensitive" }, deletedAt: null },
      select: { id: true, guestName: true, guestEmail: true, guestCompany: true, guestOccupation: true, status: true, checkedInAt: true, ticketTier: { select: { name: true } } },
    });
  }

  if (!registration) {
    registration = await prisma.eventRegistration.findFirst({
      where: { eventId, guestName: { contains: input, mode: "insensitive" }, deletedAt: null },
      select: { id: true, guestName: true, guestEmail: true, guestCompany: true, guestOccupation: true, status: true, checkedInAt: true, ticketTier: { select: { name: true } } },
    });
  }

  if (!registration) {
    return NextResponse.json({ success: false, status: "NOT_FOUND", message: "No registration found" });
  }

  // Undo check-in
  if (action === "undo") {
    if (registration.status !== "CHECKED_IN") {
      return NextResponse.json({ success: false, status: "ERROR", message: "Not checked in" });
    }
    await prisma.eventRegistration.update({ where: { id: registration.id }, data: { status: "CONFIRMED", checkedInAt: null } });
    return NextResponse.json({ success: true, status: "UNDONE", attendee: { ...registration, status: "CONFIRMED" } });
  }

  // Already checked in — duplicate scan
  if (registration.status === "CHECKED_IN") {
    return NextResponse.json({
      success: false, status: "ALREADY_CHECKED_IN",
      message: `Already checked in at ${registration.checkedInAt ? new Date(registration.checkedInAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "earlier"}`,
      attendee: registration,
    });
  }

  // Cancelled
  if (registration.status === "CANCELLED") {
    return NextResponse.json({ success: false, status: "CANCELLED", message: "Registration was cancelled", attendee: registration });
  }

  // Waitlisted
  if (registration.status === "WAITLISTED") {
    return NextResponse.json({ success: false, status: "WAITLISTED", message: "On waitlist (not confirmed)", attendee: registration });
  }

  // Check in!
  const now = new Date();
  await prisma.eventRegistration.update({ where: { id: registration.id }, data: { status: "CHECKED_IN", checkedInAt: now } });

  return NextResponse.json({
    success: true, status: "CHECKED_IN",
    message: "Checked in successfully!",
    attendee: { ...registration, status: "CHECKED_IN", checkedInAt: now.toISOString() },
  });
}
