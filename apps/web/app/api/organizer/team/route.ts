import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { Resend } from "resend";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const FROM_NAME = process.env.RESEND_FROM_NAME || "AI Startup Impact";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * GET /api/organizer/team — List team members
 */
export async function GET() {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  const members = await prisma.eventTeamMember.findMany({
    where: { organizerId: session.id },
    orderBy: { createdAt: "desc" },
    include: { assignments: { include: { event: { select: { id: true, title: true } } } } },
  });

  return NextResponse.json({ success: true, members });
}

/**
 * POST /api/organizer/team — Invite new team member
 */
export async function POST(request: NextRequest) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  const { email, role, eventIds } = await request.json();

  if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

  // Check duplicate
  const existing = await prisma.eventTeamMember.findUnique({
    where: { organizerId_email: { organizerId: session.id, email } },
  });
  if (existing && existing.status !== "REVOKED") {
    return NextResponse.json({ success: false, error: "Already a team member" }, { status: 409 });
  }

  const inviteToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

  // Create or reactivate
  let member;
  if (existing) {
    member = await prisma.eventTeamMember.update({
      where: { id: existing.id },
      data: { role: role || "STAFF", status: "PENDING", inviteToken, expiresAt, acceptedAt: null, passwordHash: null },
    });
  } else {
    member = await prisma.eventTeamMember.create({
      data: { organizerId: session.id, email, role: role || "STAFF", inviteToken, expiresAt },
    });
  }

  // Assign events
  if (eventIds && eventIds.length > 0) {
    await prisma.eventTeamAssignment.deleteMany({ where: { teamMemberId: member.id } });
    await prisma.eventTeamAssignment.createMany({
      data: eventIds.map((eventId: string) => ({ teamMemberId: member.id, eventId })),
    });
  }

  // Send invite email
  try {
    let resend: Resend | null = null;
    if (process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
    if (resend) {
      const acceptUrl = `${SITE_URL}/team/accept?token=${inviteToken}`;
      await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: email,
        subject: `You're invited to manage events — AI Startup Impact`,
        html: `<div style="font-family:-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;"><div style="border-bottom:3px solid #FF3131;padding-bottom:16px;margin-bottom:24px;"><strong>AI Startup Impact Events</strong></div><p style="font-size:16px;color:#374151;">Hi,</p><p style="font-size:16px;color:#374151;"><strong>${session.name}</strong> has invited you as <strong>${role || "STAFF"}</strong> to help manage events.</p><div style="margin:32px 0;text-align:center;"><a href="${acceptUrl}" style="background:#FF3131;color:#fff;padding:14px 32px;text-decoration:none;border-radius:10px;font-weight:700;font-size:15px;">Accept Invitation</a></div><p style="font-size:13px;color:#6b7280;">This link expires in 7 days.</p></div>`,
      });
    }
  } catch (e) { console.error("Team invite email error:", e); }

  return NextResponse.json({ success: true, member });
}
