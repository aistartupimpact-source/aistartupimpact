'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, ArrowRight, Search, X, ChevronDown } from 'lucide-react';

const PAGE_SIZE = 12;

interface Story {
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
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
}

export default function StoriesListClient({ stories }: { stories: Story[] }) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    stories.forEach(s => {
      const cat = s.category?.name || 'General';
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    return Array.from(catMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [stories]);

  // Filter stories
  const filteredStories = useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = searchQuery === '' ||
        story.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (story.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());

      const storyCat = story.category?.name || 'General';
      const matchesCategory = selectedCategory === 'all' || storyCat === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stories, searchQuery, selectedCategory]);

  const shown = filteredStories.slice(0, visible);
  const hasMore = visible < filteredStories.length;

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setVisible(PAGE_SIZE);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisible(PAGE_SIZE);
  };

  return (
    <div className="space-y-5">
      {/* ── Sticky Category Pills ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <button
            onClick={() => handleCategoryChange('all')}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold font-jakarta transition-all ${
              selectedCategory === 'all'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({stories.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleCategoryChange(cat.name)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-bold font-jakarta transition-all ${
                selectedCategory === cat.name
                  ? 'bg-brand text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      </div>

      {/* ── Search + Results ── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search stories by title or topic..."
            className="w-full pl-11 pr-10 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-sm font-jakarta"
          />
          {searchQuery && (
            <button onClick={() => handleSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400 font-jakarta">
            {filteredStories.length} stories
          </span>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setVisible(PAGE_SIZE); }}
              className="text-xs text-brand font-semibold hover:underline font-jakarta"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* ── Story List ── */}
      {shown.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 font-jakarta text-sm mb-2">No stories found matching your criteria.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="text-sm text-brand font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          {shown.map((story, idx) => (
            <Link key={story.slug} href={`/stories/${story.slug}`} className="group block">
              <div className="flex gap-4 sm:gap-5 p-4 sm:p-5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200 relative">
                {/* Left accent on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-top" />

                {/* Thumbnail */}
                <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-brand/10 to-gray-100 dark:from-brand/20 dark:to-gray-800 relative">
                  {(story.thumbnailImage || story.coverImage) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={story.thumbnailImage || story.coverImage}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-brand/30 font-sora">
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
                        {story.category?.name || 'Founder Story'}
                      </span>
                      {story.readTimeMinutes && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">·</span>
                          <span className="flex items-center gap-1 text-[10px] text-gray-400 font-jakarta">
                            <Clock className="w-2.5 h-2.5" />
                            {story.readTimeMinutes} min read
                          </span>
                        </>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-sora font-bold text-sm sm:text-[15px] text-navy dark:text-white group-hover:text-brand transition-colors leading-snug line-clamp-2">
                      {story.title}
                    </h3>

                    {/* Excerpt */}
                    {story.excerpt && (
                      <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1 line-clamp-1 leading-relaxed">
                        {story.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Author + date + arrow */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-jakarta">
                      {story.author?.name && (
                        <>
                          <div className="w-4 h-4 rounded-full bg-brand/10 flex items-center justify-center text-[8px] font-bold text-brand shrink-0">
                            {story.author.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-500 dark:text-gray-400">{story.author.name}</span>
                          {story.publishedAt && (
                            <>
                              <span className="text-gray-300 dark:text-gray-600">·</span>
                              <span>{formatDate(story.publishedAt)}</span>
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
      )}

      {/* ── Load More ── */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisible(v => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold font-jakarta text-gray-700 dark:text-gray-300 hover:border-brand hover:text-brand transition-colors shadow-sm"
          >
            <ChevronDown className="w-4 h-4" />
            Load more stories ({filteredStories.length - visible} remaining)
          </button>
        </div>
      )}

      {!hasMore && filteredStories.length > PAGE_SIZE && (
        <p className="text-center text-xs text-gray-400 font-jakarta mt-6">
          All {filteredStories.length} stories loaded
        </p>
      )}
    </div>
  );
}
