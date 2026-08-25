import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getFounderSession } from "@/lib/founder-auth";
import { founderTeamInviteHtml } from "@aistartupimpact/utils";
import { sendEmailFireAndForget } from "@/lib/email/send";
import { checkRateLimit, getClientIdentifier, strictRateLimit } from "@/lib/rate-limit";
import { canManageTeam } from "@/lib/founder-team-permissions";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const VALID_ROLES = ["ADMIN", "EDITOR", "VIEWER"] as const;

export async function GET() {
  try {
    const session = await getFounderSession();
    if (!session) return NextResponse.json({ success: false }, { status: 401 });

    const members = await prisma.founderTeamMember.findMany({
      where: { founderId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, members });
  } catch (err) {
    console.error("[founder/team GET]", err);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getFounderSession();
    if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const identifier = getClientIdentifier(request);
    const { success: rlOk } = await checkRateLimit(strictRateLimit, identifier);
    if (!rlOk) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

    const { email, role, name } = await request.json();

    if (!email || typeof email !== "string") return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    const cleanEmail = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ success: false, error: "Invalid email" }, { status: 400 });
    if (cleanEmail === session.email.toLowerCase()) return NextResponse.json({ success: false, error: "You cannot invite yourself" }, { status: 400 });

    const assignRole = VALID_ROLES.includes(role) ? role : "VIEWER";

    const existing = await prisma.founderTeamMember.findUnique({
      where: { founderId_email: { founderId: session.userId, email: cleanEmail } },
    });
    if (existing && existing.status === "ACTIVE") {
      return NextResponse.json({ success: false, error: "Already an active team member" }, { status: 409 });
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    let member;
    if (existing) {
      member = await prisma.founderTeamMember.update({
        where: { id: existing.id },
        data: { role: assignRole, status: "PENDING", inviteToken, expiresAt, acceptedAt: null, passwordHash: null, name: name?.slice(0, 100) || null },
      });
    } else {
      member = await prisma.founderTeamMember.create({
        data: { founderId: session.userId, email: cleanEmail, role: assignRole, inviteToken, expiresAt, name: name?.slice(0, 100) || null },
      });
    }

    const acceptUrl = `${SITE_URL}/founder-team/accept?token=${inviteToken}`;
    sendEmailFireAndForget({
      to: cleanEmail,
      from: `AI Startup Impact <${FROM_EMAIL}>`,
      subject: `You're invited to join ${session.name}'s team — AI Startup Impact`,
      html: founderTeamInviteHtml(session.name, assignRole, acceptUrl),
      type: "founder_team_invite",
    });

    return NextResponse.json({ success: true, member });
  } catch (err) {
    console.error("[founder/team POST]", err);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
