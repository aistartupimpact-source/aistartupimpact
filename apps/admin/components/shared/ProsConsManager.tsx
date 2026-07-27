'use client';

import { useState } from 'react';
import { Plus, X, ThumbsUp, ThumbsDown } from 'lucide-react';

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

export default function ProsConsManager({
  pros,
  cons,
  onChangePros,
  onChangeCons,
  maxPros = 6,
  maxCons = 6,
  prosLabel = 'Pros / Strengths',
  consLabel = 'Cons / Limitations',
}: ProsConsManagerProps) {
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const addPro = () => {
    if (newPro.trim() && pros.length < maxPros) {
      onChangePros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const addCon = () => {
    if (newCon.trim() && cons.length < maxCons) {
      onChangeCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const removePro = (index: number) => {
    onChangePros(pros.filter((_, i) => i !== index));
  };

  const removeCon = (index: number) => {
    onChangeCons(cons.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      {/* Pros */}
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5 font-jakarta">
          <ThumbsUp className="w-3.5 h-3.5 text-green-600" />
          {prosLabel} ({pros.length}/{maxPros})
        </label>
        <div className="space-y-1.5">
          {pros.map((pro, i) => (
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
        {pros.length < maxPros && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newPro}
              onChange={(e) => setNewPro(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPro(); } }}
              placeholder="Add a strength..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
            />
            <button
              type="button"
              onClick={addPro}
              disabled={!newPro.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cons */}
      <div>
        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5 font-jakarta">
          <ThumbsDown className="w-3.5 h-3.5 text-red-500" />
          {consLabel} ({cons.length}/{maxCons})
        </label>
        <div className="space-y-1.5">
          {cons.map((con, i) => (
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
        {cons.length < maxCons && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newCon}
              onChange={(e) => setNewCon(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCon(); } }}
              placeholder="Add a limitation..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
            />
            <button
              type="button"
              onClick={addCon}
              disabled={!newCon.trim()}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
