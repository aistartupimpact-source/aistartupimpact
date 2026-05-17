'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Mail, Users, Send, Plus, Eye, Clock, CheckCircle, TrendingUp,
  Edit3, X, Save, Trash2, Loader2, AlertCircle, FlaskConical,
  Monitor, Smartphone, Tablet,
} from 'lucide-react';
import {
  getNewsletterStatsAction, getCampaignsAction, saveCampaignAction,
  deleteCampaignAction, sendCampaignAction, sendTestEmailAction,
} from './actions';

interface Campaign {
  id: string; subject: string; previewText: string; body: string;
  sentAt: string | null; scheduledAt: string | null;
  status: string; totalSent: number; opens: number; uniqueOpens: number; 
  clicks: number; uniqueClicks: number; unsubscribes: number;
}
interface Stats { total: number; active: number; sentCount: number; openRate: string; ctr: string; }

const empty: Omit<Campaign, 'id'> = {
  subject: '', previewText: '', body: '', sentAt: null,
  scheduledAt: null, status: 'DRAFT', totalSent: 0, opens: 0, uniqueOpens: 0,
  clicks: 0, uniqueClicks: 0, unsubscribes: 0,
};
const statusStyle: Record<string, string> = {
  SENT: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  SENDING: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  SCHEDULED: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  FAILED: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export default function NewsletterAdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [testModalId, setTestModalId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Generate preview HTML with actual email template
  const generatePreviewHtml = (body: string, subject: string) => {
    const LOGO_URL = "https://aistartupimpact.com/logo.png";
    const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f7fa;padding:20px 0">
    <tr>
      <td align="center" style="padding:0 15px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08)">
          
          <!-- Header with Logo and Branding -->
          <tr>
            <td style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);padding:32px 40px;text-align:center">
              <img src="${LOGO_URL}" alt="AI Startup Impact" width="180" height="45" style="display:block;margin:0 auto 16px;max-width:180px;height:auto" />
              <div style="color:#ffffff;font-size:14px;font-weight:500;letter-spacing:0.5px;text-transform:uppercase;opacity:0.95">
                India's Premier AI Newsletter
              </div>
            </td>
          </tr>
          
          <!-- Edition Info Bar -->
          <tr>
            <td style="background-color:#f8f9fb;padding:12px 40px;border-bottom:1px solid #e2e8f0">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="color:#64748b;font-size:13px;font-weight:500">
                    📬 Weekly Edition
                  </td>
                  <td align="right" style="color:#64748b;font-size:13px;font-weight:500">
                    ${currentDate}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding:40px 40px 32px">
              <h1 style="color:#1e293b;font-size:28px;font-weight:700;line-height:1.3;margin:0 0 24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                ${subject}
              </h1>
              
              <div style="color:#475569;font-size:16px;line-height:1.7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
                ${body || '<p style="color:#94a3b8;font-style:italic">Start typing to see your content here...</p>'}
              </div>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding:0 40px">
              <div style="border-top:2px solid #e2e8f0"></div>
            </td>
          </tr>
          
          <!-- Social Links -->
          <tr>
            <td style="padding:32px 40px;text-align:center;background-color:#f8f9fb">
              <p style="color:#64748b;font-size:14px;font-weight:600;margin:0 0 16px">
                Follow us for daily updates
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding:0 8px">
                    <a href="https://x.com/aistartupimapct" style="display:inline-block;width:36px;height:36px;background-color:#1da1f2;border-radius:50%">
                      <span style="color:#fff;font-size:18px;line-height:36px">𝕏</span>
                    </a>
                  </td>
                  <td style="padding:0 8px">
                    <a href="https://www.linkedin.com/company/ai-startup-imapact" style="display:inline-block;width:36px;height:36px;background-color:#0077b5;border-radius:50%">
                      <span style="color:#fff;font-size:18px;line-height:36px">in</span>
                    </a>
                  </td>
                  <td style="padding:0 8px">
                    <a href="https://www.youtube.com/@aistartupimpact" style="display:inline-block;width:36px;height:36px;background-color:#ff0000;border-radius:50%">
                      <span style="color:#fff;font-size:18px;line-height:36px">▶</span>
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background-color:#ffffff;border-top:1px solid #e2e8f0">
              <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 12px">
                You're receiving this because you subscribed to <strong style="color:#64748b">AI Startup Impact</strong>.<br>
                We respect your inbox and send only valuable content.
              </p>
              <p style="color:#94a3b8;font-size:12px;margin:0">
                <a href="#" style="color:#667eea;text-decoration:underline">Unsubscribe</a>
                &nbsp;•&nbsp;
                <a href="#" style="color:#667eea;text-decoration:none">Visit Website</a>
                &nbsp;•&nbsp;
                <a href="#" style="color:#667eea;text-decoration:none">Contact Us</a>
              </p>
              <p style="color:#cbd5e1;font-size:11px;margin:12px 0 0">
                © ${new Date().getFullYear()} AI Startup Impact. All rights reserved.<br>
                Bengaluru, India
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [s, c] = await Promise.all([getNewsletterStatsAction(), getCampaignsAction()]);
    if (s.success && s.data) setStats(s.data as Stats);
    if (c.success) setCampaigns((c.data as any[]).map(r => ({
      id: r.id, subject: r.subject, previewText: r.previewText || '',
      body: (r.contentJson as any)?.html || '',
      sentAt: r.sentAt, scheduledAt: r.scheduledAt,
      status: r.status, totalSent: Number(r.totalSent || 0),
      opens: Number(r.opens || 0), uniqueOpens: Number(r.uniqueOpens || 0),
      clicks: Number(r.clicks || 0), uniqueClicks: Number(r.uniqueClicks || 0),
      unsubscribes: Number(r.unsubscribes || 0),
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing({ id: '', ...empty }); setModalOpen(true); };
  const openEdit = (c: Campaign) => { setEditing({ ...c }); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditing(null); };

  const handleSave = async () => {
    if (!editing || !editing.subject.trim()) return;
    setSaving(true);
    const res = await saveCampaignAction({
      id: editing.id || undefined,
      subject: editing.subject, previewText: editing.previewText,
      body: editing.body, scheduledAt: editing.scheduledAt || undefined,
    });
    setSaving(false);
    if (res.success) { showToast('Campaign saved'); closeModal(); load(); }
    else showToast(res.error || 'Save failed', false);
  };

  const handleSend = async (id: string) => {
    setSending(id);
    const res = await sendCampaignAction(id);
    setSending(null);
    if (res.success) { showToast(`Sent to ${res.sent} subscribers`); load(); }
    else showToast(res.error || 'Send failed', false);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    const res = await deleteCampaignAction(deleteConfirm);
    setDeleteConfirm(null);
    if (res.success) { setCampaigns(prev => prev.filter(c => c.id !== deleteConfirm)); showToast('Deleted'); }
    else showToast(res.error || 'Delete failed', false);
  };

  const handleSendTest = async () => {
    if (!testModalId || !testEmail) return;
    const res = await sendTestEmailAction(testModalId, testEmail);
    setTestModalId(null); setTestEmail('');
    if (res.success) showToast('Test email sent');
    else showToast(res.error || 'Failed', false);
  };

  const statCards = stats ? [
    { label: 'Total Subscribers', value: stats.total.toLocaleString(), icon: Users },
    { label: 'Active Subscribers', value: stats.active.toLocaleString(), icon: Mail },
    { label: 'Campaigns Sent', value: stats.sentCount.toString(), icon: Send },
    { label: 'Avg Open Rate', value: `${stats.openRate}%`, icon: Eye },
    { label: 'Click-through Rate', value: `${stats.ctr}%`, icon: TrendingUp },
  ] : [];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg text-sm font-jakarta font-medium flex items-center gap-2 ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Newsletter</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Manage email campaigns and subscribers</p>
        </div>
        <button onClick={openCreate} className="btn-brand text-sm flex items-center gap-2"><Plus className="w-4 h-4" /> New Campaign</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5">
              <s.icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-3" />
              <p className="font-sora font-extrabold text-xl text-navy dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400 font-jakarta mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-visible">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-sora font-bold text-base text-navy dark:text-white">Campaigns</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50 text-left">
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Subject</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Status</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Sent To</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Opens</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden lg:table-cell">Clicks</th>
              <th className="px-6 py-3 font-jakarta font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden xl:table-cell">Unsubs</th>
              <th className="px-6 py-3 w-40"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.length === 0 && !loading && (
              <tr><td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-400 font-jakarta">No campaigns yet. Create your first one.</td></tr>
            )}
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-brand shrink-0" />
                    <div>
                      <span className="font-sora font-semibold text-sm text-navy dark:text-white line-clamp-1">{c.subject}</span>
                      {c.sentAt && <p className="text-xs text-gray-400 font-jakarta mt-0.5">{new Date(c.sentAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusStyle[c.status] || statusStyle.DRAFT}`}>
                    {c.status === 'SENT' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}{c.status}
                  </span>
                </td>
                <td className="px-6 py-4 hidden sm:table-cell"><span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{c.totalSent > 0 ? c.totalSent.toLocaleString() : '—'}</span></td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta font-semibold">{c.uniqueOpens > 0 ? c.uniqueOpens.toLocaleString() : '—'}</span>
                    {c.totalSent > 0 && c.uniqueOpens > 0 && (
                      <span className="text-xs text-gray-400 font-jakarta">{((c.uniqueOpens / c.totalSent) * 100).toFixed(1)}%</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden lg:table-cell">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta font-semibold">{c.uniqueClicks > 0 ? c.uniqueClicks.toLocaleString() : '—'}</span>
                    {c.totalSent > 0 && c.uniqueClicks > 0 && (
                      <span className="text-xs text-gray-400 font-jakarta">{((c.uniqueClicks / c.totalSent) * 100).toFixed(1)}%</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 hidden xl:table-cell">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{c.unsubscribes > 0 ? c.unsubscribes.toLocaleString() : '—'}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    {(c.status === 'DRAFT' || c.status === 'SCHEDULED') && (
                      <button onClick={() => handleSend(c.id)} disabled={sending === c.id}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors disabled:opacity-50 flex items-center gap-1">
                        {sending === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />} Send
                      </button>
                    )}
                    {c.status !== 'SENT' && (
                      <button onClick={() => setTestModalId(c.id)} title="Send test" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <FlaskConical className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                    <button onClick={() => setDeleteConfirm(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && editing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-[95vw] shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">{editing.id ? 'Edit Campaign' : 'New Campaign'}</h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                    showPreview 
                      ? 'bg-brand text-white' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Subject *</label>
                  <input type="text" className="input-field text-sm" value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} placeholder="Weekly AI Pulse #..." />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Preview Text</label>
                  <input type="text" className="input-field text-sm" value={editing.previewText} onChange={(e) => setEditing({ ...editing, previewText: e.target.value })} placeholder="Brief preview shown in inbox..." />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Email Body (HTML)</label>
                <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {/* Code Editor */}
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-jakarta font-medium">HTML Code</div>
                    </div>
                    <textarea 
                      className="input-field text-sm font-mono resize-none" 
                      rows={20} 
                      value={editing.body} 
                      onChange={(e) => setEditing({ ...editing, body: e.target.value })} 
                      placeholder="<p>Hello readers,</p><p>This week in Indian AI...</p>" 
                    />
                    <p className="text-xs text-gray-400 font-jakarta mt-2">Write HTML. It will be wrapped in the branded email template automatically.</p>
                  </div>
                  
                  {/* Enhanced Live Preview */}
                  {showPreview && (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-jakarta font-medium">Live Preview</div>
                        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                          <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={`p-1.5 rounded transition-colors ${
                              previewDevice === 'mobile' 
                                ? 'bg-white dark:bg-gray-700 text-brand shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Mobile (375px)"
                          >
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('tablet')}
                            className={`p-1.5 rounded transition-colors ${
                              previewDevice === 'tablet' 
                                ? 'bg-white dark:bg-gray-700 text-brand shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Tablet (768px)"
                          >
                            <Tablet className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={`p-1.5 rounded transition-colors ${
                              previewDevice === 'desktop' 
                                ? 'bg-white dark:bg-gray-700 text-brand shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                            }`}
                            title="Desktop (600px)"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center p-4">
                        <div 
                          className={`bg-white transition-all duration-300 ${
                            previewDevice === 'mobile' ? 'w-[375px]' : 
                            previewDevice === 'tablet' ? 'w-full max-w-[768px]' : 
                            'w-full'
                          }`}
                          style={{ 
                            height: '600px',
                            overflow: 'auto',
                            boxShadow: previewDevice !== 'desktop' ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                            borderRadius: previewDevice !== 'desktop' ? '8px' : '0'
                          }}
                        >
                          <iframe
                            srcDoc={generatePreviewHtml(editing.body, editing.subject)}
                            className="w-full h-full border-0"
                            title="Email Preview"
                            sandbox="allow-same-origin"
                          />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 font-jakarta mt-2 text-center">
                        {previewDevice === 'mobile' && '📱 Mobile view (375px) - How it looks on phones'}
                        {previewDevice === 'tablet' && '📱 Tablet view (768px) - How it looks on tablets'}
                        {previewDevice === 'desktop' && '💻 Desktop view (600px) - How it looks in email clients'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Schedule (optional)</label>
                <input type="datetime-local" className="input-field text-sm" value={editing.scheduledAt || ''} onChange={(e) => setEditing({ ...editing, scheduledAt: e.target.value || null })} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={!editing.subject || saving} className="btn-brand text-sm flex items-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Test Email Modal */}
      {testModalId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white mb-4">Send Test Email</h3>
            <input type="email" className="input-field text-sm w-full" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="test@example.com" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setTestModalId(null); setTestEmail(''); }} className="flex-1 btn-secondary text-sm">Cancel</button>
              <button onClick={handleSendTest} disabled={!testEmail} className="flex-1 btn-brand text-sm disabled:opacity-50">Send Test</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Delete Campaign?</h3>
            <p className="text-sm text-gray-500 font-jakarta mt-1">This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
