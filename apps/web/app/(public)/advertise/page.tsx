import Link from 'next/link';
import {
  Megaphone, Users, BarChart3, Globe, Mail, ArrowRight, Check,
  Zap, Newspaper, TrendingUp, Star, BookOpen, IndianRupee, Crown,
} from 'lucide-react';

/* ── Audience Stats ─────────────────────── */
const stats = [
  { value: '50K+', label: 'Monthly Pageviews', icon: BarChart3 },
  { value: '5,000+', label: 'Newsletter Subscribers', icon: Mail },
  { value: '68%', label: 'Founder/CTO Audience', icon: Users },
  { value: '4.2 min', label: 'Avg. Time on Page', icon: Globe },
];

/* ── Placement Zones ────────────────────── */
const placements = [
  {
    tier: 'Premium',
    color: 'from-brand to-red-600',
    badge: '🔴 Highest Visibility',
    zones: [
      {
        name: 'Hero Cover Story',
        icon: Crown,
        location: 'Homepage — top of page, full-width',
        description: 'Your startup story featured as the main cover story with gradient overlay. Every single visitor sees this first.',
        metric: '100% viewability',
      },
      {
        name: 'Breaking Ticker',
        icon: Zap,
        location: 'Homepage — below hero, auto-rotating',
        description: 'Your headline in the live ticker that rotates across the site. Persistent visibility on every page load.',
        metric: 'Seen on every pageview',
      },
      {
        name: 'Newsletter Featured Story',
        icon: Mail,
        location: 'Weekly newsletter — top position',
        description: 'Your story as the lead article in our newsletter sent to 5,000+ founders, CTOs, and investors.',
        metric: '42% open rate',
      },
    ],
  },
  {
    tier: 'Growth',
    color: 'from-orange-500 to-amber-500',
    badge: '🟠 High Visibility',
    zones: [
      {
        name: 'Latest Stories — Card #1',
        icon: Newspaper,
        location: 'Homepage — first card in the 3-column grid',
        description: 'Your story as the first card in the Latest Stories section, right below the hero. Prime editorial real estate.',
        metric: 'Above the fold',
      },
      {
        name: '#1 Editor\'s Pick',
        icon: Star,
        location: 'Tools page — top-ranked position',
        description: 'Your AI tool featured as the #1 Editor\'s Pick with our editorial verdict and review. Reaches builders actively evaluating tools.',
        metric: 'Highest CTR on /tools',
      },
      {
        name: 'Featured Founder Story',
        icon: BookOpen,
        location: 'Stories page — featured position',
        description: 'A deep-dive editorial piece on your startup\'s journey, featured prominently on the Stories listing page.',
        metric: '15 min avg. read time',
      },
      {
        name: 'Featured Funding Deal',
        icon: IndianRupee,
        location: 'Funding Digest — lead deal',
        description: 'Your funding round featured as the lead deal in our weekly Funding Digest, read by VCs and angel investors.',
        metric: 'Reaches investor audience',
      },
    ],
  },
  {
    tier: 'Starter',
    color: 'from-blue-500 to-cyan-500',
    badge: '🔵 Solid Visibility',
    zones: [
      {
        name: 'Latest Stories — Card #2 or #3',
        icon: Newspaper,
        location: 'Homepage — story grid cards',
        description: 'Your story featured in the Latest Stories grid on the homepage. Visible above the fold on desktop.',
        metric: 'Above the fold',
      },
      {
        name: 'News Feed Listing',
        icon: TrendingUp,
        location: 'News page — regular article card',
        description: 'Your story as a regular article card in the news feed. Organic-looking placement that blends with editorial content.',
        metric: 'Blends with editorial',
      },
      {
        name: 'Tools Ranking (#2-5)',
        icon: Star,
        location: 'Tools page — ranked positions',
        description: 'Your AI tool ranked in positions #2 through #5 on the Editor\'s Picks page with full review and verdict.',
        metric: 'Targeted builder audience',
      },
      {
        name: 'Newsletter Mention',
        icon: Mail,
        location: 'Weekly newsletter — brief mention',
        description: 'A brief mention of your startup in our weekly newsletter with a link to your full story or product page.',
        metric: '5,000+ subscribers',
      },
    ],
  },
];

