'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

interface AgreeDisagreeActionsProps {
  slug: string;
  initialAgree: number;
  initialDisagree: number;
}

export default function AgreeDisagreeActions({ slug, initialAgree, initialDisagree }: AgreeDisagreeActionsProps) {
  const [agreeCount, setAgreeCount] = useState(initialAgree);
  const [disagreeCount, setDisagreeCount] = useState(initialDisagree);
  const [voted, setVoted] = useState<'agree' | 'disagree' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`opinion-vote:${slug}`);
    if (stored === 'agree' || stored === 'disagree') {
      setVoted(stored);
    }
  }, [slug]);

  const total = agreeCount + disagreeCount;
  const agreePercent = total > 0 ? Math.round((agreeCount / total) * 100) : 50;
  const disagreePercent = total > 0 ? 100 - agreePercent : 50;

  async function handleVote(action: 'agree' | 'disagree') {
    if (voted || loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/articles/${slug}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (res.ok) {
        const data = await res.json();
        setAgreeCount(data.agreeCount);
        setDisagreeCount(data.disagreeCount);
        setVoted(action);
        localStorage.setItem(`opinion-vote:${slug}`, action);
      } else if (res.status === 429) {
        setVoted(action);
        localStorage.setItem(`opinion-vote:${slug}`, action);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="my-8">
      <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-3">Reader response</h3>
      <div className="flex gap-3 mb-3">
        <button
          onClick={() => handleVote('agree')}
          disabled={!!voted || loading}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold font-jakarta transition-all ${
            voted === 'agree'
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ring-2 ring-green-500/30'
              : voted
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-default'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Agree
        </button>
        <button
          onClick={() => handleVote('disagree')}
          disabled={!!voted || loading}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold font-jakarta transition-all ${
            voted === 'disagree'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 ring-2 ring-red-500/30'
              : voted
              ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-default'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          Disagree
        </button>
      </div>
      {total > 0 && (
        <div>
          <div className="flex rounded-full overflow-hidden h-2 mb-2">
            <div className="bg-green-500 transition-all" style={{ width: `${agreePercent}%` }} />
            <div className="bg-red-400 transition-all" style={{ width: `${disagreePercent}%` }} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta text-center">
            {agreePercent}% Agree · {disagreePercent}% Disagree · {total} {total === 1 ? 'response' : 'responses'}
          </p>
        </div>
      )}
    </div>
  );
}
