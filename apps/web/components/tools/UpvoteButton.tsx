'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp } from 'lucide-react';

interface UpvoteButtonProps {
  toolSlug: string;
  initialCount?: number;
  size?: 'sm' | 'md';
}

const THRESHOLD = 5; // Don't show count below this

export default function UpvoteButton({ toolSlug, initialCount = 0, size = 'sm' }: UpvoteButtonProps) {
  const [upvoted, setUpvoted] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

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
          // Could trigger sign-in modal here
          alert('Please sign in to upvote');
        } else {
          alert(data.error || 'Could not process upvote');
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

  return (
    <button
      onClick={handleUpvote}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-lg border transition-all ${
        upvoted
          ? 'bg-brand/10 border-brand/30 text-brand'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-brand/30 hover:text-brand'
      } ${isSm ? 'px-2 py-1' : 'px-3 py-1.5'} ${loading ? 'opacity-60' : ''}`}
      title={upvoted ? 'Remove upvote' : 'Upvote this tool'}
    >
      <ThumbsUp className={`${isSm ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${upvoted ? 'fill-current' : ''}`} />
      {count >= THRESHOLD && (
        <span className={`font-bold ${isSm ? 'text-[10px]' : 'text-xs'}`}>{count}</span>
      )}
    </button>
  );
}