/* ── Pricing Packages ───────────────────── */
const packages = [
  {
    name: 'Starter',
    price: '₹15,000',
    period: '/month',
    description: 'Get your startup story in front of India\'s AI community',
    color: 'border-blue-200 dark:border-blue-800',
    features: [
      'Story in Latest Stories grid (position #2 or #3)',
      'News feed listing on /news page',
      'Brief mention in weekly newsletter',
      'Tools ranking #2-5 (if applicable)',
      '1 story per month',
      'Basic analytics report',
    ],
  },
  {
    name: 'Growth',
    price: '₹35,000',
    period: '/month',
    popular: true,
    description: 'Premium placement with editorial-quality storytelling',
    color: 'border-brand',
    features: [
      'Everything in Starter, plus:',
      'Latest Stories — Card #1 position',
      '#1 Editor\'s Pick (tools)',
      'Featured Founder Story on /stories',
      'Featured deal in Funding Digest',
      '2 stories per month',
      'Detailed analytics dashboard',
    ],
  },
  {
    name: 'Premium',
    price: '₹75,000',
    period: '/month',
    description: 'Maximum visibility — own the homepage',
    color: 'border-orange-200 dark:border-orange-800',
    features: [
      'Everything in Growth, plus:',
      'Hero Cover Story on homepage',
      'Breaking Ticker headline',
      'Newsletter lead story (5K+ subscribers)',
      'Unlimited stories per month',
      'Dedicated account manager',
      'Priority editorial support',
      'Custom analytics & ROI report',
    ],
  },
];

/* ── Audience Breakdown ─────────────────── */
const audience = [
  { segment: 'Startup Founders & CTOs', pct: 35 },
  { segment: 'ML/AI Engineers', pct: 25 },
  { segment: 'VC & Angel Investors', pct: 18 },
  { segment: 'Product Managers', pct: 12 },
  { segment: 'Tech Journalists & Analysts', pct: 10 },
];

