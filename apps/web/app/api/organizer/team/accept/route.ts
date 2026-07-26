import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";

export const dynamic = "force-dynamic";

/** POST — Accept invite and set password */
export async function POST(request: NextRequest) {
  const { token, password } = await request.json();
  if (!token || !password) return NextResponse.json({ success: false, error: "Token and password required" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ success: false, error: "Min 8 characters" }, { status: 400 });

  const member = await prisma.eventTeamMember.findUnique({ where: { inviteToken: token } });
  if (!member) return NextResponse.json({ success: false, error: "Invalid or expired invite" }, { status: 400 });
  if (member.expiresAt < new Date()) return NextResponse.json({ success: false, error: "Invite expired. Ask organizer to resend." }, { status: 400 });
  if (member.status === "ACTIVE") return NextResponse.json({ success: false, error: "Already accepted" }, { status: 400 });

  const { hash } = await import("bcryptjs");
  const passwordHash = await hash(password, 12);

  await prisma.eventTeamMember.update({
    where: { id: member.id },
    data: { status: "ACTIVE", passwordHash, acceptedAt: new Date() },
  });

  return NextResponse.json({ success: true, message: "Welcome! You can now log in." });
}
