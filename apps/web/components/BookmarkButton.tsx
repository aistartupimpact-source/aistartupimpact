'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useUser } from './UserProvider';

interface BookmarkButtonProps {
  type: 'tool' | 'startup';
  itemId: string;
  itemName?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

export default function BookmarkButton({
  type,
  itemId,
  itemName,
  size = 'md',
  variant = 'icon',
  className = '',
}: BookmarkButtonProps) {
  const { user, signIn } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if item is saved
  useEffect(() => {
    if (!user) {
      setIsSaved(false);
      return;
    }

    const checkSaved = async () => {
      try {
        const params = new URLSearchParams();
        if (type === 'tool') {
          params.set('toolIds', itemId);
        } else {
          params.set('startupIds', itemId);
        }

        const res = await fetch(`/api/bookmarks/check?${params}`);
        const data = await res.json();
        const key = `${type}-${itemId}`;
        setIsSaved(!!data.saved[key]);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };

    checkSaved();
  }, [user, type, itemId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      signIn();
      return;
    }

    setIsLoading(true);
    setIsAnimating(true);

    // Optimistic update
    const previousState = isSaved;
    setIsSaved(!isSaved);

    try {
      const endpoint = type === 'tool' ? '/api/bookmarks/tools' : '/api/bookmarks/startups';
      const idKey = type === 'tool' ? 'toolId' : 'startupId';

      if (previousState) {
        // Unsave
        const res = await fetch(`${endpoint}?${idKey}=${itemId}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          const error = await res.json();
          console.error('Error unsaving:', error);
          // Revert optimistic update
          setIsSaved(previousState);
        } else {
          console.log(`Successfully unsaved ${type}:`, itemId);
        }
      } else {
        // Save
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ [idKey]: itemId }),
        });

        if (!res.ok) {
          const error = await res.json();
          console.error('Error saving:', error);
          // Revert optimistic update
          setIsSaved(previousState);
        } else {
          console.log(`Successfully saved ${type}:`, itemId);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert optimistic update on error
      setIsSaved(previousState);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsAnimating(false), 600);
    }
  };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
          isSaved
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      >
        <Bookmark
          className={`w-4 h-4 transition-all duration-300 ${
            isSaved ? 'fill-current' : ''
          } ${isAnimating ? 'scale-125' : 'scale-100'}`}
        />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`${sizeClasses[size]} rounded-lg flex items-center justify-center transition-all duration-200 ${
          isSaved
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
            : 'bg-white dark:bg-gray-900 text-blue-500/80 dark:text-blue-400/80 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${className}`}
      >
        <Bookmark
          className={`${iconSizes[size]} transition-all duration-300 ${
            isSaved ? 'fill-current' : ''
          } ${isAnimating ? 'scale-125 rotate-12' : 'scale-100 rotate-0'}`}
        />
      </button>
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center z-50">
        <div className="w-2.5 h-2.5 bg-black dark:bg-gray-800 rotate-45 -mb-1.5" />
        <div className="bg-black dark:bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg font-jakarta">
          {isSaved ? 'Saved' : 'Save'}
        </div>
      </div>
    </div>
  );
}
