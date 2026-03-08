import { Check, Mail, Sparkles, BookOpen, Zap, IndianRupee, Users, Briefcase, Bell } from 'lucide-react';

const benefits = [
  { icon: BookOpen, title: 'Weekly AI Digest', desc: 'Curated roundup of the most important AI stories from India — every Friday at 9 AM IST.' },
  { icon: Zap, title: 'Tool Launches & Reviews', desc: 'Be the first to know when game-changing AI tools launch. We test so you don\'t have to.' },
  { icon: IndianRupee, title: 'Funding Alerts', desc: 'Real-time notifications when Indian AI startups raise new rounds.' },
  { icon: Users, title: 'Founder Interviews', desc: 'Exclusive interviews with the people building India\'s AI future.' },
];

const pastIssues = [
  { title: 'Issue #42 — GPT-5 Launch Special', date: 'Mar 7, 2025' },
  { title: 'Issue #41 — India AI Policy 2025 Deep Dive', date: 'Feb 28, 2025' },
  { title: 'Issue #40 — Top 10 AI Tools for Indian Developers', date: 'Feb 21, 2025' },
  { title: 'Issue #39 — Q1 Funding Report Card', date: 'Feb 14, 2025' },
];

export default function NewsletterPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 text-brand text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Newsletter
        </span>
        <h1 className="font-sora font-extrabold text-2xl sm:text-3xl md:text-[38px] md:leading-tight text-navy dark:text-white">
          The weekly briefing for<br className="hidden sm:block" /> India&apos;s AI builders
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm sm:text-base mt-3 max-w-lg mx-auto">
          Join 5,000+ founders, investors, and engineers. Free forever. No spam.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input type="email" placeholder="your@email.com" className="input-field flex-1" />
          <button className="btn-brand whitespace-nowrap">Subscribe Free</button>
        </div>
        <p className="text-[11px] text-gray-400 font-jakarta mt-3">Read by teams at Google, Flipkart, Zerodha, and 200+ AI startups.</p>
      </div>

      {/* What You Get */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {benefits.map((b) => (
          <div key={b.title} className="card p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
              <b.icon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{b.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Past Issues */}
      <h2 className="section-title mb-4">Recent Issues</h2>
      <div className="space-y-2 mb-10">
        {pastIssues.map((issue) => (
          <div key={issue.title} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Mail className="w-4 h-4 text-brand shrink-0" />
              <span className="font-jakarta text-sm text-navy dark:text-white font-medium truncate">{issue.title}</span>
            </div>
            <span className="text-xs text-gray-400 font-jakarta hidden sm:block shrink-0 ml-4">{issue.date}</span>
          </div>
        ))}
      </div>

      {/* Jobs Coming Soon */}
      <div className="card p-5 sm:p-6 border-l-4 border-l-brand bg-gradient-to-r from-brand-50/50 to-white dark:from-brand-900/10 dark:to-gray-900">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-brand" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">AI Jobs Board — Coming Soon</h3>
              <span className="text-[9px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-0.5 rounded-full uppercase">Soon</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta leading-relaxed">
              We&apos;re building a curated AI jobs board for the Indian ecosystem — ML engineers, AI researchers, startup roles, and more. Subscribe to get notified when it launches.
            </p>
            <button className="btn-brand mt-3 text-xs flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" /> Notify Me When It Launches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
