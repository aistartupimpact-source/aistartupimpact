// Minimal auth stub for API routes that require session checking
// The web app doesn't use NextAuth directly — these routes are called from the admin panel

import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET || 'stub-secret',
};
