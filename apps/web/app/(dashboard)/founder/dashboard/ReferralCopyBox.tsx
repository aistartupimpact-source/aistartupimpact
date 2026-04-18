'use client';

import { Link as LinkIcon } from 'lucide-react';

export function ReferralCopyBox({ code }: { code: string }) {
  return (
    <div
      className="bg-black/30 border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-copy active:scale-95 transition-transform"
      onClick={() => navigator.clipboard.writeText(code)}
    >
      <span className="font-mono text-sm tracking-widest">{code}</span>
      <LinkIcon className="w-4 h-4 text-indigo-300" />
    </div>
  );
}
