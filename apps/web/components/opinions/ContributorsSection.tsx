import Link from 'next/link';
import Image from 'next/image';

interface ContributorsSectionProps {
  contributors: {
    name: string;
    slug: string;
    avatar?: string | null;
    role?: string | null;
    company?: string | null;
    articleCount: number;
    authorType: string;
  }[];
}

export default function ContributorsSection({ contributors }: ContributorsSectionProps) {
  if (contributors.length === 0) return null;

  return (
    <section>
      <h2 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white mb-3 sm:mb-4">Contributors</h2>
      {/* Horizontal scroll on mobile, grid on larger screens */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-2 sm:overflow-visible sm:pb-0">
        {contributors.map((c) => {
          const authorSlug = c.authorType === 'founder' ? `founder-${c.slug}` : c.slug;
          const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2);
          return (
            <Link
              key={authorSlug}
              href={`/authors/${authorSlug}`}
              className="group shrink-0 w-[140px] sm:w-auto card p-3 flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 active:scale-[0.97] transition-transform duration-200"
            >
              {c.avatar ? (
                <Image src={c.avatar} alt={c.name} width={36} height={36} className="w-10 h-10 sm:w-9 sm:h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-brand font-bold text-xs font-sora shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 text-center sm:text-left">
                <span className="font-sora font-semibold text-[12px] sm:text-xs text-navy dark:text-white group-hover:text-brand transition-colors block truncate">
                  {c.name}
                </span>
                <span className="text-[10px] text-gray-400 font-jakarta">
                  {c.articleCount} {c.articleCount === 1 ? 'article' : 'articles'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
