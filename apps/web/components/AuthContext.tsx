"use client";

import { UserProvider } from "./UserProvider";
import TermsAcceptanceChecker from "./TermsAcceptanceChecker";
import React from "react";

export function AuthContext({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TermsAcceptanceChecker />
      {children}
    </UserProvider>
  );
}
