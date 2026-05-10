'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Building2, Wrench, ExternalLink, Star, MapPin } from 'lucide-react';
import BookmarkButton from '../BookmarkButton';

interface SavedTool {
  savedId: string;
  savedAt: string;
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string | null;
  pricingModel: string;
  avgRating: number;
  reviewCount: number;
}

interface SavedStartup {
  savedId: string;
  savedAt: string;
  id: string;
  name: string;
  slug: string;
  tagline: string;
  logoUrl: string | null;
  stage: string;
  headquartersCity: string | null;
  isVerified: boolean;
}

export default function SavedItems() {
  const [activeTab, setActiveTab] = useState<'tools' | 'startups'>('tools');
  const [tools, setTools] = useState<SavedTool[]>([]);
  const [startups, setStartups] = useState<SavedStartup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    setLoading(true);
    try {
      const [toolsRes, startupsRes] = await Promise.all([
        fetch('/api/bookmarks/tools'),
        fetch('/api/bookmarks/startups'),
      ]);

      if (toolsRes.ok) {
        const toolsData = await toolsRes.json();
        setTools(toolsData.tools || []);
      }

      if (startupsRes.ok) {
        const startupsData = await startupsRes.json();
        setStartups(startupsData.startups || []);
      }
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (type: 'tool' | 'startup', id: string) => {
    if (type === 'tool') {
      setTools(tools.filter(t => t.id !== id));
    } else {
      setStartups(startups.filter(s => s.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      </div>
    );
  }

  return (
    <div id="saved" className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Bookmark className="w-6 h-6 text-brand" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Saved Items
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tools')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'tools'
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Tools ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('startups')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              activeTab === 'startups'
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Startups ({startups.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {activeTab === 'tools' && (
          <>
            {tools.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No saved tools yet
                </p>
                <Link
                  href="/tools"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  Browse Tools
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => (
                  <div
                    key={tool.savedId}
                    className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <Link href={`/tools/${tool.slug}`} className="shrink-0">
                        {tool.logoUrl ? (
                          <img
                            src={tool.logoUrl}
                            alt={tool.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                            <Wrench className="w-6 h-6 text-brand" />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/tools/${tool.slug}`}
                          className="font-bold text-gray-900 dark:text-white hover:text-brand transition-colors line-clamp-1"
                        >
                          {tool.name}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {tool.tagline}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {tool.avgRating > 0 && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{tool.avgRating.toFixed(1)}</span>
                            </div>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {tool.pricingModel}
                          </span>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <BookmarkButton
                          type="tool"
                          itemId={tool.id}
                          itemName={tool.name}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'startups' && (
          <>
            {startups.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No saved startups yet
                </p>
                <Link
                  href="/startups"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
                >
                  Browse Startups
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {startups.map((startup) => (
                  <div
                    key={startup.savedId}
                    className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <Link href={`/startups/${startup.slug}`} className="shrink-0">
                        {startup.logoUrl ? (
                          <img
                            src={startup.logoUrl}
                            alt={startup.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-brand/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-brand" />
                          </div>
                        )}
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/startups/${startup.slug}`}
                          className="font-bold text-gray-900 dark:text-white hover:text-brand transition-colors line-clamp-1"
                        >
                          {startup.name}
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                          {startup.tagline}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            {startup.stage}
                          </span>
                          {startup.headquartersCity && (
                            <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                              <MapPin className="w-3 h-3" />
                              <span>{startup.headquartersCity}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <BookmarkButton
                          type="startup"
                          itemId={startup.id}
                          itemName={startup.name}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
