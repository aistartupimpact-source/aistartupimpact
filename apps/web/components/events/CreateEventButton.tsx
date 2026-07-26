'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceUnlockModal from '@/components/auth/WorkspaceUnlockModal';
import SignInModal from '@/components/auth/SignInModal';

export default function CreateEventButton() {
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
      // Not signed in → show sign in modal
      setShowSignIn(true);
      return;
    }
    if (user.organizerId) {
      // Already has organizer workspace → go directly
      router.push('/organizer/events/create');
      return;
    }
    // Signed in but no organizer workspace → show unlock modal
    setShowUnlock(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className="px-4 py-2 text-sm font-bold font-jakarta text-white bg-brand hover:bg-brand-600 rounded-xl transition-colors shadow-sm disabled:opacity-60"
      >
        + Create Event
      </button>

      <WorkspaceUnlockModal
        isOpen={showUnlock}
        onClose={() => setShowUnlock(false)}
        workspace="organizer"
        isAuthenticated={!!user}
        onSignInRequired={() => { setShowUnlock(false); setShowSignIn(true); }}
      />

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        defaultMode="signin"
        returnTo="/events"
      />
    </>
  );
}
