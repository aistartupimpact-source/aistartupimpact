import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { hashPassword, createOrganizerSession } from "@/lib/organizer-auth";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";
import { authRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/organizer/auth/reset-password
 * Resets the password using the token from the email.
 */
export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(authRateLimit, identifier);
  if (!success) {
    return NextResponse.json({ success: false, error: "Too many attempts." }, { status: 429 });
  }

  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, error: "Token and new password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const organizer = await prisma.eventOrganizer.findUnique({
      where: { verifyToken: token },
      select: { id: true, email: true, name: true },
    });

    if (!organizer) {
      return NextResponse.json({ success: false, error: "Invalid or expired reset link." }, { status: 400 });
    }

    // Update password and clear token
    const passwordHash = await hashPassword(password);
    await prisma.eventOrganizer.update({
      where: { id: organizer.id },
      data: {
        passwordHash,
        verifyToken: null,
        emailVerified: true,
        status: "ACTIVE",
      },
    });

    // Auto-login after password reset
    await createOrganizerSession(organizer.id);

    return NextResponse.json({ success: true, message: "Password reset successfully." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, error: "Reset failed. Please try again." }, { status: 500 });
  }
}
