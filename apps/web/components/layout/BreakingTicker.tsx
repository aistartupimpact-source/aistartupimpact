'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const breakingItems = [
  'Sarvam AI open-sources OpenHathi, its first Hindi LLM, redefining vernacular data availability',
  'QX Lab AI launches Ask QX, a multilingual generative AI platform supporting 12 Indian languages natively',
  'Cabinet approves massive ₹10,372Cr budget for the IndiaAI Mission shaping public sector innovation',
  'Krutrim AI achieves unicorn status following $50M raise from Matrix Partners India',
  'Meta partners with IndiaAI to amplify open-source innovation and train 1M developers',
];

export default function BreakingTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-navy dark:bg-gray-900 h-9 flex items-center overflow-hidden border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center gap-3">
        <span className="flex items-center gap-1 bg-brand text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0">
          <Zap className="w-2.5 h-2.5" /> Live
        </span>
        <div className="relative flex-1 overflow-hidden h-5">
          <p
            key={currentIndex}
            className="text-gray-200 text-xs sm:text-sm font-jakarta whitespace-nowrap animate-fade-in absolute inset-0 leading-5"
          >
            {breakingItems[currentIndex]}
          </p>
        </div>
      </div>
    </div>
  );
}
