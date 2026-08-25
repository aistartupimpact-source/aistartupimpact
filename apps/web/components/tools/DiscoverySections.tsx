import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';

interface ToolCard {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoUrl?: string;
  avgRating?: number;
  pricingModel?: string;
  categoryName?: string;
}

interface DiscoverySectionsProps {
  trending: ToolCard[];
  recentlyAdded: ToolCard[];
  editorPicks: ToolCard[];
  mostUpvoted: ToolCard[];
}

export default function DiscoverySections({ trending, recentlyAdded, editorPicks, mostUpvoted }: DiscoverySectionsProps) {
  const hasContent = trending.length > 0 || recentlyAdded.length > 0 || editorPicks.length > 0 || mostUpvoted.length > 0;
  if (!hasContent) return null;

  return (
    <div className="space-y-6 mb-8">
      {/* Trending */}
      {trending.length > 0 && (
        <Section title="Trending This Week" badge="Trending" badgeColor="text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400">
          {trending.map(tool => <MiniToolCard key={tool.id} tool={tool} />)}
        </Section>
      )}

      {/* Most Upvoted This Month */}
      {mostUpvoted.length > 0 && (
        <Section title="Most Upvoted This Month" badge="Popular" badgeColor="text-brand bg-brand/10 dark:bg-brand/20 dark:text-brand">
          {mostUpvoted.map(tool => <MiniToolCard key={tool.id} tool={tool} />)}
        </Section>
      )}

      {/* Recently Added */}
      {recentlyAdded.length > 0 && (
        <Section title="Recently Added" badge="New" badgeColor="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400">
          {recentlyAdded.map(tool => <MiniToolCard key={tool.id} tool={tool} />)}
        </Section>
      )}

      {/* Editor's Picks */}
      {editorPicks.length > 0 && (
        <Section title="Editor's Picks" badge="Pick" badgeColor="text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400">
          {editorPicks.map(tool => <MiniToolCard key={tool.id} tool={tool} />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, badge, badgeColor, children }: { title: string; badge: string; badgeColor: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-sora font-bold text-sm text-navy dark:text-white">{title}</h2>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>{badge}</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {children}
      </div>
    </div>
  );
}

function MiniToolCard({ tool }: { tool: ToolCard }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      prefetch={false}
      className="shrink-0 w-56 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
          {tool.logoUrl ? (
            <Image src={tool.logoUrl} alt={tool.name} className="w-6 h-6 object-contain" width={24} height={24} sizes="24px" />
          ) : (
            <span className="text-xs font-bold text-brand">{tool.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-navy dark:text-white group-hover:text-brand transition-colors truncate">{tool.name}</p>
          {tool.categoryName && <p className="text-xs text-gray-400 truncate">{tool.categoryName}</p>}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 font-jakarta">{tool.tagline}</p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-800">
        {tool.avgRating && parseFloat(String(tool.avgRating)) > 0 ? (
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{parseFloat(String(tool.avgRating)).toFixed(1)}</span>
          </div>
        ) : <span />}
        {tool.pricingModel && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 uppercase">{tool.pricingModel}</span>
        )}
      </div>
    </Link>
  );
}
