"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Save, CreditCard, Globe } from "lucide-react";

type Tab = "organization" | "preferences" | "payment";

export default function OrganizerSettingsPage() {
  const [tab, setTab] = useState<Tab>("organization");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // Organization
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Preferences
  const [notifyHost, setNotifyHost] = useState(true);
  const [notifyCalendar, setNotifyCalendar] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  useEffect(() => {
    fetch("/api/organizer/profile").then(r => r.json()).then((res) => {
      if (res.success && res.profile) {
        const p = res.profile;
        setCompany(p.company || "");
        setPhone(p.phone || "");
        setWebsite(p.website || "");
        setLinkedin(p.linkedin || "");
      }
      setLoading(false);
    });
  }, []);

  const saveOrg = async () => {
    setSaving(true); setMsg("");
    const res = await fetch("/api/organizer/profile", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, phone, website, linkedin }),
    });
    const d = await res.json();
    setMsg(d.success ? "Saved!" : d.error || "Failed");
    setSaving(false); setTimeout(() => setMsg(""), 3000);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>;

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-jakarta focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand placeholder-gray-400";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-200 font-jakarta mb-1.5";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-sora font-bold text-xl text-navy dark:text-white">Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Organizer workspace settings</p>
        </div>
        <Link href="/profile" className="text-xs text-brand hover:underline font-medium">
          Edit profile →
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800 mb-6">
        {([["organization", "Organization"], ["preferences", "Preferences"], ["payment", "Payment"]] as [Tab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${tab === id ? "text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
            {label}
            {tab === id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-t" />}
          </button>
        ))}
      </div>

      {msg && <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-jakarta ${msg.includes("!") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400" : "bg-red-50 dark:bg-red-900/20 text-red-600"}`}>{msg}</div>}

      {/* Organization */}
      {tab === "organization" && (
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Organization details</h2>
            </div>
            <div className="p-4 space-y-4 bg-white dark:bg-gray-950">
              <div>
                <label className={labelClass}>Organization / Company name</label>
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Your organization name (shown on events)" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Website</label>
                <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourorg.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>LinkedIn</label>
                <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="https://linkedin.com/company/..." className={inputClass} />
              </div>
            </div>
          </div>

          <button onClick={saveOrg} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
          </button>

          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Connected accounts</h2>
            </div>
            <div className="p-4 bg-white dark:bg-gray-950">
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Google</p>
                    <p className="text-[10px] text-gray-400">Calendar & sign-in</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences */}
      {tab === "preferences" && (
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notifications</h2>
            </div>
            <div className="p-4 space-y-2 bg-white dark:bg-gray-950">
              <Toggle label="New registrations" desc="Get notified when someone registers" checked={notifyHost} onChange={setNotifyHost} />
              <Toggle label="Calendar reminders" desc="24h before your events" checked={notifyCalendar} onChange={setNotifyCalendar} />
              <Toggle label="Weekly digest" desc="Summary of event performance" checked={notifyEmail} onChange={setNotifyEmail} />
            </div>
          </div>
        </div>
      )}

      {/* Payment */}
      {tab === "payment" && (
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment methods</h2>
            </div>
            <div className="p-8 bg-white dark:bg-gray-950 text-center">
              <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Coming soon</p>
              <p className="text-xs text-gray-400 mt-1">Accept payments for paid events and manage payouts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-2.5 cursor-pointer" onClick={() => onChange(!checked)}>
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</p>
        <p className="text-[11px] text-gray-400">{desc}</p>
      </div>
      <div className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${checked ? "bg-brand" : "bg-gray-300 dark:bg-gray-600"}`}>
        <div className={`absolute top-[3px] w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
      </div>
    </div>
  );
}
