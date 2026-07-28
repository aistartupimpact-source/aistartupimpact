'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface ProsConsManagerProps {
  pros: string[];
  cons: string[];
  onChangePros: (pros: string[]) => void;
  onChangeCons: (cons: string[]) => void;
  maxPros?: number;
  maxCons?: number;
}

export default function ProsConsManager({
  pros,
  cons,
  onChangePros,
  onChangeCons,
  maxPros = 6,
  maxCons = 3,
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

  return (
    <div className="space-y-5">
      {/* Label */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Strengths & Limitations</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Help users understand what your tool does best and where it has gaps.</p>
      </div>

      {/* Pros / Top Strengths */}
      <div>
        <label className="text-xs font-medium text-green-700 dark:text-green-400 mb-2 block">
          Top Strengths ({pros.length}/{maxPros}) <span className="text-gray-400 font-normal">— min 3 recommended</span>
        </label>
        <div className="space-y-1.5">
          {pros.map((pro, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{pro}</span>
              <button type="button" onClick={() => onChangePros(pros.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500">
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
              placeholder="e.g. Fast response time under 200ms"
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500/20 focus:border-green-400"
            />
            <button type="button" onClick={addPro} disabled={!newPro.trim()} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 disabled:opacity-40">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cons / Limitations */}
      <div>
        <label className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-2 block">
          Limitations ({cons.length}/{maxCons}) <span className="text-gray-400 font-normal">— optional, builds trust</span>
        </label>
        <div className="space-y-1.5">
          {cons.map((con, i) => (
            <div key={i} className="flex items-center gap-2 group">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{con}</span>
              <button type="button" onClick={() => onChangeCons(cons.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-red-500">
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
              placeholder="e.g. No offline mode available"
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
            />
            <button type="button" onClick={addCon} disabled={!newCon.trim()} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 disabled:opacity-40">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
