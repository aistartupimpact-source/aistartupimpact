"use client";

import { useState, useEffect } from "react";
import { Users, Search, Download, Check, X, Mail, Loader2 } from "lucide-react";

export default function AttendeesPage() {
  const [regs, setRegs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetch("/api/organizer/events").then(r => r.json()).then(async evRes => {
      if (!evRes.success) { setLoading(false); return; }
      // Fetch all attendees across events
      const allRegs: any[] = [];
      for (const ev of (evRes.events || []).slice(0, 20)) {
        const r = await fetch(`/api/organizer/events/${ev.id}`);
        const d = await r.json();
        if (d.success && d.event?.registrations) {
          d.event.registrations.forEach((reg: any) => allRegs.push({ ...reg, eventTitle: ev.title, eventId: ev.id }));
        }
      }
      setRegs(allRegs);
      setLoading(false);
    });
  }, []);

  const filtered = regs.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.guestName?.toLowerCase().includes(q) || r.guestEmail?.toLowerCase().includes(q) || r.guestCompany?.toLowerCase().includes(q) || r.eventTitle?.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleSelect = (id: string) => setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const selectAll = () => { if (selected.size === filtered.length) setSelected(new Set()); else setSelected(new Set(filtered.map(r => r.id))); };

  const handleBulkAction = async () => {
    if (!bulkAction || selected.size === 0) return;
    setProcessing(true);
    const ids = Array.from(selected);
    // Process each
    for (const id of ids) {
      const reg = regs.find(r => r.id === id);
      if (!reg) continue;
      if (bulkAction === "approve") {
        await fetch(`/api/organizer/check-in`, { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ eventId: reg.eventId, input: reg.guestEmail }) });
      }
      if (bulkAction === "cancel") {
        await fetch(`/api/organizer/events/${reg.eventId}`, { method: "PUT", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ status: "CANCELLED" }) });
      }
    }
    setSelected(new Set());
    setBulkAction("");
    setProcessing(false);
    // Refresh
    window.location.reload();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand"/></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-sora font-bold text-xl text-navy dark:text-white">All Attendees</h1>
          <p className="text-xs text-gray-500 font-jakarta">{regs.length} total registrations</p>
        </div>
        <a href="/api/organizer/attendees" download className="inline-flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold font-jakarta rounded-lg"><Download className="w-3.5 h-3.5"/> Export CSV</a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, company..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-1 focus:ring-brand/20"/>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-jakarta">
          <option value="">All Status</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CHECKED_IN">Checked In</option>
          <option value="WAITLISTED">Waitlisted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <span className="text-xs text-gray-400 font-jakarta">{filtered.length} results</span>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-brand/5 border border-brand/10 rounded-lg">
          <span className="text-xs font-semibold text-brand font-jakarta">{selected.size} selected</span>
          <select value={bulkAction} onChange={e => setBulkAction(e.target.value)} className="px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 font-jakarta">
            <option value="">Action...</option>
            <option value="approve">Approve & Check-in</option>
            <option value="cancel">Cancel Registration</option>
          </select>
          <button onClick={handleBulkAction} disabled={!bulkAction || processing} className="px-3 py-1 bg-brand text-white text-xs font-bold rounded-lg disabled:opacity-40 font-jakarta">{processing ? "Processing..." : "Apply"}</button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-gray-500 font-jakarta hover:underline">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16"><Users className="w-10 h-10 text-gray-300 mx-auto mb-2"/><p className="text-sm text-gray-400 font-jakarta">No attendees found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-800/50"><tr>
                <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={selectAll} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/></th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase">Name</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase">Email</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase hidden md:table-cell">Phone</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Company</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase hidden lg:table-cell">Occupation</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase">Event</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase">Status</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-3 py-2.5"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/></td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-800 dark:text-gray-200 font-jakarta">{r.guestName}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500">{r.guestEmail}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 hidden md:table-cell">{r.guestPhone || "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 hidden lg:table-cell">{r.guestCompany || "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 hidden lg:table-cell">{r.guestOccupation || "—"}</td>
                    <td className="px-3 py-2.5 text-xs text-brand font-medium font-jakarta truncate max-w-[120px]">{r.eventTitle}</td>
                    <td className="px-3 py-2.5"><Badge status={r.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ status }: { status: string }) {
  const s: Record<string,string> = { CONFIRMED:"bg-green-100 text-green-700", CHECKED_IN:"bg-blue-100 text-blue-700", WAITLISTED:"bg-yellow-100 text-yellow-700", CANCELLED:"bg-red-100 text-red-600", PENDING_PAYMENT:"bg-gray-100 text-gray-600" };
  return <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${s[status]||s.CONFIRMED}`}>{status.replace(/_/g," ")}</span>;
}
