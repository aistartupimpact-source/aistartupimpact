'use client';

import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url?: string;
}

export default function ShareButton({ title, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  async function handleShare() {
    const shareData = { title, url: shareUrl };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or not supported — fall through to clipboard
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // last resort: prompt
      window.prompt('Copy this link:', shareUrl);
    }
  }

  return (
    <button
      onClick={handleShare}
      title={copied ? 'Link copied!' : 'Share this article'}
      className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
    >
      {copied ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Share2 className="w-4 h-4 text-gray-400" />
      )}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}
