import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/organizer/auth/google
 * Redirects to Google OAuth consent screen with proper client_id and redirect_uri.
 * This keeps the GOOGLE_CLIENT_ID server-side only (no NEXT_PUBLIC_ needed).
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const redirectUri = `${siteUrl}/api/organizer/auth/google/callback`;

  if (!clientId) {
    return NextResponse.redirect(
      new URL("/organizer/login?error=oauth_not_configured", request.url)
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state: "organizer",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
