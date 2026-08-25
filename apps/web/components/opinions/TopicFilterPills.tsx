'use client';

import { useRouter } from 'next/navigation';

interface TopicFilterPillsProps {
  tags: { name: string; slug: string; articleCount: number }[];
  activeSlug?: string;
  basePath?: string;
}

export default function TopicFilterPills({ tags, activeSlug, basePath = '/opinions' }: TopicFilterPillsProps) {
  const router = useRouter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -webkit-overflow-scrolling-touch">
      <button
        onClick={() => router.push(basePath)}
        className={`shrink-0 px-4 py-2 sm:px-3.5 sm:py-1.5 rounded-full text-[13px] sm:text-xs font-semibold font-jakarta transition-colors min-h-[36px] sm:min-h-0 active:scale-95 ${
          !activeSlug
            ? 'bg-brand text-white shadow-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag.slug}
          onClick={() => router.push(`${basePath}/topic/${tag.slug}`)}
          className={`shrink-0 px-4 py-2 sm:px-3.5 sm:py-1.5 rounded-full text-[13px] sm:text-xs font-semibold font-jakarta transition-colors min-h-[36px] sm:min-h-0 active:scale-95 ${
            activeSlug === tag.slug
              ? 'bg-brand text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          {tag.name}
          <span className="ml-1 opacity-60">{tag.articleCount}</span>
        </button>
      ))}
    </div>
  );
}
