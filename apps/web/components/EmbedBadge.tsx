'use client';

import { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';

interface EmbedBadgeProps {
  urlSlug: string;
  type: 'tools' | 'startups' | 'news';
}

export default function EmbedBadge({ urlSlug, type }: EmbedBadgeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<a href="https://aistartupimpact.com/${type}/${urlSlug}" target="_blank" rel="noopener noreferrer">
  <img src="https://aistartupimpact.com/featured-badge.svg" alt="Featured on AIStartupImpact" width="220" height="60" />
</a>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="card p-5 border border-brand/20 bg-brand/[0.02]">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-brand" />
        <h4 className="font-sora font-bold text-sm text-navy dark:text-white">Are you the founder?</h4>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mb-4 leading-relaxed">
        Let the world know you're featured on AIStartupImpact! Copy the code below and place it on your website's footer or feature section.
      </p>

      {/* Badge Preview */}
      <div className="flex justify-center mb-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/featured-badge.svg"
          alt="Featured on AIStartupImpact"
          width={220}
          height={60}
          className="hover:scale-105 transition-transform duration-300"
        />
      </div>

      <div className="relative">
        <pre className="text-[10px] sm:text-xs bg-gray-900 text-gray-300 p-3 rounded-lg overflow-x-auto font-mono custom-scrollbar">
          <code>{embedCode}</code>
        </pre>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          aria-label="Copy embed code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}
