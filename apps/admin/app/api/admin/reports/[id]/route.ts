import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status, adminNotes } = await request.json();

  await prisma.contentReport.update({
    where: { id: params.id },
    data: {
      status: status || undefined,
      adminNotes: adminNotes !== undefined ? adminNotes : undefined,
      resolvedAt: ["RESOLVED", "DISMISSED"].includes(status) ? new Date() : undefined,
      resolvedBy: ["RESOLVED", "DISMISSED"].includes(status) ? session.user.id : undefined,
    },
  });

  return NextResponse.json({ success: true });
}
