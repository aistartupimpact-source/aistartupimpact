'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Loader2 } from 'lucide-react';

const PAGE_SIZE = 8;

interface Article {
  slug: string;
  title: string;
  excerpt?: string;
  thumbnailImage?: string;
  coverImage?: string;
  author?: { name?: string };
  category?: { name?: string };
  publishedAt?: string;
  readTimeMinutes?: number;
}

function formatDate(d: string) {
  return d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
}

export default function ArticlesListClient({ articles }: { articles: Article[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  function loadMore() {
    setLoading(true);
    setTimeout(() => {
      setVisible((v) => v + PAGE_SIZE);
      setLoading(false);
    }, 400);
  }

  const shown = articles.slice(0, visible);
  const hasMore = visible < articles.length;

  return (
    <div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
        {shown.map((article, idx) => (
          <Link key={article.slug} href={`/news/${article.slug}`} className="group block">
            <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 relative">
              {/* Left accent bar on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

              {/* Thumbnail */}
              <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-brand/10 to-gray-100 dark:from-brand/20 dark:to-gray-800 relative">
                {(article.thumbnailImage || article.coverImage) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.thumbnailImage || article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-brand/30 font-sora select-none">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
                <div>
                  {/* Category + read time */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand">
                      {article.category?.name || 'News'}
                    </span>
                    {article.readTimeMinutes && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">·</span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-jakarta">
                          <Clock className="w-2.5 h-2.5" />
                          {article.readTimeMinutes} min read
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-sora font-bold text-sm sm:text-[15px] text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt — desktop only */}
                  {article.excerpt && (
                    <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1 line-clamp-1 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                {/* Author + date + arrow */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 font-jakarta">
                    {article.author?.name && (
                      <>
                        <div className="w-4 h-4 rounded-full bg-brand/10 flex items-center justify-center text-[8px] font-bold text-brand shrink-0">
                          {article.author.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-500 dark:text-gray-400">
                          {article.author.name}
                        </span>
                        {article.publishedAt && (
                          <>
                            <span className="text-gray-300 dark:text-gray-600">·</span>
                            <span>{formatDate(article.publishedAt)}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-brand opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-brand hover:text-brand text-sm font-semibold text-gray-600 dark:text-gray-300 font-jakarta transition-all duration-200 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Load More Articles
                <span className="text-xs text-gray-400 font-normal">
                  ({articles.length - visible} remaining)
                </span>
              </>
            )}
          </button>
        </div>
      )}

      {!hasMore && articles.length > PAGE_SIZE && (
        <p className="text-center text-xs text-gray-400 font-jakarta mt-6">
          All {articles.length} articles loaded
        </p>
      )}
    </div>
  );
}
