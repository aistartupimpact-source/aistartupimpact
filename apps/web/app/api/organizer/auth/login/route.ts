import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { createOrganizerSession, verifyPassword } from "@/lib/organizer-auth";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { authRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(authRateLimit, identifier);
  if (!success) {
    return NextResponse.json({ success: false, error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true, status: true },
    });

    if (!organizer || !organizer.passwordHash) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    if (organizer.status === "SUSPENDED") {
      return NextResponse.json({ success: false, error: "Your account has been suspended." }, { status: 403 });
    }

    const valid = await verifyPassword(password, organizer.passwordHash);
    if (!valid) {
      return NextResponse.json({ success: false, error: "Invalid email or password." }, { status: 401 });
    }

    // Update last login
    await prisma.eventOrganizer.update({
      where: { id: organizer.id },
      data: { lastLoginAt: new Date() },
    });

    // Create session
    await createOrganizerSession(organizer.id);

    return NextResponse.json({
      success: true,
      data: { id: organizer.id, name: organizer.name, email: organizer.email },
    });
  } catch (error: any) {
    console.error("Organizer login error:", error);
    return NextResponse.json({ success: false, error: "Login failed." }, { status: 500 });
  }
}
