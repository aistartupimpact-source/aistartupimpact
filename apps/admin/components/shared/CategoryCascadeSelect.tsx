'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parentName?: string | null;
  parentSlug?: string | null;
  parentIcon?: string | null;
}

interface CategoryCascadeSelectProps {
  categories: Category[];
  value: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
  className?: string;
}

/**
 * Cascading category select: Parent dropdown → Subcategory dropdown.
 * Accepts the flat list of subcategories with parentName/parentSlug info.
 */
export default function CategoryCascadeSelect({
  categories,
  value,
  onChange,
  required = false,
  className = '',
}: CategoryCascadeSelectProps) {
  // Group categories by parent
  const parentGroups = useMemo(() => {
    const groups: Record<string, { name: string; icon: string | null; slug: string; subcategories: Category[] }> = {};
    for (const cat of categories) {
      const parentKey = cat.parentSlug || 'uncategorized';
      if (!groups[parentKey]) {
        groups[parentKey] = {
          name: cat.parentName || 'Other',
          icon: cat.parentIcon || null,
          slug: parentKey,
          subcategories: [],
        };
      }
      groups[parentKey].subcategories.push(cat);
    }
    return Object.values(groups);
  }, [categories]);

  // Find current selection's parent
  const selectedCat = categories.find(c => c.id === value);
  const [selectedParent, setSelectedParent] = useState<string>(selectedCat?.parentSlug || '');
  const [searchQuery, setSearchQuery] = useState('');

  // Update parent when value changes externally
  useEffect(() => {
    if (value) {
      const cat = categories.find(c => c.id === value);
      if (cat?.parentSlug && cat.parentSlug !== selectedParent) {
        setSelectedParent(cat.parentSlug);
      }
    }
  }, [value, categories]);

  // Get subcategories for selected parent
  const currentSubcategories = useMemo(() => {
    if (!selectedParent) return [];
    const group = parentGroups.find(g => g.slug === selectedParent);
    return group?.subcategories || [];
  }, [selectedParent, parentGroups]);

  // Filtered subcategories based on search
  const filteredSubcategories = useMemo(() => {
    if (!searchQuery) return currentSubcategories;
    const q = searchQuery.toLowerCase();
    return currentSubcategories.filter(c => c.name.toLowerCase().includes(q));
  }, [currentSubcategories, searchQuery]);

  const handleParentChange = (parentSlug: string) => {
    setSelectedParent(parentSlug);
    setSearchQuery('');
    // Auto-select first subcategory of new parent
    const group = parentGroups.find(g => g.slug === parentSlug);
    if (group && group.subcategories.length > 0) {
      onChange(group.subcategories[0].id);
    } else {
      onChange('');
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Parent Category Select */}
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
          Category *
        </label>
        <select
          value={selectedParent}
          onChange={(e) => handleParentChange(e.target.value)}
          required={required}
          className="input-field text-sm"
        >
          <option value="">Select parent category</option>
          {parentGroups.map((group) => (
            <option key={group.slug} value={group.slug}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Select */}
      {selectedParent && (
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">
            Subcategory *
          </label>
          {currentSubcategories.length > 8 && (
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search subcategories..."
                className="input-field text-xs pl-8 py-1.5"
              />
            </div>
          )}
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="input-field text-sm"
          >
            <option value="">Select subcategory</option>
            {filteredSubcategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {selectedCat && (
            <p className="text-[11px] text-gray-400 mt-1 font-jakarta">
              {selectedCat.parentName} → {selectedCat.name}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
