import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-oauth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const returnTo = searchParams.get('returnTo') || '/founder/dashboard';
    
    // Generate state with return URL
    const state = Buffer.from(JSON.stringify({ returnTo })).toString('base64');
    
    const authUrl = getGoogleAuthUrl(state);
    
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    return NextResponse.redirect(new URL('/auth/signup?error=oauth_failed', request.url));
  }
}
