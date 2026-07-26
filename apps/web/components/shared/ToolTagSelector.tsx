'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface TagItem {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  groupId: string;
  sortOrder: number;
  isActive: boolean;
  tagCount: number;
}

interface TagGroupItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  sortOrder: number;
  displayMode: string;
  maxVisibleDefault: number;
  isAdminOnly: boolean;
  isActive: boolean;
  tags: TagItem[];
}

interface ToolTagSelectorProps {
  groups: TagGroupItem[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  maxTags?: number;
}

export default function ToolTagSelector({
  groups,
  selectedTagIds,
  onChange,
  maxTags = 30,
}: ToolTagSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only show active, non-admin groups
  const visibleGroups = useMemo(() => {
    return groups.filter(g => g.isActive && !g.isAdminOnly);
  }, [groups]);

  // All tags flat
  const allTags = useMemo(() => visibleGroups.flatMap(g => g.tags), [visibleGroups]);

  // Selected tag objects
  const selectedTags = useMemo(() => {
    return selectedTagIds.map(id => allTags.find(t => t.id === id)).filter(Boolean) as TagItem[];
  }, [selectedTagIds, allTags]);

  // Filtered results
  const filteredGroups = useMemo(() => {
    if (!query) return visibleGroups;
    const q = query.toLowerCase();
    return visibleGroups
      .map(g => ({
        ...g,
        tags: g.tags.filter(t => t.isActive && t.name.toLowerCase().includes(q) && !selectedTagIds.includes(t.id)),
      }))
      .filter(g => g.tags.length > 0);
  }, [visibleGroups, query, selectedTagIds]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addTag = (tagId: string) => {
    if (selectedTagIds.length >= maxTags) return;
    if (!selectedTagIds.includes(tagId)) {
      onChange([...selectedTagIds, tagId]);
    }
    setQuery('');
    inputRef.current?.focus();
  };

  const removeTag = (tagId: string) => {
    onChange(selectedTagIds.filter(id => id !== tagId));
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Tags <span className="text-gray-400 font-normal text-xs">({selectedTagIds.length}/{maxTags})</span>
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Add tags to help users discover your tool. Search or browse by category.
      </p>

      {/* Input area with chips */}
      <div
        className={`flex flex-wrap items-center gap-1.5 min-h-[42px] px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 transition-colors cursor-text ${
          isOpen
            ? 'border-brand ring-2 ring-brand/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        }`}
        onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
      >
        {/* Selected chips */}
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[11px] text-gray-700 dark:text-gray-300 font-medium"
          >
            {tag.name}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeTag(tag.id); }}
              className="text-gray-400 hover:text-red-500 ml-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? 'Search and add tags...' : 'Add more...'}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
        />

        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-[280px] overflow-y-auto">
          {filteredGroups.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              {query ? 'No tags match your search' : 'All tags selected'}
            </div>
          ) : (
            filteredGroups.map(group => {
              const unselectedTags = group.tags.filter(t => t.isActive && !selectedTagIds.includes(t.id));
              if (unselectedTags.length === 0) return null;

              return (
                <div key={group.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div className="px-3 py-1.5 bg-gray-50 dark:bg-gray-800/50 sticky top-0">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group.name}
                    </span>
                  </div>
                  <div className="px-2 py-1.5 flex flex-wrap gap-1">
                    {unselectedTags.slice(0, query ? 20 : 10).map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => addTag(tag.id)}
                        disabled={selectedTagIds.length >= maxTags}
                        className="px-2 py-1 rounded text-[11px] text-gray-600 dark:text-gray-400 hover:bg-brand/5 hover:text-brand border border-transparent hover:border-brand/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {tag.name}
                      </button>
                    ))}
                    {unselectedTags.length > (query ? 20 : 10) && (
                      <span className="text-[10px] text-gray-400 self-center px-2">
                        +{unselectedTags.length - (query ? 20 : 10)} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
