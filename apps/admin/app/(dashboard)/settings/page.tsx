'use client';

import { useState } from 'react';
import { Settings, Globe, Palette, Bell, Shield, Save, Check } from 'lucide-react';

const sections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'seo', label: 'SEO Defaults', icon: Globe },
  { id: 'brand', label: 'Brand & Design', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
];

export default function SettingsPage() {
  const [active, setActive] = useState('general');
  const [saved, setSaved] = useState(false);
  const [siteTitle, setSiteTitle] = useState('AIStartupImpact');
  const [tagline, setTagline] = useState("India's AI Startup Ecosystem");
  const [contactEmail, setContactEmail] = useState('hello@aistartupimpact.com');
  const [twitter, setTwitter] = useState('https://twitter.com/aistartupimpact');
  const [linkedin, setLinkedin] = useState('https://linkedin.com/company/aistartupimpact');
  const [instagram, setInstagram] = useState('https://instagram.com/aistartupimpact');
  const [facebook, setFacebook] = useState('https://facebook.com/aistartupimpact');
  const [metaTitle, setMetaTitle] = useState("AIStartupImpact — India's AI Startup Ecosystem");
  const [metaDesc, setMetaDesc] = useState("Breaking news, founder stories, funding digests, and AI tool reviews from India's fastest-growing AI startup ecosystem.");
  const [ogImage, setOgImage] = useState('');
  const [autoSitemap, setAutoSitemap] = useState(true);
  const [brandColor, setBrandColor] = useState('#FF3131');
  const [darkDefault, setDarkDefault] = useState(false);
  const [notifArticle, setNotifArticle] = useState(true);
  const [notifPublish, setNotifPublish] = useState(true);
  const [notifSubscriber, setNotifSubscriber] = useState(true);
  const [notifPlacement, setNotifPlacement] = useState(true);
  const [require2FA, setRequire2FA] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className={`w-10 h-6 rounded-full relative transition-colors ${value ? 'bg-brand' : 'bg-gray-200 dark:bg-gray-700'}`}>
      <span className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-all ${value ? 'right-1' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sora font-extrabold text-2xl text-navy dark:text-white">Settings</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm font-jakarta mt-1">Configure site-wide settings</p>
        </div>
        <button onClick={handleSave} className={`text-sm flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${saved ? 'bg-green-500 text-white' : 'btn-brand'}`}>
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
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
                <input type="text" className="input-field text-sm" value={siteTitle} onChange={(e) => setSiteTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Tagline</label>
                <input type="text" className="input-field text-sm" value={tagline} onChange={(e) => setTagline(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Contact Email</label>
                <input type="email" className="input-field text-sm" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Social Links</label>
                <div className="space-y-2">
                  <input type="url" className="input-field text-sm" placeholder="Twitter URL" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
                  <input type="url" className="input-field text-sm" placeholder="LinkedIn URL" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                  <input type="url" className="input-field text-sm" placeholder="Instagram URL" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
                  <input type="url" className="input-field text-sm" placeholder="Facebook URL" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {active === 'seo' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">SEO Defaults</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Default Meta Title</label>
                <input type="text" className="input-field text-sm" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Default Meta Description</label>
                <textarea className="input-field text-sm" rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">OG Image URL</label>
                <input type="url" className="input-field text-sm" placeholder="https://cdn.aistartupimpact.com/og.webp" value={ogImage} onChange={(e) => setOgImage(e.target.value)} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Auto-generate sitemap</span>
                <Toggle value={autoSitemap} onChange={setAutoSitemap} />
              </div>
            </div>
          )}

          {active === 'brand' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Brand & Design</h2>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" className="w-10 h-10 rounded-xl border-0 cursor-pointer" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
                  <input type="text" className="input-field text-sm w-32" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} />
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
                <Toggle value={darkDefault} onChange={setDarkDefault} />
              </div>
            </div>
          )}

          {active === 'notifications' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Notifications</h2>
              {[
                { label: 'New article submitted', value: notifArticle, set: setNotifArticle },
                { label: 'Article published', value: notifPublish, set: setNotifPublish },
                { label: 'New subscriber', value: notifSubscriber, set: setNotifSubscriber },
                { label: 'Placement booked', value: notifPlacement, set: setNotifPlacement },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">{n.label}</span>
                  <Toggle value={n.value} onChange={n.set} />
                </div>
              ))}
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-5">
              <h2 className="font-sora font-bold text-lg text-navy dark:text-white">Security</h2>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-jakarta">Require 2FA for admins</span>
                <Toggle value={require2FA} onChange={setRequire2FA} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">Session Timeout (minutes)</label>
                <input type="number" className="input-field text-sm w-32" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5 block font-jakarta">API Key</label>
                <input type="text" className="input-field text-sm font-mono" defaultValue="sk-aisi-••••••••••••" readOnly />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
