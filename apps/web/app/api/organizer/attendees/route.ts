import { NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/organizer/attendees — Export organizer's attendees as CSV
 */
export async function GET() {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const registrations = await prisma.eventRegistration.findMany({
    where: { event: { organizerId: session.id }, deletedAt: null },
    orderBy: { registeredAt: "desc" },
    select: {
      guestName: true, guestEmail: true, guestPhone: true,
      guestCompany: true, guestOccupation: true, status: true, registeredAt: true,
      event: { select: { title: true } },
    },
  });

  const headers = ["Name", "Email", "Phone", "Company", "Occupation", "Event", "Status", "Date"];
  const rows = registrations.map(r => [
    r.guestName || "", r.guestEmail || "", r.guestPhone || "",
    r.guestCompany || "", r.guestOccupation || "", r.event.title,
    r.status, new Date(r.registeredAt).toISOString(),
  ]);

  const csv = [headers.join(","), ...rows.map(row => row.map(v => `"${(v || "").replace(/"/g, '""')}"`).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="my-attendees-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
