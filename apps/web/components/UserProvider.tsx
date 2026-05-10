'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  slug: string;
  bio: string | null;
  twitter: string | null;
  linkedin: string | null;
  termsAcceptedAt: string | null;
}

interface UserContextType {
  user: UserSession | null;
  loading: boolean;
  signIn: (returnTo?: string) => void;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const response = await fetch('/api/user/session');
      const data = await response.json();
      setUser(data.user || null);
    } catch (error) {
      console.error('Failed to fetch session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const signIn = (returnTo?: string) => {
    const url = `/api/user/auth/google?returnTo=${encodeURIComponent(returnTo || '/profile')}`;
    window.location.href = url;
  };

  const signOut = async () => {
    try {
      await fetch('/api/user/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  return (
    <UserContext.Provider value={{ user, loading, signIn, signOut, refreshSession }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
