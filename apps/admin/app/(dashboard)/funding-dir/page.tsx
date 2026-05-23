'use client';

import { useState, useEffect, useTransition } from 'react';
import { Plus, IndianRupee, Calendar, CheckCircle, Clock, Edit3, Trash2, X, Save, TrendingUp, Building2 } from 'lucide-react';
import {
  getFundingDigestsAction, createFundingDigestAction, updateFundingDigestAction,
  deleteFundingDigestAction, toggleFundingDigestStatusAction,
  getFundingRoundsDirectAction, createFundingRoundDirectAction,
  updateFundingRoundDirectAction, deleteFundingRoundDirectAction,
} from './actions';

interface Deal { startup: string; amount: string; stage: string; }
interface Digest { id: string; title: string; date: string; status: string; dealsCount: number; totalRaised: string; deals: Deal[]; }
interface Round {
  id: string; startupId: string; startupName: string; roundType: string;
  amountUsd: string; amountInr: string; announcedAt: string;
  leadInvestors: string[]; allInvestors: string[]; valuation: string | null; sourceUrl?: string;
}
interface Startup { id: string; name: string; }

const ROUND_TYPES = ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Growth', 'Bridge'];

function formatUsd(cents: string | number | null) {
  if (!cents) return '—';
  const usd = Number(cents) / 100;
  if (usd >= 1e9) return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6) return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${(usd / 1e3).toFixed(0)}K`;
}

export default function FundingDirPage() {
  const [tab, setTab] = useState<'digests' | 'rounds'>('rounds');
  const [digests, setDigests] = useState<Digest[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Digest modal
  const [digestModal, setDigestModal] = useState(false);
  const [editDigest, setEditDigest] = useState<Digest | null>(null);
  const [deleteDigest, setDeleteDigest] = useState<string | null>(null);

  // Round modal
  const [roundModal, setRoundModal] = useState(false);
  const [editRound, setEditRound] = useState<Partial<Round> | null>(null);
  const [deleteRound, setDeleteRound] = useState<string | null>(null);
  const [investorInput, setInvestorInput] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [d, r] = await Promise.all([
      getFundingDigestsAction(),
      getFundingRoundsDirectAction(),
    ]);
    setDigests((d as any[]).map(x => ({
      ...x,
      // Ensure date is always a plain string — Neon returns date columns as Date objects
      date: x.date instanceof Date
        ? x.date.toISOString().split('T')[0]
        : typeof x.date === 'string'
          ? x.date.split('T')[0]
          : String(x.date ?? ''),
      deals: typeof x.deals === 'string' ? JSON.parse(x.deals) : x.deals || [],
    })));
    setRounds(r as Round[]);
    setLoading(false);
  };

  // ── Digest handlers ──────────────────────────────────────────────────────
  const openCreateDigest = () => {
    setEditDigest({ id: '', title: '', date: new Date().toISOString().split('T')[0], status: 'DRAFT', dealsCount: 0, totalRaised: '', deals: [] });
    setDigestModal(true);
  };
  const saveDigest = () => {
    if (!editDigest) return;
    startTransition(async () => {
      const data = { title: editDigest.title, date: editDigest.date, status: editDigest.status, dealsCount: editDigest.deals.length, totalRaised: editDigest.totalRaised, deals: editDigest.deals };
      if (editDigest.id && digests.find(d => d.id === editDigest.id)) {
        await updateFundingDigestAction(editDigest.id, data);
      } else {
        await createFundingDigestAction(data);
      }
      const updated = await getFundingDigestsAction();
      setDigests((updated as any[]).map(x => ({
        ...x,
        date: x.date instanceof Date
          ? x.date.toISOString().split('T')[0]
          : typeof x.date === 'string'
            ? x.date.split('T')[0]
            : String(x.date ?? ''),
        deals: typeof x.deals === 'string' ? JSON.parse(x.deals) : x.deals || [],
      })));
      setDigestModal(false); setEditDigest(null);
    });
  };
  const addDeal = () => { if (!editDigest) return; setEditDigest({ ...editDigest, deals: [...editDigest.deals, { startup: '', amount: '', stage: 'Seed' }] }); };
  const updateDeal = (i: number, f: keyof Deal, v: string) => { if (!editDigest) return; const d = [...editDigest.deals]; d[i] = { ...d[i], [f]: v }; setEditDigest({ ...editDigest, deals: d }); };
  const removeDeal = (i: number) => { if (!editDigest) return; setEditDigest({ ...editDigest, deals: editDigest.deals.filter((_, j) => j !== i) }); };

  // ── Round handlers ───────────────────────────────────────────────────────
  const openCreateRound = () => {
    setEditRound({ roundType: 'Series A', announcedAt: new Date().toISOString().split('T')[0], leadInvestors: [] });
    setInvestorInput('');
    setRoundModal(true);
  };
  const saveRound = () => {
    if (!editRound) return;
    startTransition(async () => {
      const investors = investorInput.split(',').map(s => s.trim()).filter(Boolean);
      const data = {
        startupName: editRound.startupName || '',
        roundType: editRound.roundType || 'Seed',
        amountUsd: editRound.amountUsd || '',
        announcedAt: editRound.announcedAt || '',
        leadInvestors: investors,
        valuation: editRound.valuation || '',
        sourceUrl: editRound.sourceUrl || '',
      };
      if (editRound.id && rounds.find(r => r.id === editRound.id)) {
        await updateFundingRoundDirectAction(editRound.id, data);
      } else {
        await createFundingRoundDirectAction(data);
      }
      const updated = await getFundingRoundsDirectAction();
      setRounds(updated as Round[]);
      setRoundModal(false); setEditRound(null);
    });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Funding</h1>
          <p className="text-gray-400 text-sm font-jakarta mt-1">{rounds.length} rounds · {digests.length} digests</p>
        </div>
        <button onClick={tab === 'digests' ? openCreateDigest : openCreateRound} className="btn-brand text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> {tab === 'digests' ? 'New Digest' : 'Add Round'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {(['rounds', 'digests'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold font-jakarta transition-all capitalize ${tab === t ? 'bg-white dark:bg-gray-900 text-navy dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t === 'rounds' ? `Funding Rounds (${rounds.length})` : `Weekly Digests (${digests.length})`}
          </button>
        ))}
      </div>

      {/* ── ROUNDS TAB ── */}
      {tab === 'rounds' && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Startup</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden md:table-cell">Round</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden lg:table-cell">Lead Investors</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden sm:table-cell">Date</th>
                <th className="px-6 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {rounds.map(r => (
                <tr key={r.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-brand" />
                      </div>
                      <span className="font-sora font-semibold text-sm text-navy dark:text-white">{r.startupName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-brand/10 text-brand">{r.roundType}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-sora font-bold text-sm text-brand">{formatUsd(r.amountUsd)}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-xs text-gray-500 font-jakarta">
                      {(r.leadInvestors || []).slice(0, 2).join(', ')}{(r.leadInvestors || []).length > 2 ? ` +${r.leadInvestors.length - 2}` : ''}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="text-xs text-gray-400 font-jakarta">{r.announcedAt ? new Date(r.announcedAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button onClick={() => { setEditRound(r); setInvestorInput((r.leadInvestors || []).join(', ')); setRoundModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button onClick={() => setDeleteRound(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rounds.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-jakarta text-sm">No funding rounds yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* ── DIGESTS TAB ── */}
      {tab === 'digests' && (
        <div className="space-y-3">
          {digests.map(d => (
            <div key={d.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 hover:border-brand/30 transition-colors group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0"><IndianRupee className="w-5 h-5 text-brand" /></div>
                  <div>
                    <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors">{d.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3" />{d.date}</span>
                      <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><TrendingUp className="w-3 h-3" />{d.dealsCount} deals</span>
                      <span className="text-xs font-bold text-brand font-sora">{d.totalRaised}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => { startTransition(async () => { await toggleFundingDigestStatusAction(d.id); const u = await getFundingDigestsAction(); setDigests((u as any[]).map(x => ({ ...x, date: x.date instanceof Date ? x.date.toISOString().split('T')[0] : typeof x.date === 'string' ? x.date.split('T')[0] : String(x.date ?? ''), deals: typeof x.deals === 'string' ? JSON.parse(x.deals) : x.deals || [] }))); }); }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${d.status === 'PUBLISHED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}>
                    {d.status === 'PUBLISHED' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{d.status}
                  </button>
                  <button onClick={() => { setEditDigest({ ...d }); setDigestModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-4 h-4 text-gray-400" /></button>
                  <button onClick={() => setDeleteDigest(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
          {digests.length === 0 && <p className="text-center text-gray-400 font-jakarta text-sm py-12">No digests yet</p>}
        </div>
      )}

      {/* ── ROUND MODAL ── */}
      {roundModal && editRound && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{editRound.id ? 'Edit Round' : 'Add Funding Round'}</h2>
              <button onClick={() => { setRoundModal(false); setEditRound(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Startup Name *</label>
                <input type="text" className="input-field text-sm" value={editRound.startupName || ''} onChange={e => setEditRound({ ...editRound, startupName: e.target.value })} placeholder="e.g. Neysa" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Round Type</label>
                  <select className="input-field text-sm" value={editRound.roundType || 'Seed'} onChange={e => setEditRound({ ...editRound, roundType: e.target.value })}>
                    {ROUND_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Amount (USD cents)</label>
                  <input type="number" className="input-field text-sm" value={editRound.amountUsd || ''} onChange={e => setEditRound({ ...editRound, amountUsd: e.target.value })} placeholder="e.g. 1500000000 = $15M" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Announced Date</label>
                <input type="date" className="input-field text-sm" value={editRound.announcedAt || ''} onChange={e => setEditRound({ ...editRound, announcedAt: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Lead Investors (comma separated)</label>
                <input type="text" className="input-field text-sm" value={investorInput} onChange={e => setInvestorInput(e.target.value)} placeholder="Bessemer, NVIDIA, Amazon" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Source URL</label>
                <input type="url" className="input-field text-sm" value={editRound.sourceUrl || ''} onChange={e => setEditRound({ ...editRound, sourceUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setRoundModal(false); setEditRound(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={saveRound} disabled={!editRound.startupName || isPending} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Round'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DIGEST MODAL ── */}
      {digestModal && editDigest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{digests.find(d => d.id === editDigest.id) ? 'Edit Digest' : 'New Digest'}</h2>
              <button onClick={() => { setDigestModal(false); setEditDigest(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Title *</label>
                <input type="text" className="input-field text-sm" value={editDigest.title} onChange={e => setEditDigest({ ...editDigest, title: e.target.value })} placeholder="Week X: headline..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Date</label>
                  <input type="date" className="input-field text-sm" value={editDigest.date} onChange={e => setEditDigest({ ...editDigest, date: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Total Raised</label>
                  <input type="text" className="input-field text-sm" value={editDigest.totalRaised} onChange={e => setEditDigest({ ...editDigest, totalRaised: e.target.value })} placeholder="e.g. $1.58B" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase font-jakarta">Deals</label>
                  <button onClick={addDeal} className="text-xs text-brand font-semibold hover:underline">+ Add Deal</button>
                </div>
                {editDigest.deals.map((deal, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" className="input-field text-sm flex-1" placeholder="Startup" value={deal.startup} onChange={e => updateDeal(i, 'startup', e.target.value)} />
                    <input type="text" className="input-field text-sm w-24" placeholder="Amount" value={deal.amount} onChange={e => updateDeal(i, 'amount', e.target.value)} />
                    <input type="text" className="input-field text-sm w-24" placeholder="Stage" value={deal.stage} onChange={e => updateDeal(i, 'stage', e.target.value)} />
                    <button onClick={() => removeDeal(i)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><X className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => { setDigestModal(false); setEditDigest(null); }} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={saveDigest} disabled={!editDigest.title || isPending} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Digest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirms */}
      {(deleteRound || deleteDigest) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setDeleteRound(null); setDeleteDigest(null); }} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={() => {
                startTransition(async () => {
                  if (deleteRound) { await deleteFundingRoundDirectAction(deleteRound); setRounds(rounds.filter(r => r.id !== deleteRound)); setDeleteRound(null); }
                  if (deleteDigest) { await deleteFundingDigestAction(deleteDigest); setDigests(digests.filter(d => d.id !== deleteDigest)); setDeleteDigest(null); }
                });
              }} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
