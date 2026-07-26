"use client";
import { useState, useEffect } from "react";
import { Loader2, Save, Building2 } from "lucide-react";
export default function OrganizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState({ name: "", company: "", bio: "", website: "", linkedin: "", phone: "" });
  useEffect(() => { fetch("/api/organizer/profile").then(r => r.json()).then(d => { if (d.success) setData(d.profile); setLoading(false); }); }, []);
  const handleSave = async () => { setSaving(true); setMessage(""); const res = await fetch("/api/organizer/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); const r = await res.json(); setMessage(r.success ? "Saved!" : r.error || "Failed"); setSaving(false); setTimeout(() => setMessage(""), 3000); };
  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>;
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="font-sora font-extrabold text-xl text-navy dark:text-white">Organization</h1><p className="text-sm text-gray-500 font-jakarta mt-0.5">Your public organizer profile</p></div>{message && <span className={`text-xs font-jakarta ${message==="Saved!"?"text-green-600":"text-red-500"}`}>{message}</span>}</div>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center"><Building2 className="w-7 h-7 text-brand" /></div><div><p className="text-sm font-semibold text-gray-700 dark:text-gray-200 font-jakarta">{data.name || "Your Organization"}</p><p className="text-xs text-gray-400 font-jakarta">Logo upload coming soon</p></div></div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">Name *</label><input type="text" value={data.name} onChange={e => setData(p => ({...p, name: e.target.value}))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" /></div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">Company</label><input type="text" value={data.company} onChange={e => setData(p => ({...p, company: e.target.value}))} placeholder="e.g. AI Startup Impact" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand" /></div>
        <div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">Bio</label><textarea value={data.bio} onChange={e => setData(p => ({...p, bio: e.target.value}))} rows={3} placeholder="About your organization..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30 resize-y" maxLength={500} /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">Website</label><input type="url" value={data.website} onChange={e => setData(p => ({...p, website: e.target.value}))} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30" /></div><div><label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 font-jakarta">LinkedIn</label><input type="url" value={data.linkedin} onChange={e => setData(p => ({...p, linkedin: e.target.value}))} placeholder="https://linkedin.com/..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/30" /></div></div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-brand hover:bg-brand-600 text-white font-bold font-jakarta text-sm rounded-xl disabled:opacity-50 flex items-center gap-2">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes</button>
      </div>
    </div>
  );
}