export default function AdvertisePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ─── Hero ────────────────── */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-brand" />
          <span className="text-xs font-bold uppercase tracking-widest text-brand font-jakarta">Advertise</span>
        </div>
        <h1 className="font-sora font-extrabold text-3xl sm:text-4xl md:text-5xl text-navy dark:text-white leading-tight">
          Put your startup story<br className="hidden sm:block" /> in front of India&apos;s AI decision-makers
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-base sm:text-lg mt-4 max-w-2xl mx-auto leading-relaxed">
          We don&apos;t run banner ads. We feature your startup as editorial content — placed in premium positions based on your plan. Real stories, real engagement.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <Link href="/client-portal" className="btn-brand text-sm">
            Get Started <ArrowRight className="w-4 h-4 ml-1 inline" />
          </Link>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-jakarta">
            ads@aistartupimpact.com
          </span>
        </div>
      </div>

      {/* ─── Stats Bar ───────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-12 sm:mb-16">
        {stats.map((s) => (
          <div key={s.label} className="card p-4 sm:p-5 text-center">
            <s.icon className="w-5 h-5 text-brand mx-auto mb-2" />
            <div className="font-sora font-extrabold text-xl sm:text-2xl text-brand">{s.value}</div>
            <div className="text-[11px] text-gray-400 font-jakarta mt-1 uppercase tracking-wider font-bold">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ─── How It Works ────────── */}
      <div className="card p-6 sm:p-8 mb-12 sm:mb-16 bg-gradient-to-r from-brand-50/50 to-white dark:from-brand-900/10 dark:to-gray-900 border-l-4 border-l-brand">
        <h2 className="font-sora font-bold text-lg sm:text-xl text-navy dark:text-white mb-3">
          How It Works
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed mb-4">
          Unlike traditional media sites, we don&apos;t sell banner ads or display ads. Instead, we feature your startup as <strong>native editorial content</strong> — placed in premium positions across our site and newsletter. Higher-tier plans get more visible placements.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Choose Your Plan', desc: 'Pick Starter, Growth, or Premium based on the visibility you need.' },
            { step: '2', title: 'We Write Your Story', desc: 'Our editorial team crafts an engaging feature article about your startup.' },
            { step: '3', title: 'Premium Placement', desc: 'Your story goes live in the positions guaranteed by your plan.' },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm font-bold font-sora shrink-0">
                {s.step}
              </div>
              <div>
                <h4 className="font-sora font-bold text-sm text-navy dark:text-white">{s.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Placement Zones ─────── */}
      <div className="mb-12 sm:mb-16">
        <div className="text-center mb-8">
          <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">
            Placement Zones
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm mt-2 max-w-lg mx-auto">
            Your startup story is placed in specific positions based on your plan tier. Here&apos;s every zone available.
          </p>
        </div>

        <div className="space-y-8">
          {placements.map((tier) => (
            <div key={tier.tier}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${tier.color}`} />
                <h3 className="font-sora font-bold text-lg text-navy dark:text-white">{tier.tier} Tier</h3>
                <span className="text-xs text-gray-400 font-jakarta">{tier.badge}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tier.zones.map((zone) => (
                  <div key={zone.name} className="card p-4 sm:p-5 group hover:border-brand/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
                        <zone.icon className="w-5 h-5 text-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-sora font-bold text-sm text-navy dark:text-white">{zone.name}</h4>
                        <p className="text-[11px] text-brand font-jakarta font-semibold mt-0.5">{zone.location}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-2 leading-relaxed">{zone.description}</p>
                        <div className="mt-2">
                          <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                            {zone.metric}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Pricing ─────────────── */}
      <div className="mb-12 sm:mb-16">
        <div className="text-center mb-8">
          <h2 className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white">
            Pricing
          </h2>
          <p className="text-gray-500 dark:text-gray-400 font-jakarta text-sm mt-2">
            Simple, transparent pricing. No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`card p-5 sm:p-6 border-2 ${pkg.color} relative ${pkg.popular ? 'ring-2 ring-brand/20' : ''}`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 badge-brand text-[10px]">Most Popular</span>
              )}
              <h3 className="font-sora font-bold text-lg text-navy dark:text-white">{pkg.name}</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-jakarta mt-1">{pkg.description}</p>
              <div className="mt-4 mb-5">
                <span className="font-sora font-extrabold text-3xl text-brand">{pkg.price}</span>
                <span className="text-sm text-gray-400 font-jakarta">{pkg.period}</span>
              </div>
              <ul className="space-y-2.5">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 font-jakarta">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/client-portal"
                className={`block text-center mt-6 py-2.5 rounded-xl text-sm font-bold transition-colors ${pkg.popular
                  ? 'btn-brand'
                  : 'border border-gray-200 dark:border-gray-700 text-navy dark:text-white hover:border-brand hover:text-brand'
                  }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Audience Breakdown ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-brand" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Our Audience</h3>
          </div>
          <div className="space-y-4">
            {audience.map((a) => (
              <div key={a.segment}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-jakarta text-gray-700 dark:text-gray-300">{a.segment}</span>
                  <span className="text-sm font-sora font-bold text-brand">{a.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full" style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <Globe className="w-5 h-5 text-brand" />
            <h3 className="font-sora font-bold text-lg text-navy dark:text-white">Why Native Content?</h3>
          </div>
          <div className="space-y-4">
            {[
              { title: 'No banner blindness', desc: 'Your story looks and reads like editorial content — readers actually engage with it.' },
              { title: '10x higher CTR than display ads', desc: 'Native content placements get 10x more clicks than traditional banner ads.' },
              { title: 'Trust through editorial quality', desc: 'Our editorial team writes your story — it carries the credibility of our publication.' },
              { title: 'Permanent SEO value', desc: 'Your story stays live forever, ranking in search and driving long-term organic traffic.' },
              { title: 'Targeted audience', desc: '68% of our readers are founders, CTOs, or engineers actively building with AI.' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-sora font-bold text-sm text-navy dark:text-white">{item.title}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Final CTA ───────────── */}
      <div className="card p-6 sm:p-8 text-center bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/15 dark:to-gray-900">
        <h2 className="font-sora font-extrabold text-xl sm:text-2xl text-navy dark:text-white">
          Ready to feature your startup?
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-2 max-w-md mx-auto">
          Contact us to discuss the best placement for your story. We&apos;ll help you reach India&apos;s most engaged AI audience.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-5">
          <Link href="/client-portal" className="btn-brand text-sm">
            Get Started <ArrowRight className="w-4 h-4 ml-1 inline" />
          </Link>
          <span className="text-xs text-gray-400 font-jakarta">or email ads@aistartupimpact.com</span>
        </div>
      </div>
    </div>
  );
}
