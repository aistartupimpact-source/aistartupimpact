import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { randomBytes } from "crypto";
import { checkRateLimit, getClientIdentifier, strictRateLimit } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/password-validation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const { success: rlOk } = await checkRateLimit(strictRateLimit, identifier);
    if (!rlOk) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ success: false, error: "Token required" }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Password required" }, { status: 400 });
    }

    const member = await prisma.founderTeamMember.findUnique({
      where: { inviteToken: token },
      include: { founder: { select: { id: true, company: true } } },
    });

    if (!member) {
      return NextResponse.json({ success: false, error: "Invalid or expired invite" }, { status: 400 });
    }
    if (member.expiresAt && member.expiresAt < new Date()) {
      return NextResponse.json({ success: false, error: "Invite expired. Ask the founder to resend." }, { status: 400 });
    }
    if (member.status === "ACTIVE") {
      return NextResponse.json({ success: false, error: "Already accepted" }, { status: 400 });
    }

    const validation = validatePassword(password, { name: member.name, email: member.email });
    if (!validation.valid) {
      return NextResponse.json({ success: false, error: validation.errors[0], errors: validation.errors }, { status: 400 });
    }

    const { hash } = await import("bcryptjs");
    const passwordHash = await hash(password, 12);

    await prisma.founderTeamMember.update({
      where: { id: member.id },
      data: { status: "ACTIVE", passwordHash, acceptedAt: new Date(), inviteToken: null },
    });

    const existingFounder = await prisma.founderUser.findUnique({
      where: { email: member.email },
    });

    if (!existingFounder) {
      await prisma.founderUser.create({
        data: {
          id: randomBytes(16).toString("hex"),
          email: member.email,
          name: member.name || member.email.split("@")[0],
          passwordHash,
          emailVerified: true,
          status: "ACTIVE",
          company: member.founder?.company || undefined,
          updatedAt: new Date(),
        },
      });
    } else if (!existingFounder.passwordHash) {
      await prisma.founderUser.update({
        where: { id: existingFounder.id },
        data: { passwordHash },
      });
    }

    return NextResponse.json({ success: true, message: "Welcome to the team! You can now log in." });
  } catch (err) {
    console.error("[founder/team/accept POST]", err);
    return NextResponse.json({ success: false, error: "Something went wrong" }, { status: 500 });
  }
}
