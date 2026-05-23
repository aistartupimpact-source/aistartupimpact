import Link from 'next/link';
import { Star, Zap } from 'lucide-react';

interface SimilarTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string | null;
  avgRating: string | null;
  pricingModel: string;
  websiteUrl: string;
  categoryName: string;
}

interface SimilarToolsProps {
  tools: SimilarTool[];
  categoryName: string;
  categorySlug?: string;
}

export default function SimilarTools({ tools, categoryName, categorySlug }: SimilarToolsProps) {
  if (!tools.length) return null;

  return (
    <div className="card p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-sora font-bold text-sm text-navy dark:text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-brand" />
          More {categoryName} Tools
        </h4>
        {categorySlug && (
          <Link
            href={`/tools?category=${categorySlug}`}
            className="text-[11px] font-semibold text-brand hover:underline font-jakarta"
          >
            View all
          </Link>
        )}
      </div>

      {/* Tool list */}
      <div className="space-y-1">
        {tools.map((tool) => {
          const logo = tool.logoUrl ||
            `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${tool.websiteUrl}&size=64`;
          const rating = tool.avgRating ? parseFloat(tool.avgRating) : null;

          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="flex items-center gap-3 group p-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
            >
              {/* Logo */}
              <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo}
                  alt={tool.name}
                  className="w-7 h-7 object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors truncate">
                    {tool.name}
                  </span>
                  {rating && rating > 0 && (
                    <span className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400">
                        {rating.toFixed(1)}
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-jakarta truncate mt-0.5">
                  {tool.tagline}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
        <Link
          href={categorySlug ? `/tools?category=${categorySlug}` : '/tools'}
          className="text-xs font-semibold text-brand hover:underline font-jakarta"
        >
          Explore all {categoryName} tools →
        </Link>
      </div>
    </div>
  );
}
