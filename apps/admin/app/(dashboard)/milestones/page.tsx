"use client";

import { useState, useEffect } from "react";
import {
  Trophy, CheckCircle, Clock, Loader2, Shield, Trash2,
} from "lucide-react";

const ICONS: Record<string, string> = {
  FUNDING: "💰", LAUNCH: "🚀", PARTNERSHIP: "🤝", ACQUISITION: "🏢",
  AWARD: "🏆", HIRING: "👥", REVENUE: "📈", USER_MILESTONE: "🎯",
};

type Filter = "all" | "FOUNDER_REPORTED" | "PLATFORM_VERIFIED";

export default function AdminMilestonesPage() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [acting, setActing] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/milestones?verification=${filter}`);
      const d = await res.json();
      setMilestones(d.milestones || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filter]);

  const handleAction = async (id: string, action: string) => {
    setActing(id);
    try {
      await fetch(`/api/admin/milestones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      fetchData();
    } catch {}
    setActing(null);
  };

  const filters: { key: Filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "FOUNDER_REPORTED", label: "Unverified" },
    { key: "PLATFORM_VERIFIED", label: "Verified" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Milestones</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Verify and manage startup milestones</p>
      </div>

      <div className="flex gap-2">
        {filters.map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f.key ? "bg-brand text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
          <Trophy className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">No milestones found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Milestone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Startup</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Founder</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {milestones.map(m => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ICONS[m.type] || "📌"}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{m.title}</p>
                        <p className="text-xs text-gray-400">{m.type.replace("_", " ")}{m.amount ? ` · ${m.currency} ${Number(m.amount).toLocaleString()}` : ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{m.startup?.name || "-"}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{m.founder?.name || m.founder?.email || "-"}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{new Date(m.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {m.verificationStatus === "PLATFORM_VERIFIED" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400"><CheckCircle className="w-3.5 h-3.5" /> Verified</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400"><Clock className="w-3.5 h-3.5" /> Unverified</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {m.verificationStatus === "FOUNDER_REPORTED" ? (
                        <button onClick={() => handleAction(m.id, "verify")} disabled={acting === m.id} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 flex items-center gap-1">
                          {acting === m.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />} Verify
                        </button>
                      ) : (
                        <button onClick={() => handleAction(m.id, "unverify")} disabled={acting === m.id} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg disabled:opacity-50">
                          Unverify
                        </button>
                      )}
                      <button onClick={() => { if (confirm("Delete this milestone?")) handleAction(m.id, "delete"); }} disabled={acting === m.id} className="px-2 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs rounded-lg disabled:opacity-50">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
