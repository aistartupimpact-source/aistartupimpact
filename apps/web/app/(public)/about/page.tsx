import Link from 'next/link';
import { Info, Mail, MapPin, Users, ChevronRight, Handshake, Award, Globe, Target } from 'lucide-react';

const stats = [
  { value: '50K+', label: 'Monthly Readers' },
  { value: '500+', label: 'AI Tools Listed' },
  { value: '3,200+', label: 'Startups Tracked' },
  { value: '5,000+', label: 'Newsletter Subscribers' },
];

const team = [
  { name: 'Priya Sharma', role: 'Editor-in-Chief', bio: 'Former YourStory, IIT Madras' },
  { name: 'Rahul Kumar', role: 'Senior AI Reporter', bio: 'Deep tech & LLMs coverage' },
  { name: 'Anjali Nair', role: 'Funding & Startups', bio: 'Former Inc42, tracks VC deals' },
  { name: 'Vikram Patel', role: 'Tools & Dev', bio: 'Developer, builds what he reviews' },
];

const values = [
  { icon: Target, title: 'India-First Focus', desc: 'Every story through the lens of the Indian AI ecosystem.' },
  { icon: Award, title: 'Editorial Independence', desc: 'No pay-to-play. Our reviews and ratings are always honest.' },
  { icon: Handshake, title: 'Founder-Friendly', desc: 'We celebrate builders and tell stories worth telling.' },
  { icon: Globe, title: 'Open & Accessible', desc: 'Core content is free. Knowledge should not be paywalled.' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      {/* Hero */}
      <div className="text-center mb-10 sm:mb-14">
        <span className="inline-flex items-center gap-1.5 text-brand text-xs font-bold uppercase tracking-wider mb-3">
          <Info className="w-3.5 h-3.5" /> About Us
        </span>
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-[42px] md:leading-tight text-navy dark:text-white max-w-2xl mx-auto">
          India&apos;s definitive source for AI startup intelligence
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-4 max-w-xl mx-auto leading-relaxed">
          AIStartupImpact is an independent media platform covering India&apos;s AI ecosystem — from seed stage startups to billion-dollar unicorns. We help founders, investors, and engineers make informed decisions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="font-sora font-extrabold text-2xl text-brand">{s.value}</div>
            <div className="text-xs text-gray-400 font-jakarta mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Values */}
      <h2 className="section-title justify-center mb-8">Our Values</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
        {values.map((v) => (
          <div key={v.title} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
              <v.icon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{v.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Team */}
      <h2 className="section-title justify-center mb-8">Our Team</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {team.map((t) => (
          <div key={t.name} className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-lg text-brand font-bold font-sora shrink-0">
              {t.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{t.name}</h3>
              <p className="text-xs text-brand font-jakarta font-semibold">{t.role}</p>
              <p className="text-xs text-gray-400 font-jakarta mt-0.5">{t.bio}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="card p-6 sm:p-8 text-center bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/15 dark:to-gray-900">
        <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Get in Touch</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1.5 max-w-md mx-auto">
          For partnerships, advertising, press, or general inquiries.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <a href="mailto:hello@aistartupimpact.com" className="btn-brand text-sm flex items-center gap-2">
            <Mail className="w-4 h-4" /> hello@aistartupimpact.com
          </a>
        </div>
      </div>
    </div>
  );
}
