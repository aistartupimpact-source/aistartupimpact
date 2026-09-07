import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserRole } from "@prisma/client";
import { prisma } from "@aistartupimpact/database";

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

async function isOrgWide2FARequired(): Promise<boolean> {
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: "require2FA" } });
    return setting?.value === true;
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: {
              id: true, role: true, slug: true, email: true,
              failedLoginAttempts: true, lockedUntil: true, isActive: true,
            },
          });

          if (!dbUser) {
            await recordFailedAttempt(user.email);
            return false;
          }

          if (!dbUser.isActive) return false;

          if (dbUser.lockedUntil && dbUser.lockedUntil > new Date()) {
            return `/login?error=locked&until=${dbUser.lockedUntil.toISOString()}`;
          }

          if (dbUser.failedLoginAttempts > 0) {
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { failedLoginAttempts: 0, lockedUntil: null },
            });
          }

          await prisma.user.update({
            where: { id: dbUser.id },
            data: { lastLoginAt: new Date() },
          });

          return true;
        } catch {
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, trigger }) {
      const emailToLookup = user?.email || token?.email;

      if (emailToLookup && (user || trigger === "update")) {
        const dbUser = await prisma.user.findUnique({
          where: { email: emailToLookup as string },
          select: { id: true, role: true, slug: true, twoFactorEnabled: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.slug = dbUser.slug;
          token.twoFactorEnabled = dbUser.twoFactorEnabled;

          if (user) {
            token.twoFactorVerified = dbUser.twoFactorEnabled ? false : true;
          }
        }

        token.require2FA = await isOrgWide2FARequired();
      }

      if (trigger === "update" && token.twoFactorPassed) {
        token.twoFactorVerified = true;
        delete token.twoFactorPassed;
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { twoFactorEnabled: true },
        });
        if (dbUser) {
          token.twoFactorEnabled = dbUser.twoFactorEnabled;
          if (dbUser.twoFactorEnabled && !token.twoFactorVerified) {
            token.twoFactorVerified = false;
          }
        }
        token.require2FA = await isOrgWide2FARequired();
      }

      token.lastActivity = Date.now();
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.slug = token.slug as string;
        (session as any).twoFactorEnabled = token.twoFactorEnabled ?? false;
        (session as any).twoFactorVerified = token.twoFactorVerified ?? true;
        (session as any).require2FA = token.require2FA ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

async function recordFailedAttempt(email: string) {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, failedLoginAttempts: true },
    });
    if (!dbUser) return;

    const attempts = dbUser.failedLoginAttempts + 1;
    const data: any = { failedLoginAttempts: attempts };
    if (attempts >= LOCKOUT_THRESHOLD) {
      data.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
    }
    await prisma.user.update({ where: { id: dbUser.id }, data });
  } catch {}
}
