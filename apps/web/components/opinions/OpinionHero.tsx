import { MessageSquare } from 'lucide-react';

export default function OpinionHero() {
  return (
    <div className="mb-5 sm:mb-8">
      <div className="flex items-center gap-2.5 mb-1.5">
        <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 text-brand" />
        <h1 className="font-sora font-extrabold text-xl sm:text-2xl text-navy dark:text-white">
          Opinions & Analysis
        </h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-jakarta text-[13px] sm:text-sm max-w-2xl leading-relaxed">
        Independent perspectives on India&apos;s AI ecosystem — from funding and policy to open-source and edge AI.
      </p>
    </div>
  );
}
