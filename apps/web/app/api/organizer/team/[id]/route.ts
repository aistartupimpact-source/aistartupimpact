import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";

export const dynamic = "force-dynamic";

/** PUT — Update team member role/assignments */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const member = await prisma.eventTeamMember.findFirst({ where: { id: params.id, organizerId: session.id } });
  if (!member) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const { role, eventIds } = await request.json();
  await prisma.eventTeamMember.update({ where: { id: params.id }, data: { role: role || undefined } });

  if (eventIds !== undefined) {
    await prisma.eventTeamAssignment.deleteMany({ where: { teamMemberId: params.id } });
    if (eventIds.length > 0) {
      await prisma.eventTeamAssignment.createMany({ data: eventIds.map((eid: string) => ({ teamMemberId: params.id, eventId: eid })) });
    }
  }

  return NextResponse.json({ success: true });
}

/** DELETE — Revoke team member */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  await prisma.eventTeamMember.updateMany({ where: { id: params.id, organizerId: session.id }, data: { status: "REVOKED" } });
  return NextResponse.json({ success: true });
}
