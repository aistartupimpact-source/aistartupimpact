import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";

export const dynamic = "force-dynamic";

/**
 * GET /api/organizer/auth/verify?token=<token>
 * Verifies the organizer's email and redirects to dashboard.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/organizer/login?error=invalid_token", request.url));
  }

  try {
    const organizer = await prisma.eventOrganizer.findUnique({
      where: { verifyToken: token },
      select: { id: true, emailVerified: true },
    });

    if (!organizer) {
      return NextResponse.redirect(new URL("/organizer/login?error=invalid_token", request.url));
    }

    if (organizer.emailVerified) {
      return NextResponse.redirect(new URL("/organizer?verified=already", request.url));
    }

    // Mark as verified and activate
    await prisma.eventOrganizer.update({
      where: { id: organizer.id },
      data: {
        emailVerified: true,
        verifyToken: null,
        status: "ACTIVE",
      },
    });

    return NextResponse.redirect(new URL("/organizer?verified=true", request.url));
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.redirect(new URL("/organizer/login?error=verification_failed", request.url));
  }
}
