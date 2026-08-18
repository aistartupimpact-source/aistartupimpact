"use client";

import { SessionProvider } from "next-auth/react";
import { InactivityGuard } from "./InactivityGuard";

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      <InactivityGuard>
        {children}
      </InactivityGuard>
    </SessionProvider>
  );
}
