'use client';

import { useState, useEffect } from 'react';
import {
  Plus, Search, IndianRupee, Calendar, Edit3, Trash2, X, Save, Building2,
} from 'lucide-react';
import {
  getFundingRoundsAction,
  getStartupsForDropdownAction,
  createFundingRoundAction,
  updateFundingRoundAction,
  deleteFundingRoundAction,
} from './actions';

interface FundingRound {
  id: string;
  startupId: string;
  startupName: string;
  roundType: string;
  amountInr: string;
  announcedAt: string;
  leadInvestors: string[];
  sourceUrl?: string;
  createdAt: string;
}

interface Startup {
  id: string;
  name: string;
}

const roundTypes = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Growth', 'Bridge'];

export default function FundingRoundsPage() {
  const [fundingRounds, setFundingRounds] = useState<FundingRound[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FundingRound | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [investorInput, setInvestorInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roundsData, startupsData] = await Promise.all([
        getFundingRoundsAction(),
        getStartupsForDropdownAction(),
      ]);
      setFundingRounds(roundsData as FundingRound[]);
      setStartups(startupsData as Startup[]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = fundingRounds.filter(round =>
    round.startupName.toLowerCase().includes(search.toLowerCase()) ||
    round.roundType.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing({
      id: '',
      startupId: '',
      startupName: '',
      roundType: 'Seed',
      amountInr: '',
      announcedAt: new Date().toISOString().split('T')[0],
      leadInvestors: [],
      createdAt: '',
    });
    setInvestorInput('');
    setModalOpen(true);
  };

  const openEdit = (round: FundingRound) => {
    setEditing({ ...round });
    setInvestorInput(round.leadInvestors.join(', '));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;

    try {
      const investors = investorInput.split(',').map(inv => inv.trim()).filter(inv => inv);
      const amountInPaise = (parseFloat(editing.amountInr) * 1000000000).toString(); // Convert Cr to paise

      const data = {
        startupId: editing.startupId,
        roundType: editing.roundType,
        amountInr: amountInPaise,
        announcedAt: editing.announcedAt,
        leadInvestors: investors,
        sourceUrl: editing.sourceUrl,
      };

      if (editing.id && fundingRounds.find(r => r.id === editing.id)) {
        // Update existing
        const result = await updateFundingRoundAction(editing.id, data);
        if (result.success) {
          await loadData();
        }
      } else {
        // Create new
        const result = await createFundingRoundAction(data);
        if (result.success) {
          await loadData();
        }
      }
      setModalOpen(false);
      setEditing(null);
      setInvestorInput('');
    } catch (error) {
      console.error('Error saving funding round:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteFundingRoundAction(id);
      if (result.success) {
        await loadData();
      }
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting funding round:', error);
    }
  };

  const formatAmount = (amountInr: string) => {
    const crores = Number(amountInr) / 1000000000;
    return `₹${crores.toFixed(0)}Cr`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Funding Rounds</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">
            Manage individual funding rounds shown on homepage
          </p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Funding Round
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search funding rounds..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Startup</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Round</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Investors</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Date</th>
              <th className="px-6 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((round) => (
              <tr key={round.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-brand" />
                    </div>
                    <div>
                      <h4 className="font-sora font-semibold text-sm text-navy dark:text-white">{round.startupName}</h4>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className="badge-category text-[10px]">{round.roundType}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-bold text-brand font-sora">{formatAmount(round.amountInr)}</span>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">
                    {round.leadInvestors.slice(0, 2).join(', ')}
                    {round.leadInvestors.length > 2 && ` +${round.leadInvestors.length - 2}`}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">
                    {new Date(round.announcedAt).toLocaleDateString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(round)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                      <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button onClick={() => setDeleteConfirm(round.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">No funding rounds found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">
                {editing.id && fundingRounds.find(r => r.id === editing.id) ? 'Edit Funding Round' : 'Add Funding Round'}
              </h2>
              <button onClick={() => { setModalOpen(false); setEditing(null); setInvestorInput(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Startup *</label>
                <select className="input-field text-sm" value={editing.startupId} onChange={(e) => setEditing({ ...editing, startupId: e.target.value })}>
                  <option value="">Select startup...</option>
                  {startups.map(startup => (
                    <option key={startup.id} value={startup.id}>{startup.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Round Type</label>
                  <select className="input-field text-sm" value={editing.roundType} onChange={(e) => setEditing({ ...editing, roundType: e.target.value })}>
                    {roundTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Amount (₹ Crores)</label>
                  <input type="number" className="input-field text-sm" value={editing.amountInr} onChange={(e) => setEditing({ ...editing, amountInr: e.target.value })} placeholder="e.g. 41" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Announced Date</label>
                <input type="date" className="input-field text-sm" value={editing.announcedAt} onChange={(e) => setEditing({ ...editing, announcedAt: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Lead Investors</label>
                <input type="text" className="input-field text-sm" value={investorInput} onChange={(e) => setInvestorInput(e.target.value)} placeholder="e.g. Lightspeed, Peak XV, Matrix Partners" />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1">Separate multiple investors with commas</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Source URL (Optional)</label>
                <input type="url" className="input-field text-sm" value={editing.sourceUrl || ''} onChange={(e) => setEditing({ ...editing, sourceUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setModalOpen(false); setEditing(null); setInvestorInput(''); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!editing.startupId || !editing.amountInr} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> Save Round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Funding Round?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}