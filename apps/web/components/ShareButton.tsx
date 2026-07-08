'use client';

import { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  iconOnly?: boolean;
}

export default function ShareButton({ title, text, url, iconOnly = false }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const shareData = { title, text: text || title, url: shareUrl };

    // Try native Web Share API (mobile, modern browsers)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or error — fall through to copy
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', shareUrl);
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleShare}
        title={copied ? 'Copied!' : 'Share'}
        className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm hover:border-brand hover:text-brand dark:hover:border-brand dark:hover:text-brand transition-colors text-gray-600 dark:text-gray-300"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      title="Share this startup"
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:border-brand hover:text-brand dark:hover:border-brand dark:hover:text-brand transition-all text-sm font-semibold font-jakarta shadow-sm hover:shadow-md"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}
