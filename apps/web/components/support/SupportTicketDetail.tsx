'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Send, Clock, User, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Message {
  id: string;
  senderType: string;
  senderName: string;
  body: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  portal: string;
  submitterName: string;
  submitterEmail: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface SupportTicketDetailProps {
  apiBasePath: string;
  portalPath: string;
  ticketId: string;
}

const STATUS_LABELS: Record<string, string> = { OPEN: 'Open', IN_PROGRESS: 'In Progress', AWAITING_USER: 'Awaiting Your Reply', RESOLVED: 'Resolved', CLOSED: 'Closed' };
const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  AWAITING_USER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOSED: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};
const PRIORITY_COLORS: Record<string, string> = { LOW: 'text-gray-500', MEDIUM: 'text-blue-500', HIGH: 'text-orange-500', URGENT: 'text-red-500' };
const CATEGORY_LABELS: Record<string, string> = { ACCOUNT: 'Account', BILLING: 'Billing', BUG_REPORT: 'Bug Report', FEATURE_REQUEST: 'Feature Request', LISTING: 'Listing', EVENT: 'Event', JOB_BOARD: 'Job Board', OTHER: 'Other' };

export default function SupportTicketDetail({ apiBasePath, portalPath, ticketId }: SupportTicketDetailProps) {
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    try {
      const res = await fetch(`${apiBasePath}/${ticketId}`);
      const data = await res.json();
      if (data.success) setTicket(data.ticket);
      else setError('Ticket not found');
    } catch { setError('Failed to load ticket'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTicket(); }, [ticketId]);

  useEffect(() => {
    if (!ticket) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiBasePath}/${ticketId}`);
        const data = await res.json();
        if (data.success && data.ticket.messages.length !== ticket.messages.length) {
          setTicket(data.ticket);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(interval);
  }, [ticket?.messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages.length]);

  const handleSend = async () => {
    if (!reply.trim()) return;
    setSending(true); setError('');
    try {
      const res = await fetch(`${apiBasePath}/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) { setError(data.error || 'Failed to send'); return; }
      setReply('');
      fetchTicket();
    } catch { setError('Failed to send reply'); }
    finally { setSending(false); }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>;
  if (!ticket) return <div className="text-center py-16"><p className="text-sm text-gray-500">{error || 'Ticket not found'}</p></div>;

  const isClosed = ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';

  return (
    <div className="space-y-4">
      <button onClick={() => router.push(`${portalPath}/support`)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tickets
      </button>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${STATUS_COLORS[ticket.status]}`}>{STATUS_LABELS[ticket.status]}</span>
              <span className={`text-[10px] font-medium ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span>
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{ticket.subject}</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Created {formatDate(ticket.createdAt)}</span>
          <span>Category: {CATEGORY_LABELS[ticket.category] || ticket.category}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-brand/10 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-brand" />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{ticket.submitterName}</span>
              <span className="text-xs text-gray-400">{formatDate(ticket.createdAt)}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-9">{ticket.description}</p>
          </div>

          {ticket.messages.map((msg) => (
            <div key={msg.id} className={`p-4 ${msg.senderType === 'ADMIN' ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${msg.senderType === 'ADMIN' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-brand/10'}`}>
                  {msg.senderType === 'ADMIN' ? <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> : <User className="w-3.5 h-3.5 text-brand" />}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{msg.senderName}</span>
                {msg.senderType === 'ADMIN' && <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">Support</span>}
                <span className="text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-9">{msg.body}</p>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {!isClosed ? (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
            {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
            <div className="flex gap-2">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows={2}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
              />
              <button onClick={handleSend} disabled={sending || !reply.trim()} className="self-end px-4 py-2 bg-brand text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">Press Cmd+Enter to send</p>
          </div>
        ) : (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-green-50 dark:bg-green-900/10 text-center">
            <p className="text-sm text-green-700 dark:text-green-400 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> This ticket has been {ticket.status === 'RESOLVED' ? 'resolved' : 'closed'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
