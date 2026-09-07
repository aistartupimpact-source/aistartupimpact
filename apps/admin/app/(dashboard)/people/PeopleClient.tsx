"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Download, ChevronLeft, ChevronRight, X, Shield, Rocket, CalendarDays } from "lucide-react";
import { ConfirmModal } from '@/components/ConfirmModal';

interface Person {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastWorkspace: string;
  founderId?: string;
  founderCompany?: string;
  founderStatus?: string;
  organizerId?: string;
  organizerCompany?: string;
  organizerStatus?: string;
  startupCount?: number;
  toolCount?: number;
  eventCount?: number;
  totalRegistrations?: number;
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "founders", label: "Founders" },
  { key: "organizers", label: "Organizers" },
  { key: "community", label: "Community" },
  { key: "web_users", label: "Web Users" },
  { key: "2fa", label: "2FA" },
  { key: "suspended", label: "Suspended" },
];

export default function PeopleClient() {
  const [people, setPeople] = useState<Person[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Person | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const fetchPeople = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), filter });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/people?${params}`);
      const data = await res.json();
      if (data.success) {
        setPeople(data.people);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch {}
    setLoading(false);
  }, [page, filter, search]);

  useEffect(() => { fetchPeople(); }, [fetchPeople]);

  const fetchDetail = async (person: Person) => {
    setSelected(person);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/people/${person.id}`);
      const data = await res.json();
      if (data.success) setDetail(data);
    } catch {}
    setDetailLoading(false);
  };

  const handleAction = async (action: string) => {
    if (!selected) return;
    setPendingAction(action);
  };

  const executeAction = async () => {
    if (!selected || !pendingAction) return;
    try {
      await fetch(`/api/admin/people/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: pendingAction }),
      });
      fetchPeople();
      setSelected(null);
      setDetail(null);
    } catch {}
    setPendingAction(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPeople();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">People</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total users across all workspaces</p>
        </div>
        <a
          href="/api/admin/people/export"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </form>
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f.key
                  ? "bg-brand text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Email</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Workspaces</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Activity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : people.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No results</td></tr>
              ) : (
                people.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => fetchDetail(p)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                          {p.avatar ? (
                            <img src={p.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-semibold text-gray-500">{(p.name || "?").charAt(0)}</span>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{p.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {p.founderId && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded">F</span>
                        )}
                        {p.organizerId && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded">O</span>
                        )}
                        {(p as any).userSource === "web_user" && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">W</span>
                        )}
                        {!p.founderId && !p.organizerId && (p as any).userSource !== "web_user" && (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.startupCount ? `${p.startupCount} startup${p.startupCount > 1 ? "s" : ""}` : ""}
                      {p.startupCount && p.eventCount ? ", " : ""}
                      {p.eventCount ? `${p.eventCount} event${p.eventCount > 1 ? "s" : ""}` : ""}
                      {!p.startupCount && !p.eventCount && "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Confirm Modal */}
      <ConfirmModal
        open={!!pendingAction}
        onClose={() => setPendingAction(null)}
        onConfirm={executeAction}
        title={`${(pendingAction || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Account`}
        message={`Are you sure you want to ${(pendingAction || '').replace('_', ' ')} this account?`}
        confirmLabel={(pendingAction || '').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
        variant="warning"
      />

      {/* Detail Slide-out */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setSelected(null); setDetail(null); }} />
          <div className="relative w-full max-w-md bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">{selected.name}</h2>
              <button onClick={() => { setSelected(null); setDetail(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : detail ? (
              <div className="p-5 space-y-6">
                {/* Identity */}
                <section>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Identity</h3>
                  <div className="space-y-2 text-sm">
                    <Row label="Email" value={detail.person.email} />
                    <Row label="Verified" value={detail.person.emailVerified ? "Yes" : "No"} />
                    <Row label="2FA" value={detail.person.twoFactorEnabled ? (detail.person.twoFactorInherited ? "Yes (inherited)" : "Yes") : "No"} />
                    <Row label="Auth" value={detail.person.googleId ? "Email + Google" : "Email/Password"} />
                    <Row label="Last workspace" value={detail.person.lastWorkspace || "Community"} />
                    <Row label="Joined" value={detail.person.createdAt ? new Date(detail.person.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
                  </div>
                </section>

                {/* Founder Workspace */}
                {detail.person.founderId && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                      <Rocket className="w-3.5 h-3.5 text-purple-500" /> Founder Workspace
                    </h3>
                    <div className="space-y-2 text-sm">
                      <Row label="Status" value={detail.person.founderStatus} />
                      <Row label="Company" value={detail.person.founderCompany || "—"} />
                      <Row label="Startups" value={String(detail.startups?.length || 0)} />
                    </div>
                    {detail.startups?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {detail.startups.map((s: any) => (
                          <li key={s.id} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${s.isVerified ? "bg-green-500" : "bg-gray-300"}`} />
                            {s.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {/* Organizer Workspace */}
                {detail.person.organizerId && (
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Organizer Workspace
                    </h3>
                    <div className="space-y-2 text-sm">
                      <Row label="Status" value={detail.person.organizerStatus} />
                      <Row label="Events" value={String(detail.events?.length || 0)} />
                    </div>
                    {detail.events?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {detail.events.map((e: any) => (
                          <li key={e.id} className="text-xs text-gray-600 dark:text-gray-400">
                            {e.title} — {e.registrationCount} regs
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}

                {/* Actions */}
                <section className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {detail.person.founderStatus === "SUSPENDED" || detail.person.organizerStatus === "SUSPENDED" ? (
                      <button onClick={() => handleAction("unsuspend")} className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                        Unsuspend
                      </button>
                    ) : (
                      <button onClick={() => handleAction("suspend")} className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                        Suspend
                      </button>
                    )}
                    {detail.person.founderId && (
                      <button onClick={() => handleAction("unlink_founder")} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Unlink Founder
                      </button>
                    )}
                    {detail.person.organizerId && (
                      <button onClick={() => handleAction("unlink_organizer")} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        Unlink Organizer
                      </button>
                    )}
                  </div>
                </section>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
