import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/organizer/events/[eventId] — Soft-delete an event
 */
export async function DELETE(request: NextRequest, { params }: { params: { eventId: string } }) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.eventId }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
  if (event.organizerId !== session.id) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });

  await prisma.event.update({ where: { id: params.eventId }, data: { deletedAt: new Date() } });
  return NextResponse.json({ success: true });
}

/**
 * PUT /api/organizer/events/[eventId] — Update an event
 */
export async function PUT(request: NextRequest, { params }: { params: { eventId: string } }) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const event = await prisma.event.findUnique({ where: { id: params.eventId }, select: { organizerId: true } });
  if (!event) return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
  if (event.organizerId !== session.id) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });

  const data = await request.json();

  await prisma.event.update({
    where: { id: params.eventId },
    data: {
      title: data.title || undefined,
      subtitle: data.subtitle !== undefined ? data.subtitle : undefined,
      category: data.category || undefined,
      format: data.format || undefined,
      startAt: data.startAt ? new Date(data.startAt) : undefined,
      endAt: data.endAt ? new Date(data.endAt) : undefined,
      timezone: data.timezone || undefined,
      venueName: data.venueName !== undefined ? data.venueName : undefined,
      address: data.address !== undefined ? data.address : undefined,
      meetingLink: data.meetingLink !== undefined ? data.meetingLink : undefined,
      description: data.description !== undefined ? (data.description ? { text: String(data.description) } : undefined) : undefined,
      capacity: data.capacity !== undefined ? (data.capacity ? parseInt(data.capacity) : null) : undefined,
      coverImageUrl: data.coverImageUrl !== undefined ? data.coverImageUrl : undefined,
      visibility: data.visibility || undefined,
      status: data.status || undefined,
    },
  });

  return NextResponse.json({ success: true });
}

/**
 * GET /api/organizer/events/[eventId] — Get event details
 */
export async function GET(request: NextRequest, { params }: { params: { eventId: string } }) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const event = await prisma.event.findUnique({
    where: { id: params.eventId, deletedAt: null },
    include: {
      registrations: { where: { deletedAt: null }, orderBy: { registeredAt: "desc" }, select: { id: true, guestName: true, guestEmail: true, guestOccupation: true, status: true, registeredAt: true } },
    },
  });

  if (!event) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (event.organizerId !== session.id) return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });

  return NextResponse.json({ success: true, event });
}
