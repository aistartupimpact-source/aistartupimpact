'use client';

import { useState } from 'react';
import { Plus, Trash2, Calendar, IndianRupee, Users } from 'lucide-react';

interface FundingRound {
  id: string;
  roundType: string;
  amountUsd: string;
  announcedAt: string;
  leadInvestors: string;
  allInvestors: string;
}

interface FundingRoundsManagerProps {
  startupId: string;
  existingRounds?: any[];
  onUpdate?: () => void;
}

const ROUND_TYPES = [
  'Pre-Seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D',
  'Series E',
  'Growth',
  'Bridge',
  'Debt',
  'Grant',
];

export default function FundingRoundsManager({ startupId, existingRounds = [], onUpdate }: FundingRoundsManagerProps) {
  const [rounds, setRounds] = useState<FundingRound[]>(
    existingRounds.map(r => ({
      id: r.id || `temp-${Date.now()}`,
      roundType: r.roundType || '',
      amountUsd: r.amountUsd ? (Number(r.amountUsd) / 100).toString() : '',
      announcedAt: r.announcedAt ? r.announcedAt.split('T')[0] : '',
      leadInvestors: Array.isArray(r.leadInvestors) ? r.leadInvestors.join(', ') : '',
      allInvestors: Array.isArray(r.allInvestors) ? r.allInvestors.join(', ') : '',
    }))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addRound = () => {
    setRounds([
      ...rounds,
      {
        id: `temp-${Date.now()}`,
        roundType: '',
        amountUsd: '',
        announcedAt: '',
        leadInvestors: '',
        allInvestors: '',
      },
    ]);
  };

  const updateRound = (id: string, field: keyof FundingRound, value: string) => {
    setRounds(rounds.map(r => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const removeRound = (id: string) => {
    setRounds(rounds.filter(r => r.id !== id));
  };

  const saveRounds = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/founder/startups/${startupId}/funding-rounds`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rounds: rounds.map(r => ({
            roundType: r.roundType,
            amountUsd: r.amountUsd ? Math.round(parseFloat(r.amountUsd) * 100) : 0,
            announcedAt: r.announcedAt,
            leadInvestors: r.leadInvestors.split(',').map(i => i.trim()).filter(Boolean),
            allInvestors: r.allInvestors.split(',').map(i => i.trim()).filter(Boolean),
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Funding rounds saved successfully!' });
        if (onUpdate) onUpdate();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save funding rounds' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Funding Rounds
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Add details about your funding history
          </p>
        </div>
        <button
          type="button"
          onClick={addRound}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Round
        </button>
      </div>

      {rounds.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <IndianRupee className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
            No funding rounds added yet
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Click "Add Round" to add your funding history
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rounds.map((round, index) => (
            <div
              key={round.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4 bg-white dark:bg-gray-800"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                  Round {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeRound(round.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  aria-label="Remove round"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Round Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Round Type *
                  </label>
                  <select
                    value={round.roundType}
                    onChange={(e) => updateRound(round.id, 'roundType', e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                  >
                    <option value="">Select round type</option>
                    {ROUND_TYPES.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount Raised (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      value={round.amountUsd}
                      onChange={(e) => updateRound(round.id, 'amountUsd', e.target.value)}
                      required
                      min="0"
                      step="10000"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                      placeholder="e.g., 1000000"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter amount in USD (e.g., 1M = 1000000)
                  </p>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Announced Date *
                  </label>
                  <input
                    type="date"
                    value={round.announcedAt}
                    onChange={(e) => updateRound(round.id, 'announcedAt', e.target.value)}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                  />
                </div>

                {/* Lead Investors */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Lead Investors
                  </label>
                  <input
                    type="text"
                    value={round.leadInvestors}
                    onChange={(e) => updateRound(round.id, 'leadInvestors', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                    placeholder="Comma-separated, e.g., Sequoia, Accel"
                  />
                </div>
              </div>

              {/* All Investors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  All Investors (Optional)
                </label>
                <input
                  type="text"
                  value={round.allInvestors}
                  onChange={(e) => updateRound(round.id, 'allInvestors', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand focus:border-transparent text-sm"
                  placeholder="Comma-separated list of all participating investors"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Save Button */}
      {rounds.length > 0 && (
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="button"
            onClick={saveRounds}
            disabled={saving}
            className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-sm"
          >
            {saving ? 'Saving...' : 'Save Funding Rounds'}
          </button>
        </div>
      )}
    </div>
  );
}
