import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { createOrganizerSession, hashPassword, generateToken } from "@/lib/organizer-auth";
import { sendOrganizerVerificationEmail } from "@/lib/organizer-auth/emails";
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
    const { name, email, password, company } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ success: false, error: "Password must contain an uppercase letter." }, { status: 400 });
    }
    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ success: false, error: "Password must contain a lowercase letter." }, { status: 400 });
    }
    if (!/[0-9]/.test(password)) {
      return NextResponse.json({ success: false, error: "Password must contain a number." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email address." }, { status: 400 });
    }

    // Check existing
    const existing = await prisma.eventOrganizer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "An account with this email already exists. Try signing in." }, { status: 409 });
    }

    // Create organizer with pending verification
    const passwordHash = await hashPassword(password);
    const verifyToken = generateToken();

    const organizer = await prisma.eventOrganizer.create({
      data: {
        email,
        name,
        passwordHash,
        company: company || null,
        emailVerified: false,
        verifyToken,
        status: "PENDING_VERIFICATION",
      },
    });

    // Send verification email (fire and forget)
    sendOrganizerVerificationEmail(email, name, verifyToken).catch((err) => {
      console.error("Failed to send verification email:", err);
    });

    // Create session immediately (they can use the platform, but we'll remind them to verify)
    await createOrganizerSession(organizer.id);

    return NextResponse.json({
      success: true,
      data: { id: organizer.id, name: organizer.name, email: organizer.email },
      message: "Account created! Check your email to verify your address.",
    });
  } catch (error: any) {
    console.error("Organizer signup error:", error);
    return NextResponse.json({ success: false, error: "Signup failed. Please try again." }, { status: 500 });
  }
}
