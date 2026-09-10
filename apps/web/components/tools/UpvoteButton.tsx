'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useUser } from '../UserProvider';
import SignInModal from '@/components/auth/SignInModal';

interface UpvoteButtonProps {
  toolSlug: string;
  initialCount?: number;
  size?: 'sm' | 'md';
}

const THRESHOLD = 5; // Don't show count below this

export default function UpvoteButton({ toolSlug, initialCount = 0, size = 'sm' }: UpvoteButtonProps) {
  const { user } = useUser();
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  // Check initial upvote state
  useEffect(() => {
    fetch(`/api/tools/${toolSlug}/upvote`)
      .then(res => res.json())
      .then(data => {
        setUpvoted(data.upvoted || false);
        if (data.count !== undefined) setCount(data.count);
      })
      .catch(() => {});
  }, [toolSlug]);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setShowSignIn(true);
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const wasUpvoted = upvoted;
    setUpvoted(!wasUpvoted);
    setCount(prev => wasUpvoted ? Math.max(prev - 1, 0) : prev + 1);

    try {
      const res = await fetch(`/api/tools/${toolSlug}/upvote`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        // Revert optimistic update
        setUpvoted(wasUpvoted);
        setCount(prev => wasUpvoted ? prev + 1 : Math.max(prev - 1, 0));

        if (res.status === 401) {
          setShowSignIn(true);
        }
        return;
      }

      setUpvoted(data.upvoted);
      setCount(data.count);
    } catch {
      // Revert
      setUpvoted(wasUpvoted);
      setCount(prev => wasUpvoted ? prev + 1 : Math.max(prev - 1, 0));
    } finally {
      setLoading(false);
    }
  };

  const isSm = size === 'sm';

  if (!isSm) {
    return (
      <>
        <button
          onClick={handleUpvote}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            upvoted
              ? 'bg-brand/10 border border-brand/30 text-brand hover:bg-brand/20'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <ThumbsUp className={`w-4 h-4 ${upvoted ? 'fill-current' : ''}`} />
          <span>{upvoted ? 'Upvoted' : 'Upvote'}{count >= THRESHOLD ? ` (${count})` : ''}</span>
        </button>
        <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} defaultMode="signin" />
      </>
    );
  }

  return (
    <>
      <div className="relative group/upvote">
        <button
          onClick={handleUpvote}
          disabled={loading}
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border transition-all ${
            upvoted
              ? 'bg-brand/10 border-brand/30 text-brand'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand/30 hover:text-brand'
          } ${loading ? 'opacity-60' : ''}`}
        >
          <ThumbsUp className={`w-3 h-3 ${upvoted ? 'fill-current' : ''}`} />
          {count >= THRESHOLD && (
            <span className="font-bold text-xs">{count}</span>
          )}
        </button>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover/upvote:flex flex-col items-center z-dropdown">
          <div className="w-2.5 h-2.5 bg-black dark:bg-gray-800 rotate-45 -mb-1.5" />
          <div className="bg-black dark:bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg font-jakarta">
            {upvoted ? 'Upvoted' : 'Upvote'}
          </div>
        </div>
      </div>
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} defaultMode="signin" />
    </>
  );
}
