'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, MinusCircle, RefreshCw, XCircle } from 'lucide-react';
import { getServiceHealthAction, getSystemStatsAction } from './actions';
import type { ServiceCheck, ServiceStatus } from './service-health';

interface SystemStats {
  articles: number; tools: number; startups: number; fundingRounds: number;
  webUsers: number; subscribers: number; team: number; campaigns: number;
  database: { connected: boolean; version: string | null; latencyMs: number | null };
  versions: { app: string; next: string; react: string; node: string; prisma: string; environment?: string };
  deployment: {
    platform: string; commit: string | null; commitUrl: string | null;
    branch: string | null; message: string | null; builtAt: string | null;
  };
}

const STATUS_STYLE: Record<ServiceStatus, { icon: typeof CheckCircle2; className: string; label: string }> = {
  ok: { icon: CheckCircle2, className: 'text-green-600 dark:text-green-400', label: 'OK' },
  warning: { icon: AlertTriangle, className: 'text-amber-600 dark:text-amber-400', label: 'Warning' },
  error: { icon: XCircle, className: 'text-red-600 dark:text-red-400', label: 'Failing' },
  not_configured: { icon: MinusCircle, className: 'text-gray-400', label: 'Not configured' },
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });

export default function SystemInfoSection() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [checks, setChecks] = useState<ServiceCheck[] | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError(null);
    try {
      const res = await getSystemStatsAction();
      if (res.success) setStats(res.data as SystemStats);
      else setStatsError(res.error || 'Failed to load system stats');
    } catch (e: any) {
      setStatsError(e?.message || 'Failed to load system stats');
    }
    setLoadingStats(false);
  }, []);

  const loadHealth = useCallback(async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await getServiceHealthAction();
      if (res.success) {
        setChecks(res.data.checks);
        setCheckedAt(res.data.checkedAt);
      } else {
        setHealthError(res.error || 'Failed to run service checks');
      }
    } catch (e: any) {
      setHealthError(e?.message || 'Failed to run service checks');
    }
    setLoadingHealth(false);
  }, []);

  const refresh = useCallback(() => { loadStats(); loadHealth(); }, [loadStats, loadHealth]);

  useEffect(() => { refresh(); }, [refresh]);

  const busy = loadingStats || loadingHealth;
  const failing = checks?.filter((c) => c.status === 'error').length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-sora font-bold text-lg text-navy dark:text-white">System Information</h2>
          {checkedAt && (
            <p className="text-xs text-gray-400 font-jakarta mt-0.5">Last checked {formatTime(checkedAt)}</p>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={busy}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50 font-jakarta"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
          {busy ? 'Checking…' : 'Refresh'}
        </button>
      </div>

      {/* Content counts */}
      {statsError ? (
        <ErrorPanel message={statsError} onRetry={loadStats} />
      ) : !stats ? (
        <LoadingPanel label="Loading system stats…" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Articles', value: stats.articles, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'AI Tools', value: stats.tools, color: 'text-indigo-600 dark:text-indigo-400' },
              { label: 'Startups', value: stats.startups, color: 'text-brand' },
              { label: 'Funding Rounds', value: stats.fundingRounds, color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Website Users', value: stats.webUsers, color: 'text-green-600 dark:text-green-400' },
              { label: 'Newsletter Subscribers', value: stats.subscribers, color: 'text-purple-600 dark:text-purple-400' },
              { label: 'Admin Team', value: stats.team, color: 'text-gray-700 dark:text-gray-300' },
              { label: 'Ad Campaigns', value: stats.campaigns, color: 'text-orange-600 dark:text-orange-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                <p className={`font-sora font-extrabold text-2xl ${stat.color}`}>{stat.value.toLocaleString()}</p>
                <p className="text-xs text-gray-400 font-jakarta mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 font-jakarta -mt-2">
            Tools count approved and featured listings; startups count approved profiles.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Database Status</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${stats.database.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">
                {stats.database.connected
                  ? `Connected to Neon PostgreSQL${stats.database.latencyMs !== null ? ` · ${stats.database.latencyMs} ms` : ''}`
                  : 'Database check failed'}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Service health */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-sora font-bold text-sm text-navy dark:text-white">Service Health</h3>
          {checks && !loadingHealth && (
            <span className={`text-xs font-semibold font-jakarta ${failing ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
              {failing ? `${failing} failing` : 'All services responding'}
            </span>
          )}
        </div>
        {healthError ? (
          <ErrorPanel message={healthError} onRetry={loadHealth} />
        ) : !checks ? (
          <LoadingPanel label="Checking services…" />
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {checks.map((check) => {
              const style = STATUS_STYLE[check.status];
              const Icon = style.icon;
              return (
                <li key={check.id} className="flex items-start gap-3 py-2.5">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${style.className}`} aria-label={style.label} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-navy dark:text-white font-jakarta">{check.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta break-words">{check.detail}</p>
                  </div>
                  {check.latencyMs !== null && (
                    <span className="text-xs text-gray-400 font-jakarta tabular-nums shrink-0">{check.latencyMs} ms</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {stats && (
        <>
          {/* Deployment */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Deployment</h3>
            <InfoList
              rows={[
                ['Platform', stats.deployment.platform],
                ['Branch', stats.deployment.branch || 'Unknown'],
                ['Commit', stats.deployment.commit ? (
                  stats.deployment.commitUrl ? (
                    <a href={stats.deployment.commitUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand hover:underline font-mono">
                      {stats.deployment.commit.slice(0, 7)} <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="font-mono">{stats.deployment.commit.slice(0, 7)}</span>
                ) : 'Unknown'],
                ...(stats.deployment.message ? [['Message', stats.deployment.message] as [string, React.ReactNode]] : []),
                ['Built', stats.deployment.builtAt ? formatTime(stats.deployment.builtAt) : 'Unknown'],
              ]}
            />
          </div>

          {/* Versions */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Version Info</h3>
            <InfoList
              rows={[
                ['Admin app', stats.versions.app],
                ['Next.js', stats.versions.next],
                ['React', stats.versions.react],
                ['Node.js', stats.versions.node],
                ['Prisma', stats.versions.prisma],
                ['PostgreSQL', stats.database.version ?? 'Unavailable'],
                ['Environment', stats.versions.environment ?? 'unknown'],
              ]}
            />
          </div>
        </>
      )}
    </div>
  );
}

function InfoList({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm font-jakarta">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
          <dd className="text-gray-700 dark:text-gray-300 font-medium break-words min-w-0">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 py-6 justify-center text-sm text-gray-400 font-jakarta">
      <Loader2 className="w-4 h-4 animate-spin" /> {label}
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4">
      <div className="flex items-start gap-2 min-w-0">
        <XCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
        <p className="text-sm text-red-700 dark:text-red-400 font-jakarta break-words">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 font-jakarta"
      >
        Retry
      </button>
    </div>
  );
}
