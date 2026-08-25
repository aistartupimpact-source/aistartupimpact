import OpinionCard from './OpinionCard';

interface FeaturedOpinionsProps {
  articles: any[];
}

export default function FeaturedOpinions({ articles }: FeaturedOpinionsProps) {
  if (!articles.length) return null;

  return (
    <section className="mb-10">
      <h2 className="section-title mb-4">Featured</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((a) => (
          <OpinionCard key={a.slug} article={a} variant="featured" />
        ))}
      </div>
    </section>
  );
}
