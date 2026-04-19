'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Zap, ArrowRight, CheckSquare, Square, X, BarChart } from 'lucide-react';

interface ToolPick {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  rating: number;
  pricing: string;
  verdict: string;
  logoUrl?: string;
}

export default function ToolsListWithComparison({ picks }: { picks: ToolPick[] }) {
  const [selectedTools, setSelectedTools] = useState<ToolPick[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const toggleTool = (tool: ToolPick, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to the link
    if (selectedTools.find((t) => t.slug === tool.slug)) {
      setSelectedTools(selectedTools.filter((t) => t.slug !== tool.slug));
    } else {
      if (selectedTools.length < 3) {
        setSelectedTools([...selectedTools, tool]);
      } else {
        alert("You can only compare up to 3 tools at a time.");
      }
    }
  };

  const removeTool = (slug: string) => {
    setSelectedTools(selectedTools.filter((t) => t.slug !== slug));
    if (selectedTools.length <= 1) setShowComparison(false);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {picks.map((tool, i) => {
          const isSelected = !!selectedTools.find((t) => t.slug === tool.slug);
          const iconUrl = tool.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=random&color=fff&size=150`;

          return (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} className={`group block rounded-2xl transition-all h-full ${isSelected ? 'ring-2 ring-brand ring-offset-2 dark:ring-offset-gray-950' : 'hover:shadow-xl hover:shadow-brand/5'}`}>
              <div className="card p-5 sm:p-6 flex flex-col gap-4 relative h-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                {/* Compare Checkbox */}
                <button
                  onClick={(e) => toggleTool(tool, e)}
                  className={`absolute top-4 right-4 transition-colors z-10 ${isSelected ? 'text-brand' : 'text-gray-300 hover:text-brand'}`}
                  title="Select for comparison"
                >
                  {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>

                {/* Header: Logo + Rank */}
                <div className="flex items-center gap-3 pr-8">
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={iconUrl} alt={tool.name} className="w-10 h-10 object-contain" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-jakarta font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rank #{i + 1}</span>
                    <h2 className="font-sora font-extrabold text-base sm:text-lg text-navy dark:text-white group-hover:text-brand transition-colors line-clamp-1">
                      {tool.name}
                    </h2>
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-jakarta line-clamp-2 min-h-[40px] mb-3">
                    {tool.tagline}
                  </p>

                  {/* Verdict */}
                  <div className="relative bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg border border-gray-100 dark:border-gray-800 mb-4 flex-1">
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-jakarta italic leading-relaxed line-clamp-4 relative z-10">
                      &ldquo;{tool.verdict}&rdquo;
                    </p>
                  </div>

                  {/* Footer Tags */}
                  <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-y-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{tool.rating}</span>
                      </div>
                      <span className="text-gray-300 dark:text-gray-700">•</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate max-w-[90px]">{tool.category}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${tool.pricing === 'Free' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : tool.pricing === 'Freemium' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                      {tool.pricing}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Persistent Comparison Footer Bar */}
      {selectedTools.length > 0 && !showComparison && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 z-50 animate-fade-in-up border border-indigo-500/30">
          <div className="flex -space-x-2">
            <div className="font-sora font-bold font-sm mr-4 flex items-center gap-2"><BarChart className="w-4 h-4 text-brand" /> {selectedTools.length}/3 Selected</div>
          </div>
          <button
            onClick={() => setShowComparison(true)}
            disabled={selectedTools.length < 2}
            className="bg-brand text-white text-sm font-bold px-4 py-2 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
          >
            {selectedTools.length < 2 ? 'Select one more to compare' : 'Compare Now'}
          </button>
          <button onClick={() => setSelectedTools([])} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Comparison Modal Overlay */}
      {showComparison && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h2 className="font-sora font-extrabold text-xl sm:text-2xl flex items-center gap-2"><BarChart className="text-brand" /> Tool Comparison</h2>
              <button onClick={() => setShowComparison(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 sm:p-8 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 min-w-[600px] md:min-w-0">

                {/* Labels Column */}
                <div className="hidden md:flex flex-col gap-y-4 pt-[140px] text-sm font-jakarta font-bold text-gray-500 text-right pr-4 border-r border-gray-100 dark:border-gray-800">
                  <div className="h-10 flex items-center justify-end">Category</div>
                  <div className="h-10 flex items-center justify-end">Pricing</div>
                  <div className="h-10 flex items-center justify-end">Rating</div>
                  <div className="flex-1 flex items-start justify-end mt-2">Verdict</div>
                </div>

                {/* Tool Columns */}
                {selectedTools.map((t) => (
                  <div key={t.slug} className="flex flex-col gap-4 relative">
                    <button onClick={() => removeTool(t.slug)} className="absolute top-0 right-0 p-1.5 bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"><X className="w-3 h-3" /></button>

                    <div className="h-[120px] flex flex-col justify-end pb-4 border-b border-gray-100 dark:border-gray-800">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden mb-3 border border-gray-100 dark:border-gray-700/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=random&color=fff&size=150`} alt={t.name} className="w-full h-full object-cover" />
                      </div>
                      <h3 className="font-sora font-extrabold text-lg leading-tight">{t.name}</h3>
                    </div>

                    <div className="h-10 flex items-center md:justify-start justify-between font-jakarta text-sm">
                      <span className="md:hidden text-gray-400 text-xs uppercase tracking-wider font-bold">Category</span>
                      {t.category}
                    </div>
                    <div className="h-10 flex items-center md:justify-start justify-between font-jakarta text-sm">
                      <span className="md:hidden text-gray-400 text-xs uppercase tracking-wider font-bold">Pricing</span>
                      <span className="font-mono bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 min-w-16 py-1 text-center rounded">{t.pricing}</span>
                    </div>
                    <div className="h-10 flex items-center md:justify-start justify-between font-jakarta text-sm">
                      <span className="md:hidden text-gray-400 text-xs uppercase tracking-wider font-bold">Rating</span>
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> {t.rating}</div>
                    </div>
                    <div className="flex-1 font-jakarta text-sm text-gray-600 dark:text-gray-400 leading-relaxed mt-2 pt-4 border-t border-gray-100 dark:border-gray-800 border-dashed">
                      {t.verdict}
                    </div>

                    <Link href={`/tools/${t.slug}`} className="mt-4 w-full bg-gray-900 hover:bg-brand text-white py-2 rounded-lg text-center font-bold font-jakarta transition-colors text-sm">
                      Full Review
                    </Link>
                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
