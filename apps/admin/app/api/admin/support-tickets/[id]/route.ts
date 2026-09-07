import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@aistartupimpact/database";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requireApiAuth(["SUPER_ADMIN", "EDITOR_IN_CHIEF"]);
  if (error) return error;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: params.id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!ticket) return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });
  return NextResponse.json({ success: true, ticket });
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireApiAuth(["SUPER_ADMIN", "EDITOR_IN_CHIEF"]);
  if (error) return error;

  const body = await request.json();
  const data: any = {};

  if (body.status) {
    data.status = body.status;
    if (body.status === "RESOLVED" || body.status === "CLOSED") {
      data.resolvedAt = new Date();
      data.resolvedBy = (session as any).user.id;
      if (body.status === "CLOSED") data.closedAt = new Date();
    }
  }
  if (body.priority) data.priority = body.priority;
  if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo;

  const ticket = await prisma.supportTicket.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ success: true, ticket });
}
