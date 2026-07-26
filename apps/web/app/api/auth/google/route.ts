import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

/**
 * Unified Google OAuth — delegates to existing user Google auth route
 * which has the registered redirect URI in Google Cloud Console.
 * 
 * Once you add http://localhost:3000/api/auth/google/callback (and the production URL)
 * to your Google Cloud Console authorized redirect URIs, this can use its own callback.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const returnTo = searchParams.get('returnTo') || '/profile';

  // Delegate to the existing user Google auth route which has the correct redirect_uri registered
  const userGoogleUrl = new URL('/api/user/auth/google', request.url);
  userGoogleUrl.searchParams.set('returnTo', returnTo);

  return NextResponse.redirect(userGoogleUrl.toString());
}
