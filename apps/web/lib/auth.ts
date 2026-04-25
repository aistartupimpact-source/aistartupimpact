import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { UserRole } from "@prisma/client";
import { prisma } from "@aistartupimpact/database";

// Random string generator for slugs
function generateSlug(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return `${base}-${Math.random().toString(36).substring(2, 6)}`;
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
          let dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, role: true, slug: true, email: true },
          });

          // Create the user automatically if they don't exist
          if (!dbUser && user.name) {
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                slug: generateSlug(user.name),
                avatar: user.image,
                role: 'CONTRIBUTOR',
              },
              select: { id: true, role: true, slug: true, email: true }
            });
          }
          return !!dbUser;
        } catch (e) {
          console.error("SignIn Callback Error:", e);
          return false;
        }
      }
      return false;
    },
    async jwt({ token, user, trigger }) {
      const emailToLookup = user?.email || token?.email;
      if (emailToLookup) {
        const dbUser = await prisma.user.findUnique({
          where: { email: emailToLookup as string },
          select: { id: true, role: true, slug: true },
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
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as UserRole;
        (session.user as any).slug = token.slug as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
