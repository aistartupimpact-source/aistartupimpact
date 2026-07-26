import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.FOUNDER_JWT_SECRET || 'founder-secret-change-in-production'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Onboarding enforcement for founders only
  if (pathname.startsWith('/founder') && !pathname.startsWith('/founder/onboarding') && !pathname.startsWith('/founder/profile')) {
    const token = request.cookies.get('founder-token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.onboardingCompleted === false) {
          const onboardingUrl = new URL('/founder/onboarding', request.url);
          onboardingUrl.searchParams.set('returnTo', pathname);
          return NextResponse.redirect(onboardingUrl);
        }
      } catch {
        // Let page layouts handle auth
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/founder/:path*'],
};
