"use client";

import { ThumbsUp } from "lucide-react";
import { useState } from "react";
import { incrementHelpfulCountAction } from "../app/actions/reviews";

export default function ReviewHelpfulButton({ 
  reviewId, 
  toolSlug, 
  initialCount 
}: { 
  reviewId: string, 
  toolSlug: string, 
  initialCount: number 
}) {
  const [clicked, setClicked] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleClick = async () => {
    if (clicked) return;
    setClicked(true);
    setCount(prev => prev + 1);
    await incrementHelpfulCountAction(reviewId, toolSlug);
  };

  return (
    <button 
      onClick={handleClick}
      disabled={clicked}
      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
        clicked 
          ? "bg-brand/10 text-brand border border-brand/20" 
          : "text-gray-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent"
      }`}
    >
      <ThumbsUp className={`w-3.5 h-3.5 ${clicked ? 'fill-brand/20' : ''}`} />
      <span>Helpful ({count})</span>
    </button>
  );
}
