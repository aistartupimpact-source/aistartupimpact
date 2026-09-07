import { TrendingUp } from 'lucide-react';
import OpinionCard from './OpinionCard';

interface TrendingOpinionsProps {
  articles: any[];
}

export default function TrendingOpinions({ articles }: TrendingOpinionsProps) {
  if (articles.length < 5) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <TrendingUp className="w-4 h-4 text-brand" />
        <h2 className="font-sora font-bold text-base sm:text-lg text-navy dark:text-white">Trending</h2>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {articles.slice(0, 5).map((a, i) => (
          <OpinionCard key={a.slug} article={a} variant="numbered" rank={i + 1} />
        ))}
      </div>
    </section>
  );
}
