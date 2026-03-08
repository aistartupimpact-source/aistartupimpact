'use client';

import { useState } from 'react';
import {
  CreditCard, Crown, Check, Download, IndianRupee,
  ArrowUpRight, Calendar, CheckCircle,
} from 'lucide-react';

const currentPlan = {
  name: 'Premium',
  price: '₹75,000',
  period: '/month',
  nextBilling: 'Apr 1, 2025',
  startedAt: 'Jan 1, 2025',
  features: [
    'Hero Cover Story placement',
    'Breaking Ticker headline',
    'Newsletter lead story',
    'Unlimited stories per month',
    'Dedicated account manager',
    'Custom analytics & ROI report',
  ],
};

const invoices = [
  { id: 'INV-2025-003', date: 'Mar 1, 2025', amount: '₹75,000', status: 'PAID', plan: 'Premium' },
  { id: 'INV-2025-002', date: 'Feb 1, 2025', amount: '₹75,000', status: 'PAID', plan: 'Premium' },
  { id: 'INV-2025-001', date: 'Jan 1, 2025', amount: '₹75,000', status: 'PAID', plan: 'Premium' },
  { id: 'INV-2024-012', date: 'Dec 1, 2024', amount: '₹35,000', status: 'PAID', plan: 'Growth' },
  { id: 'INV-2024-011', date: 'Nov 1, 2024', amount: '₹35,000', status: 'PAID', plan: 'Growth' },
];

const plans = [
  { name: 'Starter', price: '₹15,000', period: '/month', color: 'border-blue-200 dark:border-blue-800', active: false, features: ['Latest Stories Card #2/#3', 'Glossary tool listing', 'Newsletter mention', '1 story per month', 'Basic analytics'] },
  { name: 'Growth', price: '₹35,000', period: '/month', color: 'border-orange-200 dark:border-orange-800', active: false, features: ['Latest Stories Card #1', '#1 Editor\'s Pick', 'Funding Digest feature', '2 stories per month', 'Detailed analytics'] },
  { name: 'Premium', price: '₹75,000', period: '/month', color: 'border-brand', active: true, features: ['Hero Cover Story', 'Breaking Ticker', 'Newsletter lead', 'Unlimited stories', 'Custom ROI report'] },
];

export default function BillingPage() {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const totalSpent = invoices.reduce((s, inv) => s + parseInt(inv.amount.replace(/[₹,]/g, '')), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Billing</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage your subscription and view invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="lg:col-span-2 bg-gradient-to-br from-brand/5 to-brand/10 dark:from-brand/10 dark:to-brand/20 rounded-xl border border-brand/20 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-brand" />
                <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{currentPlan.name} Plan</h2>
              </div>
              <p className="text-3xl font-sora font-extrabold text-brand mt-2">{currentPlan.price}<span className="text-sm font-normal text-gray-500">{currentPlan.period}</span></p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {currentPlan.features.map(f => (
              <div key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 font-jakarta">
                <Check className="w-4 h-4 text-brand shrink-0" />{f}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-brand/10">
            <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3" /> Started {currentPlan.startedAt}</span>
            <span className="text-xs text-gray-400 font-jakarta flex items-center gap-1"><Calendar className="w-3 h-3" /> Next billing {currentPlan.nextBilling}</span>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowUpgrade(!showUpgrade)} className="px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-300 transition-colors">
              {showUpgrade ? 'Hide Plans' : 'Change Plan'}
            </button>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          <h3 className="font-sora font-bold text-base text-navy dark:text-white mb-4">Payment Summary</h3>
          <div className="space-y-4">
            <div>
              <p className="text-[11px] text-gray-400 font-jakarta uppercase mb-1">Total Spent</p>
              <p className="font-sora font-extrabold text-2xl text-brand">₹{totalSpent.toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-[11px] text-gray-400 font-jakarta uppercase mb-1">Payment Method</p>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-jakarta font-medium text-navy dark:text-white">•••• •••• •••• 4242</p>
                  <p className="text-[10px] text-gray-400 font-jakarta">Visa · Expires 12/26</p>
                </div>
              </div>
            </div>
            <button className="w-full text-sm text-brand font-semibold hover:underline text-left">Update payment method</button>
          </div>
        </div>
      </div>

      {/* Plan Comparison (toggle) */}
      {showUpgrade && (
        <div>
          <h2 className="font-sora font-bold text-base text-navy dark:text-white mb-3">Available Plans</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map(plan => (
              <div key={plan.name} className={`bg-white dark:bg-gray-900 rounded-xl border-2 p-5 transition-all ${plan.active ? plan.color + ' shadow-lg' : 'border-gray-200 dark:border-gray-800'}`}>
                <h3 className="font-sora font-bold text-base text-navy dark:text-white">{plan.name}</h3>
                <p className="text-2xl font-sora font-extrabold text-brand mt-1">{plan.price}<span className="text-sm font-normal text-gray-500">{plan.period}</span></p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 font-jakarta">
                      <Check className="w-3.5 h-3.5 text-brand shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full mt-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${plan.active ? 'bg-brand/10 text-brand cursor-default' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand hover:text-white'}`}>
                  {plan.active ? 'Current Plan' : `Switch to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice History */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white">Invoice History</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Invoice</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Date</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Plan</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Amount</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="px-6 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-3"><span className="text-sm font-mono font-medium text-navy dark:text-white">{inv.id}</span></td>
                <td className="px-6 py-3 hidden sm:table-cell"><span className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">{inv.date}</span></td>
                <td className="px-6 py-3"><span className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">{inv.plan}</span></td>
                <td className="px-6 py-3"><span className="text-sm font-sora font-bold text-navy dark:text-white">{inv.amount}</span></td>
                <td className="px-6 py-3 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    <CheckCircle className="w-3 h-3" /> {inv.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Download PDF">
                    <Download className="w-4 h-4 text-gray-400 hover:text-brand" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
