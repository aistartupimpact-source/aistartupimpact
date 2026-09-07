'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  CreditCard, CheckCircle, AlertCircle, IndianRupee, Clock, Search, Filter,
  Loader2, XCircle, RefreshCw, ExternalLink, X,
} from 'lucide-react';
import { getPaymentStatsAction, getAdvPaymentsAction, markRefundAction } from './actions';

const statusStyle: Record<string, string> = {
  SUCCESS: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  PENDING: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  REFUNDED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
};

const purposeStyle: Record<string, string> = {
  PACKAGE_PURCHASE: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  PACKAGE_UPGRADE: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
  ZONE_EXTENSION: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400',
  SOCIAL_POST: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400',
};

const purposeLabel: Record<string, string> = {
  PACKAGE_PURCHASE: 'Package',
  PACKAGE_UPGRADE: 'Upgrade',
  ZONE_EXTENSION: 'Zone Ext.',
  SOCIAL_POST: 'Social Post',
};

const fmt = (d: string) => d ? new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtAmount = (paise: number) => paise ? `₹${(paise / 100).toLocaleString('en-IN')}` : '₹0';

interface Stats { total: number; success: number; pending: number; failed: number; revenue: number }
interface Payment {
  id: string; purpose: string; amountPaise: number; gstPaise: number; totalPaise: number;
  currency: string; razorpayOrderId: string | null; razorpayPaymentId: string | null;
  status: string; paidAt: string | null; failedAt: string | null;
  refundedAt: string | null; refundAmountPaise: number | null;
  createdAt: string; founderId: string; founderName: string; founderEmail: string;
  packageTier: string | null;
}

export default function AdvPaymentsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [refundModal, setRefundModal] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterPurpose, setFilterPurpose] = useState('ALL');
  const [search, setSearch] = useState('');

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [statsRes, paymentsRes] = await Promise.all([getPaymentStatsAction(), getAdvPaymentsAction()]);
    if (statsRes.success) setStats(statsRes.data as Stats);
    if (paymentsRes.success) setPayments(paymentsRes.data as Payment[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefund = async () => {
    if (!refundModal) return;
    const amount = Math.round(parseFloat(refundAmount) * 100);
    if (!amount || amount <= 0) { showToast('Enter a valid refund amount', false); return; }
    if (amount > refundModal.totalPaise) { showToast('Refund cannot exceed payment total', false); return; }

    setSaving(true);
    const res = await markRefundAction(refundModal.id, amount);
    setSaving(false);
    setRefundModal(null);
    setRefundAmount('');
    if (res.success) { showToast('Payment marked as refunded', true); load(); }
    else showToast(res.error || 'Failed', false);
  };

  const filtered = payments.filter((p) => {
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    if (filterPurpose !== 'ALL' && p.purpose !== filterPurpose) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.founderName?.toLowerCase().includes(q) &&
        !p.founderEmail?.toLowerCase().includes(q) &&
        !p.razorpayOrderId?.toLowerCase().includes(q) &&
        !p.razorpayPaymentId?.toLowerCase().includes(q)
      ) return false;
    }
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-brand" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-jakarta font-medium flex items-center gap-2 ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Advertise Payments</h1>
          <p className="text-gray-400 text-sm font-jakarta mt-1">Track all advertise system payments, refunds, and revenue</p>
        </div>
        <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Refresh">
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Payments', value: stats.total, icon: CreditCard, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
            { label: 'Successful', value: stats.success, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
            { label: 'Total Revenue', value: fmtAmount(stats.revenue), icon: IndianRupee, color: 'text-brand', bg: 'bg-red-100 dark:bg-red-900/30' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">{s.label}</p>
                  <p className={`text-2xl font-bold font-sora mt-1 ${s.color}`}>{s.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search founder, Razorpay order/payment ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field text-sm pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm">
              <option value="ALL">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select value={filterPurpose} onChange={(e) => setFilterPurpose(e.target.value)} className="input-field text-sm">
              <option value="ALL">All Purpose</option>
              <option value="PACKAGE_PURCHASE">Package Purchase</option>
              <option value="PACKAGE_UPGRADE">Package Upgrade</option>
              <option value="ZONE_EXTENSION">Zone Extension</option>
              <option value="SOCIAL_POST">Social Post</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Date</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Founder</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Purpose</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden md:table-cell">Amount</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden lg:table-cell">GST</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Total</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta hidden lg:table-cell">Razorpay ID</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Status</th>
                <th className="px-6 py-3 w-24 text-xs font-semibold text-gray-500 uppercase tracking-wide font-jakarta">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-jakarta">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No payments found
                  </td>
                </tr>
              )}
              {filtered.map((pay) => (
                <tr key={pay.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-500 font-jakarta whitespace-nowrap">{fmt(pay.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="font-sora font-semibold text-sm text-navy dark:text-white">{pay.founderName || '—'}</div>
                    <div className="text-xs text-gray-400 font-jakarta">{pay.founderEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${purposeStyle[pay.purpose] || ''}`}>
                      {purposeLabel[pay.purpose] || pay.purpose}
                    </span>
                    {pay.packageTier && (
                      <span className="text-[10px] text-gray-400 font-jakarta ml-1">{pay.packageTier}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-jakarta hidden md:table-cell">{fmtAmount(pay.amountPaise)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-jakarta hidden lg:table-cell">{fmtAmount(pay.gstPaise)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-navy dark:text-white font-jakarta">{fmtAmount(pay.totalPaise)}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    {pay.razorpayPaymentId ? (
                      <span className="text-xs text-gray-400 font-mono">{pay.razorpayPaymentId.slice(0, 18)}...</span>
                    ) : pay.razorpayOrderId ? (
                      <span className="text-xs text-gray-400 font-mono">{pay.razorpayOrderId.slice(0, 18)}...</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyle[pay.status] || ''}`}>
                      {pay.status}
                    </span>
                    {pay.refundAmountPaise && (
                      <div className="text-[10px] text-purple-500 font-jakarta mt-0.5">{fmtAmount(pay.refundAmountPaise)} refunded</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {pay.status === 'SUCCESS' && (
                      <button
                        onClick={() => { setRefundModal(pay); setRefundAmount(String(pay.totalPaise / 100)); }}
                        className="text-xs text-purple-500 hover:underline font-jakarta font-semibold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Mark Refund</h2>
              <button onClick={() => setRefundModal(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-sm text-gray-500 font-jakarta">
                  Payment: <strong>{purposeLabel[refundModal.purpose] || refundModal.purpose}</strong> by {refundModal.founderName}
                </p>
                <p className="text-sm text-gray-500 font-jakarta mt-1">
                  Original total: <strong>{fmtAmount(refundModal.totalPaise)}</strong>
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1.5 block font-jakarta">Refund Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="input-field text-sm w-full"
                  placeholder="Enter refund amount"
                />
              </div>
              <p className="text-xs text-gray-400 font-jakarta">
                This marks the payment as refunded in the system. Process the actual refund through the Razorpay dashboard.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
              <button onClick={() => setRefundModal(null)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={saving}
                className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Confirm Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
