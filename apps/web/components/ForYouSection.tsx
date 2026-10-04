'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Star, Briefcase, Rocket, Wrench } from 'lucide-react';

type Item = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  shortDescription?: string;
  tagline?: string;
  avgRating?: number;
  pricingModel?: string;
  entityType: 'tool' | 'startup' | 'job';
};

const TYPE_CONFIG = {
  tool: { label: 'Tool', icon: Wrench, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', href: (slug: string) => `/tools/${slug}` },
  startup: { label: 'Startup', icon: Rocket, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', href: (slug: string) => `/startups/${slug}` },
  job: { label: 'Job', icon: Briefcase, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', href: (slug: string) => `/jobs/${slug}` },
};

export default function ForYouSection() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/recommendations')
      .then(r => r.json())
      .then(data => {
        if (data.items?.length > 0) setItems(data.items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && items.length === 0) return null;
  if (loading) return null;

  return (
    <section className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">For You</h2>
          </div>
          <Link href="/settings/preferences" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Customize <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map(item => {
            const config = TYPE_CONFIG[item.entityType] || TYPE_CONFIG.tool;
            const Icon = config.icon;
            return (
              <Link
                key={`${item.entityType}-${item.id}`}
                href={config.href(item.slug)}
                className="group flex gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all"
              >
                <div className="shrink-0">
                  {item.logoUrl ? (
                    <Image
                      src={item.logoUrl}
                      alt={item.name}
                      width={40}
                      height={40}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.shortDescription || item.tagline || ''}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${config.color}`}>
                      {config.label}
                    </span>
                    {item.avgRating && item.avgRating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {Number(item.avgRating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
