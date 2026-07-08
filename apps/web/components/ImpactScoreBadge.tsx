'use client';

import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface Breakdown {
  total: number;
  funding: { score: number; max: number };
  employees: { score: number; max: number };
  stage: { score: number; max: number };
  age: { score: number; max: number };
}

interface Props {
  score: number;
  breakdown: Breakdown;
}

const ProgressBar = ({ score, max }: { score: number; max: number }) => (
  <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
    <div
      className="h-full bg-brand rounded-full transition-all duration-500"
      style={{ width: `${Math.round((score / max) * 100)}%` }}
    />
  </div>
);

export default function ImpactScoreBadge({ score, breakdown }: Props) {
  const [open, setOpen] = useState(false);

  if (!score || score === 0) return null;

  return (
    <div className="mt-2 flex justify-end">
      <div className="inline-block">
        {/* Badge trigger */}
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-1.5 bg-brand/8 dark:bg-brand/15 border border-brand/25 rounded-lg px-2.5 py-1.5 hover:bg-brand/15 transition-colors group"
        >
          <TrendingUp className="w-3 h-3 text-brand" />
          <span className="text-xs font-sora font-bold text-brand">{score}/100</span>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-jakarta hidden sm:inline">Impact Score</span>
          {open ? (
            <ChevronUp className="w-3 h-3 text-brand" />
          ) : (
            <ChevronDown className="w-3 h-3 text-brand group-hover:translate-y-0.5 transition-transform" />
          )}
        </button>

        {/* Breakdown dropdown */}
        {open && (
          <div className="absolute mt-2 right-0 z-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 w-64">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-sora">Score Breakdown</span>
              <span className="text-lg font-extrabold text-brand font-sora">{score}<span className="text-xs text-gray-400">/100</span></span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Funding', ...breakdown.funding },
                { label: 'Team Size', ...breakdown.employees },
                { label: 'Stage', ...breakdown.stage },
                { label: 'Company Age', ...breakdown.age },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-jakarta w-24 shrink-0">{item.label}</span>
                  <ProgressBar score={item.score} max={item.max} />
                  <span className="text-[10px] font-bold text-brand w-9 text-right shrink-0">{item.score}/{item.max}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 font-jakarta mt-3 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-2">
              Calculated from funding raised, team size, funding stage, and company age.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
