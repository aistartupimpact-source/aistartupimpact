'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { clsx } from 'clsx';

const CATEGORIES = [
  { value: 'all', label: 'All Roles' },
  { value: 'AI_ENGINEER', label: 'AI Engineer' },
  { value: 'ML_ENGINEER', label: 'ML Engineer' },
  { value: 'LLM_ENGINEER', label: 'LLM Engineer' },
  { value: 'DATA_SCIENTIST', label: 'Data Scientist' },
  { value: 'AI_PRODUCT_MANAGER', label: 'Product Manager' },
  { value: 'PROMPT_ENGINEER', label: 'Prompt Engineer' },
  { value: 'AI_RESEARCH_SCIENTIST', label: 'Research' },
  { value: 'NLP_ENGINEER', label: 'NLP' },
  { value: 'COMPUTER_VISION', label: 'Computer Vision' },
  { value: 'AI_INFRASTRUCTURE', label: 'Infrastructure' },
];

const WORK_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

interface JobFiltersProps {
  currentCategory?: string;
  currentWorkType?: string;
  currentCountry?: string;
  currentVisa?: string;
}

export default function JobFilters({ currentCategory, currentWorkType, currentCountry, currentVisa }: JobFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-3">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter('category', cat.value)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-semibold font-jakarta transition-colors',
              (currentCategory || 'all') === cat.value
                ? 'bg-brand text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Work type + visa filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {WORK_TYPES.map((wt) => (
            <button
              key={wt.value}
              onClick={() => setFilter('workType', wt.value)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-semibold font-jakarta border transition-colors',
                (currentWorkType || 'all') === wt.value
                  ? 'bg-navy text-white border-navy dark:bg-white dark:text-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400'
              )}
            >
              {wt.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-jakarta text-gray-500">
          <input
            type="checkbox"
            checked={currentVisa === 'true'}
            onChange={(e) => setFilter('visa', e.target.checked ? 'true' : '')}
            className="rounded border-gray-300 text-brand"
          />
          Visa Sponsorship
        </label>
      </div>
    </div>
  );
}
