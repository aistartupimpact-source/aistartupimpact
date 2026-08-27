'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useUser } from './UserProvider';
import SignInModal from '@/components/auth/SignInModal';

export default function StorySaveButton({ slug }: { slug: string }) {
  const { user } = useUser();
  const [saved, setSaved] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  useEffect(() => {
    if (!user) { setSaved(false); return; }
    try {
      const list: string[] = JSON.parse(localStorage.getItem('saved-stories') || '[]');
      setSaved(list.includes(slug));
    } catch { setSaved(false); }
  }, [user, slug]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) { setShowSignIn(true); return; }

    try {
      const list: string[] = JSON.parse(localStorage.getItem('saved-stories') || '[]');
      const next = saved ? list.filter(s => s !== slug) : [...list, slug];
      localStorage.setItem('saved-stories', JSON.stringify(next));
      setSaved(!saved);
    } catch {}
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label={saved ? 'Unsave story' : 'Save story'}
      >
        <Bookmark className={`w-4 h-4 transition-colors ${saved ? 'fill-blue-500 text-blue-500' : 'text-gray-400'}`} />
      </button>
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        defaultMode="signin"
      />
    </>
  );
}
