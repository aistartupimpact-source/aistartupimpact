'use client';

import { useState, useRef, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface ScreenshotGalleryProps {
  screenshots: string[];
  toolName: string;
}

export default function ScreenshotGallery({ screenshots, toolName }: ScreenshotGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.scrollWidth / screenshots.length;
    const index = Math.round(scrollLeft / itemWidth);
    
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const itemWidth = container.scrollWidth / screenshots.length;
    container.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [screenshots.length]);

  return (
    <div className="card p-5 sm:p-6 overflow-hidden">
      <h2 className="section-title mb-4">Screenshots</h2>
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide -mx-5 sm:-mx-6 px-5 sm:px-6"
      >
        <div className="flex gap-4 pb-2 w-max">
          {screenshots.map((url: string, index: number) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex-shrink-0 w-[320px] sm:w-[400px] lg:w-[450px] aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-brand transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`${toolName} screenshot ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {index + 1} / {screenshots.length}
              </div>
            </a>
          ))}
        </div>
      </div>
      
      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {screenshots.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`transition-all duration-300 rounded-full ${
              index === activeIndex
                ? 'w-8 h-2 bg-brand'
                : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            }`}
            aria-label={`Go to screenshot ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
