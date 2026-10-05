'use client';

import { useState } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ProsConsManagerProps {
  pros: string[];
  cons: string[];
  onChangePros: (pros: string[]) => void;
  onChangeCons: (cons: string[]) => void;
  maxPros?: number;
  maxCons?: number;
  prosLabel?: string;
  consLabel?: string;
}

function parseLines(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.replace(/^[\s•\-\*\d.)\]]+/, '').trim())
    .filter(Boolean);
}

function toDisplay(items: string[]): string {
  return items.map(t => `• ${t}`).join('\n');
}

export default function ProsConsManager({
  pros,
  cons,
  onChangePros,
  onChangeCons,
  maxPros = 10,
  maxCons = 10,
  prosLabel = 'Pros / Strengths',
  consLabel = 'Cons / Limitations',
}: ProsConsManagerProps) {
  const [prosText, setProsText] = useState(toDisplay(pros));
  const [consText, setConsText] = useState(toDisplay(cons));

  const handleProsChange = (value: string) => {
    setProsText(value);
    onChangePros(parseLines(value).slice(0, maxPros));
  };

  const handleConsChange = (value: string) => {
    setConsText(value);
    onChangeCons(parseLines(value).slice(0, maxCons));
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    setter: (v: string) => void,
    current: string
  ) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.includes('\n')) {
      e.preventDefault();
      const lines = parseLines(pasted);
      const existing = parseLines(current);
      const merged = [...existing, ...lines];
      setter(toDisplay(merged));
    }
  };

  const removePro = (index: number) => {
    const updated = parseLines(prosText).filter((_, i) => i !== index);
    setProsText(toDisplay(updated));
    onChangePros(updated);
  };

  const removeCon = (index: number) => {
    const updated = parseLines(consText).filter((_, i) => i !== index);
    setConsText(toDisplay(updated));
    onChangeCons(updated);
  };

  const proItems = parseLines(prosText);
  const conItems = parseLines(consText);

  return (
    <div className="space-y-5">
      {/* Pros */}
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5 font-jakarta">
          <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
          {prosLabel} ({proItems.length}/{maxPros})
        </label>
        <textarea
          value={prosText}
          onChange={(e) => handleProsChange(e.target.value)}
          onPaste={(e) => handlePaste(e, handleProsChange, prosText)}
          placeholder="Paste pros here — one per line, auto-formatted with bullet points"
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-400 resize-none"
        />
        {proItems.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-gray-400 font-jakarta uppercase tracking-wider">Preview ({proItems.length} items)</p>
            {proItems.map((pro, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-jakarta">{pro}</span>
                <button
                  type="button"
                  onClick={() => removePro(i)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cons */}
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5 font-jakarta">
          <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
          {consLabel} ({conItems.length}/{maxCons})
        </label>
        <textarea
          value={consText}
          onChange={(e) => handleConsChange(e.target.value)}
          onPaste={(e) => handlePaste(e, handleConsChange, consText)}
          placeholder="Paste cons here — one per line, auto-formatted with bullet points"
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
        />
        {conItems.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-gray-400 font-jakarta uppercase tracking-wider">Preview ({conItems.length} items)</p>
            {conItems.map((con, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-jakarta">{con}</span>
                <button
                  type="button"
                  onClick={() => removeCon(i)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500 transition-opacity"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
