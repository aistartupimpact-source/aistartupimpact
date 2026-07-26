"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2, Mail, Trash2, X } from "lucide-react";

const ROLES = [
  { value: "ADMIN", label: "Admin", desc: "Full access" },
  { value: "MANAGER", label: "Manager", desc: "Edit events, manage registrations" },
  { value: "STAFF", label: "Staff", desc: "Check-in, view attendees" },
  { value: "CHECK_IN", label: "Check-in Only", desc: "QR scanner only" },
];

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState("STAFF");
  const [inviting, setInviting] = useState(false);
  const [msg, setMsg] = useState("");
  const [events, setEvents] = useState<any[]>([]);
  const [invEventIds, setInvEventIds] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/organizer/team").then(r => r.json()),
      fetch("/api/organizer/events").then(r => r.json()),
    ]).then(([teamRes, evRes]) => {
      if (teamRes.success) setMembers(teamRes.members || []);
      if (evRes.success) setEvents(evRes.events || []);
      setLoading(false);
    });
  }, []);

  const handleInvite = async () => {
    if (!invEmail) return;
    setInviting(true); setMsg("");
    const res = await fetch("/api/organizer/team", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: invEmail, role: invRole, eventIds: invEventIds.length > 0 ? invEventIds : undefined }),
    });
    const d = await res.json();
    if (d.success) { setMsg("Invite sent!"); setInvEmail(""); setInvEventIds([]); setShowInvite(false); setMembers(prev => [d.member, ...prev]); }
    else setMsg(d.error || "Failed");
    setInviting(false); setTimeout(() => setMsg(""), 3000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke access for this team member?")) return;
    await fetch(`/api/organizer/team/${id}`, { method: "DELETE" });
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: "REVOKED" } : m));
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand"/></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-bold text-lg text-navy dark:text-white flex items-center gap-2"><Users className="w-5 h-5 text-brand"/> Team</h1>
          <p className="text-xs text-gray-500 font-jakarta">Invite people to help manage check-in and registrations</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="inline-flex items-center gap-1.5 px-3 py-2 bg-brand hover:bg-brand-600 text-white text-xs font-bold font-jakarta rounded-lg">
          <Plus className="w-3.5 h-3.5"/> Invite Member
        </button>
      </div>

      {msg && <p className={`text-xs font-jakarta px-3 py-2 rounded-lg ${msg.includes("sent") || msg.includes("Invite") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{msg}</p>}

      {/* Invite Modal */}
      {showInvite && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-navy dark:text-white font-sora">Invite Team Member</h2><button onClick={() => setShowInvite(false)}><X className="w-4 h-4 text-gray-400"/></button></div>
          <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Email *</label><input type="email" value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="teammate@company.com" className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20"/></div>
          <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Role</label>
            <div className="grid grid-cols-2 gap-2">{ROLES.map(r => (
              <button key={r.value} type="button" onClick={() => setInvRole(r.value)} className={`p-2.5 rounded-lg border text-left transition-all ${invRole === r.value ? "border-brand bg-brand/5" : "border-gray-200 dark:border-gray-700"}`}>
                <p className={`text-xs font-semibold font-jakarta ${invRole === r.value ? "text-brand" : "text-gray-700 dark:text-gray-200"}`}>{r.label}</p>
                <p className="text-[9px] text-gray-400 font-jakarta">{r.desc}</p>
              </button>
            ))}</div>
          </div>
          <div><label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 font-jakarta">Assign to Events <span className="normal-case">(leave empty for all)</span></label>
            <div className="max-h-32 overflow-y-auto space-y-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">{events.map((e: any) => (
              <label key={e.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <input type="checkbox" checked={invEventIds.includes(e.id)} onChange={ev => setInvEventIds(prev => ev.target.checked ? [...prev, e.id] : prev.filter(id => id !== e.id))} className="w-3.5 h-3.5 rounded text-brand focus:ring-brand"/>
                <span className="text-xs text-gray-700 dark:text-gray-200 font-jakarta">{e.title}</span>
              </label>
            ))}</div>
          </div>
          <button onClick={handleInvite} disabled={inviting || !invEmail} className="w-full py-2.5 bg-brand hover:bg-brand-600 text-white font-bold text-sm font-jakarta rounded-lg disabled:opacity-40 flex items-center justify-center gap-2">
            {inviting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Mail className="w-4 h-4"/>} Send Invite
          </button>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        {members.length === 0 ? (
          <div className="text-center py-12"><Users className="w-8 h-8 text-gray-300 mx-auto mb-2"/><p className="text-sm text-gray-400 font-jakarta">No team members yet</p></div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map(m => (
              <div key={m.id} className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center"><span className="text-xs font-bold text-brand">{m.email?.charAt(0).toUpperCase()}</span></div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 font-jakarta">{m.email}</p>
                    <p className="text-[10px] text-gray-400 font-jakarta">
                      {m.role} · {m.assignments?.length > 0 ? `${m.assignments.length} event${m.assignments.length > 1 ? "s" : ""}` : "All events"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${m.status === "ACTIVE" ? "bg-green-100 text-green-700" : m.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600"}`}>{m.status}</span>
                  {m.status !== "REVOKED" && <button onClick={() => handleRevoke(m.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5"/></button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
