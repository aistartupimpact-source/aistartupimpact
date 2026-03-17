import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserRole } from "@prisma/client";
import { prisma } from "@aistartupimpact/database";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          // Look up user by email without fetching Date columns to avoid Neon HTTP Adapter parsing bug
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, slug: true, email: true }
          });

          // Allow access if user exists. We will allow all roles access to login for now, 
          // but we can add further checks based on roles later
          if (dbUser) {
            return true;
          }

          // Not in DB — reject login silently
          return false;
        } catch (error) {
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, account, profile }) {
      // Re-fetch role on every token refresh so stale tokens don't cause auth issues
      const emailToLookup = user?.email || token?.email;
      if (emailToLookup) {
        const dbUser = await prisma.user.findUnique({
          where: { email: emailToLookup as string },
          select: { id: true, role: true, slug: true }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.slug = dbUser.slug;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.slug = token.slug as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
