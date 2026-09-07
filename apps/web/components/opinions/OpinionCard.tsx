import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';

type Variant = 'featured' | 'compact' | 'numbered';

interface OpinionCardProps {
  article: {
    slug: string;
    title: string;
    excerpt?: string | null;
    coverImage?: string | null;
    readTimeMinutes?: number | null;
    publishedAt?: string | null;
    agreeCount?: number;
    disagreeCount?: number;
    author?: { name: string; slug: string; avatar?: string | null };
    primaryTag?: { name: string; slug: string } | null;
    trendingScore?: number;
  };
  variant?: Variant;
  rank?: number;
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function OpinionCard({ article, variant = 'compact', rank }: OpinionCardProps) {
  if (variant === 'numbered') {
    return (
      <Link href={`/opinions/${article.slug}`} className="group flex gap-3 items-start py-1 active:opacity-70 transition-opacity">
        <span className="font-sora font-extrabold text-2xl sm:text-3xl text-gray-200 dark:text-gray-700 leading-none shrink-0 w-7 sm:w-8 text-right tabular-nums">
          {rank ?? ''}
        </span>
        <div className="min-w-0 flex-1">
          {article.primaryTag && (
            <span className="text-[11px] font-semibold text-brand/80 uppercase tracking-wider font-jakarta">
              {article.primaryTag.name}
            </span>
          )}
          <h3 className="font-sora font-bold text-[14px] sm:text-sm leading-snug text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-2 mt-0.5">
            {article.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] sm:text-xs text-gray-400 font-jakarta">
            {article.author?.name && <span>{article.author.name}</span>}
            {article.readTimeMinutes && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{article.readTimeMinutes}m</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/opinions/${article.slug}`} className="group block">
        <div className="card overflow-hidden h-full active:scale-[0.98] transition-transform duration-200">
          {article.coverImage && (
            <div className="relative aspect-[16/9]">
              <Image src={article.coverImage} alt={article.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
          )}
          <div className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-brand text-[11px]">Opinion</span>
              {article.primaryTag && (
                <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-jakarta">
                  {article.primaryTag.name}
                </span>
              )}
            </div>
            <h2 className="font-sora font-bold text-[15px] sm:text-lg leading-snug text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-3">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-gray-500 dark:text-gray-400 text-[13px] sm:text-sm font-jakarta mt-1.5 line-clamp-2">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-1.5 mt-2.5 text-[11px] sm:text-xs text-gray-400 font-jakarta">
              {article.author?.name && <span className="font-medium text-gray-500 dark:text-gray-400">{article.author.name}</span>}
              {article.publishedAt && (
                <>
                  <span>·</span>
                  <span>{formatDate(article.publishedAt)}</span>
                </>
              )}
              {article.readTimeMinutes && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{article.readTimeMinutes} min</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // compact (default)
  return (
    <Link href={`/opinions/${article.slug}`} className="group block">
      <div className="card p-4 sm:p-5 active:scale-[0.98] transition-transform duration-200">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-category text-[11px]">Opinion</span>
          {article.primaryTag && (
            <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider font-jakarta">
              {article.primaryTag.name}
            </span>
          )}
        </div>
        <h2 className="font-sora font-bold text-[15px] sm:text-base text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-gray-500 dark:text-gray-400 text-[13px] sm:text-sm font-jakarta mt-1.5 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2 text-[11px] sm:text-xs text-gray-400 font-jakarta">
          {article.author?.name && <span className="font-medium text-gray-500 dark:text-gray-400">{article.author.name}</span>}
          {article.publishedAt && (
            <>
              <span>·</span>
              <span>{formatDate(article.publishedAt)}</span>
            </>
          )}
          {article.readTimeMinutes && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{article.readTimeMinutes} min</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
