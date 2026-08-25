import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/verify-2fa", "/setup-2fa", "/api/auth", "/api/admin/verify-2fa", "/api/admin/2fa-setup", "/api/admin/2fa-status", "/api/admin/2fa-disable"];

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const { pathname } = req.nextUrl;

    if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"))) {
      return NextResponse.next();
    }

    if (token?.require2FA && !token?.twoFactorEnabled) {
      return NextResponse.redirect(new URL("/setup-2fa", req.url));
    }

    if (token?.twoFactorEnabled && !token?.twoFactorVerified) {
      return NextResponse.redirect(new URL("/verify-2fa", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)",
  ],
};
