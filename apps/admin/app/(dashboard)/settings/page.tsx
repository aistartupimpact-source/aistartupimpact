'use client';

import { useState, useEffect } from 'react';
import { Settings, Globe, Palette, Bell, Shield, Save, Check, Database, Loader2 } from 'lucide-react';
import { getSettingsAction, saveSettingsAction, getSystemStatsAction } from './actions';

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'seo', label: 'SEO Defaults', icon: Globe },
  { id: 'brand', label: 'Brand & Design', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'system', label: 'System Info', icon: Database },
];

interface SettingsData {
  siteTitle: string; tagline: string; contactEmail: string;
  socialTwitter: string; socialLinkedin: string; socialInstagram: string; socialFacebook: string;
  metaTitle: string; metaDescription: string; ogImage: string; autoSitemap: boolean;
  brandColor: string; darkDefault: boolean;
  notifArticle: boolean; notifPublish: boolean; notifSubscriber: boolean; notifPlacement: boolean;
  require2FA: boolean; sessionTimeout: number;
}

interface SystemStats {
  articles: number; users: number; subscribers: number; campaigns: number;
}

export default function SettingsPage() {
  const [active, setActive] = useState('general');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsRes, statsRes] = await Promise.all([
          getSettingsAction(),
          getSystemStatsAction(),
        ]);
        console.log('Settings response:', settingsRes);
        console.log('Stats response:', statsRes);
        if (settingsRes.success) {
          setSettings(settingsRes.data as SettingsData);
        } else {
          setError(settingsRes.error || 'Failed to load settings');
        }
        if (statsRes.success) setSystemStats(statsRes.data as SystemStats);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const res = await saveSettingsAction(settings);
    setSaving(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const updateSetting = (key: keyof SettingsData, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`w-10 h-6 rounded-full relative transition-colors ${value ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${value ? 'right-1' : 'left-1'}`} />
    </button>
  );

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin text-brand" />
    </div>
  );

  if (!settings) return (
    <div className="text-center py-20">
      <p className="text-gray-400">Failed to load settings</p>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Settings</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Configure site-wide settings</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'btn-brand'}`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex gap-6">
        <div className="w-48 shrink-0 space-y-1">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-jakarta font-medium transition-colors ${active === s.id ? 'bg-brand/10 text-brand' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              <s.icon className="w-4 h-4" />{s.label}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6">
          {active === 'general' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">General Settings</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Site Title</label>
                <input type="text" className="input-field text-sm" value={settings.siteTitle} onChange={(e) => updateSetting('siteTitle', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Tagline</label>
                <input type="text" className="input-field text-sm" value={settings.tagline} onChange={(e) => updateSetting('tagline', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Contact Email</label>
                <input type="email" className="input-field text-sm" value={settings.contactEmail} onChange={(e) => updateSetting('contactEmail', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Social Links</label>
                <div className="space-y-2">
                  <input type="url" className="input-field text-sm" placeholder="Twitter URL" value={settings.socialTwitter} onChange={(e) => updateSetting('socialTwitter', e.target.value)} />
                  <input type="url" className="input-field text-sm" placeholder="LinkedIn URL" value={settings.socialLinkedin} onChange={(e) => updateSetting('socialLinkedin', e.target.value)} />
                  <input type="url" className="input-field text-sm" placeholder="Instagram URL" value={settings.socialInstagram} onChange={(e) => updateSetting('socialInstagram', e.target.value)} />
                  <input type="url" className="input-field text-sm" placeholder="Facebook URL" value={settings.socialFacebook} onChange={(e) => updateSetting('socialFacebook', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {active === 'seo' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">SEO Defaults</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Default Meta Title</label>
                <input type="text" className="input-field text-sm" value={settings.metaTitle} onChange={(e) => updateSetting('metaTitle', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Default Meta Description</label>
                <textarea className="input-field text-sm" rows={3} value={settings.metaDescription} onChange={(e) => updateSetting('metaDescription', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">OG Image URL</label>
                <input type="url" className="input-field text-sm" placeholder="https://cdn.aistartupimpact.com/og.webp" value={settings.ogImage} onChange={(e) => updateSetting('ogImage', e.target.value)} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Auto-generate sitemap</span>
                <Toggle value={settings.autoSitemap} onChange={(v) => updateSetting('autoSitemap', v)} />
              </div>
            </div>
          )}

          {active === 'brand' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Brand & Design</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="w-10 h-10 rounded-xl border-0 cursor-pointer" value={settings.brandColor} onChange={(e) => updateSetting('brandColor', e.target.value)} />
                  <input type="text" className="input-field text-sm w-32" value={settings.brandColor} onChange={(e) => updateSetting('brandColor', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Logo</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center cursor-pointer hover:border-brand transition-colors">
                  <p className="text-sm text-gray-400 font-jakarta">Click to upload logo (SVG or PNG)</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Dark mode default</span>
                <Toggle value={settings.darkDefault} onChange={(v) => updateSetting('darkDefault', v)} />
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Notifications</h2>
              {[
                { label: 'New article submitted', key: 'notifArticle' as keyof SettingsData },
                { label: 'Article published', key: 'notifPublish' as keyof SettingsData },
                { label: 'New subscriber', key: 'notifSubscriber' as keyof SettingsData },
                { label: 'Placement booked', key: 'notifPlacement' as keyof SettingsData },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{n.label}</span>
                  <Toggle value={settings[n.key] as boolean} onChange={(v) => updateSetting(n.key, v)} />
                </div>
              ))}
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Security</h2>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Require 2FA for admins</span>
                <Toggle value={settings.require2FA} onChange={(v) => updateSetting('require2FA', v)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Session Timeout (minutes)</label>
                <input type="number" className="input-field text-sm w-32" value={settings.sessionTimeout} onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">API Key</label>
                <input type="text" className="input-field text-sm font-mono" defaultValue="sk-asi-••••••••••••" readOnly />
                <p className="text-xs text-gray-400 font-jakarta mt-1">Contact support to regenerate API key</p>
              </div>
            </div>
          )}

          {active === 'system' && systemStats && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">System Information</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Total Articles', value: systemStats.articles.toLocaleString(), color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'Active Users', value: systemStats.users.toLocaleString(), color: 'text-green-600 dark:text-green-400' },
                  { label: 'Newsletter Subscribers', value: systemStats.subscribers.toLocaleString(), color: 'text-purple-600 dark:text-purple-400' },
                  { label: 'Ad Campaigns', value: systemStats.campaigns.toLocaleString(), color: 'text-orange-600 dark:text-orange-400' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
                    <p className={`font-sora font-extrabold text-2xl ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-gray-400 font-jakarta mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Database Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Connected to Neon PostgreSQL</span>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                <h3 className="font-sora font-bold text-sm text-navy dark:text-white mb-2">Version Info</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 font-jakarta">
                  <div>Platform: Next.js 14.2</div>
                  <div>Database: PostgreSQL 16</div>
                  <div>Node.js: {process.version}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}