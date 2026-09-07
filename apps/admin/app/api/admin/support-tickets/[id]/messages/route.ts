import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@aistartupimpact/database";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireApiAuth(["SUPER_ADMIN", "EDITOR_IN_CHIEF"]);
  if (error) return error;

  const { body, isInternal } = await request.json();
  if (!body?.trim()) return NextResponse.json({ success: false, error: "Message body is required" }, { status: 400 });

  const ticket = await prisma.supportTicket.findUnique({ where: { id: params.id } });
  if (!ticket) return NextResponse.json({ success: false, error: "Ticket not found" }, { status: 404 });

  const user = (session as any).user;

  const message = await prisma.supportTicketMessage.create({
    data: {
      ticketId: params.id,
      senderType: "ADMIN",
      senderId: user.id,
      senderName: user.name || "Support",
      body,
      isInternal: !!isInternal,
    },
  });

  if (!isInternal && ticket.status === "OPEN") {
    await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: "AWAITING_USER" },
    });
  }

  return NextResponse.json({ success: true, message });
}
