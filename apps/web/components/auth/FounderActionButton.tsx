'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceUnlockModal from '@/components/auth/WorkspaceUnlockModal';
import SignInModal from '@/components/auth/SignInModal';

interface FounderActionButtonProps {
  /** The URL to navigate to once founder workspace is available */
  href: string;
  /** Button label */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A button that gates founder actions behind workspace unlock.
 * If user is not signed in → shows sign-in modal.
 * If user is signed in but no founder workspace → shows unlock modal.
 * If user already has founder workspace → navigates directly.
 */
export default function FounderActionButton({ href, children, className }: FounderActionButtonProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Try legacy session first
        const res = await fetch('/api/user/session');
        if (res.ok) {
          const data = await res.json();
          if (data.user) { setUser(data.user); setLoading(false); return; }
        }
        // Try unified session
        const unifiedRes = await fetch('/api/auth/session');
        if (unifiedRes.ok) {
          const data = await unifiedRes.json();
          if (data.user) { setUser(data.user); setLoading(false); return; }
        }
      } catch {}
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleClick = () => {
    if (!user) {
      setShowSignIn(true);
      return;
    }
    if (user.founderId) {
      router.push(href);
      return;
    }
    setShowUnlock(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className || "bg-brand text-white px-4 py-2 rounded-xl font-bold font-jakarta text-sm hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-60"}
      >
        {children}
      </button>

      <WorkspaceUnlockModal
        isOpen={showUnlock}
        onClose={() => setShowUnlock(false)}
        workspace="founder"
        isAuthenticated={!!user}
        onSignInRequired={() => { setShowUnlock(false); setShowSignIn(true); }}
      />

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        defaultMode="signin"
        returnTo={href}
      />
    </>
  );
}
