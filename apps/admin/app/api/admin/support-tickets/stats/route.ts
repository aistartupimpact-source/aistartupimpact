import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@aistartupimpact/database";

export async function GET() {
  const { error } = await requireApiAuth(["SUPER_ADMIN", "EDITOR_IN_CHIEF"]);
  if (error) return error;

  const counts = await prisma.supportTicket.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const map: Record<string, number> = {};
  let total = 0;
  for (const row of counts) {
    map[row.status] = row._count._all;
    total += row._count._all;
  }

  return NextResponse.json({
    success: true,
    stats: {
      open: map["OPEN"] || 0,
      inProgress: map["IN_PROGRESS"] || 0,
      awaiting: map["AWAITING_USER"] || 0,
      resolved: map["RESOLVED"] || 0,
      closed: map["CLOSED"] || 0,
      total,
    },
  });
}
