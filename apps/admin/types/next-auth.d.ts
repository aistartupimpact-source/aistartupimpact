import "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      slug: string;
      role: UserRole;
    };
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
    require2FA: boolean;
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    slug: string;
    role: UserRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    slug: string;
    twoFactorEnabled?: boolean;
    twoFactorVerified?: boolean;
    twoFactorPassed?: boolean;
    require2FA?: boolean;
    lastActivity?: number;
  }
}
