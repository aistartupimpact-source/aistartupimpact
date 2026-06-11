import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@aistartupimpact/database';
import {
  Mail, BookOpen, Building2, Wrench, TrendingUp,
  MapPin, Eye, ShieldCheck, Users, Unlock, ChevronRight, Handshake,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About AIStartupImpact — One Place to Track the AI Startup Ecosystem',
  description:
    "AIStartupImpact is an independent platform tracking India's AI ecosystem — founder stories, startup discovery, funding rounds, and AI tools. Built by Lahori Venkatesh.",
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About AIStartupImpact — One Place to Track the AI Startup Ecosystem',
    description:
      "AIStartupImpact is an independent platform tracking India's AI ecosystem — founder stories, startup discovery, funding rounds, and AI tools.",
    url: 'https://aistartupimpact.com/about',
  },
};

// ── Fetch live counts from DB ─────────────────────────────────────────────────
async function getLiveCounts() {
  try {
    const [startups, tools, subscribers, pageViewData] = await Promise.all([
      prisma.startup.count(),
      prisma.aiTool.count({ where: { status: 'APPROVED' } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      // Unique sessions in the last 30 days as "monthly visitors"
      prisma.$queryRaw<[{ unique_visitors: bigint }]>`
        SELECT COUNT(DISTINCT "sessionHash") AS unique_visitors
        FROM "PageView"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
      `,
    ]);

    const monthlyVisitors = Number((pageViewData as any)[0]?.unique_visitors ?? 0);

    return { startups, tools, subscribers, monthlyVisitors };
  } catch {
    // Graceful fallback — never break the page
    return { startups: 0, tools: 0, subscribers: 0, monthlyVisitors: 0 };
  }
}

// ── Format number display ─────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
  return n > 0 ? `${n}+` : '—';
}

// ── Static content ────────────────────────────────────────────────────────────
const sections = [
  {
    icon: BookOpen,
    title: 'Founder Stories',
    desc: 'In-depth profiles of the people building AI startups — their journeys, decisions, and lessons. The stories behind the products, told first-hand.',
    href: '/stories',
  },
  {
    icon: Building2,
    title: 'AI Startups Directory',
    desc: 'A structured, searchable directory of AI startups — teams, technology, stage, and funding. Built so promising startups get discovered, not buried.',
    href: '/startups',
  },
  {
    icon: Wrench,
    title: 'AI Tools Directory',
    desc: 'A catalogue of AI tools and products, reviewed independently and organized for discovery. Find what works, with ratings that are never paid for.',
    href: '/tools',
  },
  {
    icon: TrendingUp,
    title: 'Funding Dashboard',
    desc: 'A live view of AI startup funding — rounds, investors, and the trends shaping where capital is moving across the ecosystem.',
    href: '/funding',
  },
  {
    icon: MapPin,
    title: 'IndiaAI',
    desc: "A dedicated hub for India's AI landscape — policy, government schemes, support programs, and resources that founders and operators need to know.",
    href: '/india-ai',
  },
];

const values = [
  {
    icon: Eye,
    title: 'Visibility for the overlooked',
    desc: 'We exist to surface the startups that crowded global platforms miss. The quality of the work matters more than the size of the marketing budget.',
  },
  {
    icon: ShieldCheck,
    title: 'Editorial independence',
    desc: "No pay-to-play listings. No sponsored reviews dressed up as coverage. No startup earns a better spot by paying for it. Our independence is what makes us worth trusting.",
  },
  {
    icon: Users,
    title: 'Founder-first',
    desc: 'We build for the people building. The founder figuring out their next move matters as much to us as the investor writing the cheque.',
  },
  {
    icon: Unlock,
    title: 'Open and accessible',
    desc: "Core content stays free. The directories, the stories, and the funding dashboard aren't paywalled — because a more visible ecosystem is a stronger one.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function AboutPage() {
  const counts = await getLiveCounts();

  const stats = [
    { value: '25K+', label: 'LinkedIn Followers' },
    {
      value: counts.monthlyVisitors > 0 ? fmt(counts.monthlyVisitors) : '50K+',
      label: 'Monthly Visitors',
    },
    {
      value: counts.subscribers > 0 ? fmt(counts.subscribers) : '5,000+',
      label: 'Newsletter Subscribers',
    },
    {
      value: counts.startups > 0 ? fmt(counts.startups) : '3,200+',
      label: 'AI Startups Listed',
    },
    {
      value: counts.tools > 0 ? fmt(counts.tools) : '500+',
      label: 'AI Tools Listed',
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-10 sm:py-16">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="text-center mb-12 sm:mb-16" aria-labelledby="about-hero-heading">
        <span className="inline-block text-brand text-[11px] font-bold uppercase tracking-widest mb-3 font-sora">
          About AIStartupImpact
        </span>
        <h1
          id="about-hero-heading"
          className="font-sora font-extrabold text-3xl sm:text-4xl md:text-[44px] md:leading-[1.15] text-navy dark:text-white max-w-3xl mx-auto"
        >
          One place to track the entire{' '}
          <span className="text-brand">AI startup ecosystem</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 font-jakarta text-base sm:text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
          AIStartupImpact is an independent platform built to give AI startups the visibility they
          deserve. From founder stories to funding rounds, from startup discovery to tool reviews —
          we bring everything into one place, and put it in front of a global audience.
        </p>
        <p className="text-gray-400 dark:text-gray-500 font-jakarta text-sm mt-4 max-w-xl mx-auto italic">
          Too many great AI startups get buried on crowded listing sites. We make sure they get seen.
        </p>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section aria-label="Platform statistics" className="mb-14 sm:mb-20">
        <h2 className="text-center font-sora font-bold text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
          At a Glance
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="card p-4 sm:p-5 text-center hover:border-brand/30 transition-colors"
            >
              <div className="font-sora font-extrabold text-2xl sm:text-3xl text-brand">{s.value}</div>
              <div className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 font-jakarta mt-1 leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vision ────────────────────────────────────────── */}
      <section className="mb-14 sm:mb-20" aria-labelledby="vision-heading">
        <span className="text-brand text-[11px] font-bold uppercase tracking-widest font-sora">
          Our Vision
        </span>
        <h2
          id="vision-heading"
          className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mt-2 mb-5"
        >
          Give every AI startup the visibility it deserves
        </h2>
        <div className="space-y-4 font-jakarta text-gray-600 dark:text-gray-400 text-base leading-relaxed">
          <p>
            {"India's AI ecosystem is booming. New startups launch every week, solving real problems and building genuinely original technology. But most of them stay invisible — buried under thousands of listings on crowded global platforms like Product Hunt, where standing out is nearly impossible and regional builders rarely break through."}
          </p>
          <p className="font-semibold text-navy dark:text-white">
            {"We believe great work shouldn't depend on who shouts the loudest."}
          </p>
          <p>
            AIStartupImpact exists to surface the AI startups that deserve attention but
            {"aren't getting it — and to carry their stories to a global audience. We're building"}{" "}
            the single, trusted place where anyone can discover what&apos;s actually being built
            in AI, who&apos;s behind it, and where it&apos;s headed.
          </p>
        </div>
      </section>

      {/* ── Mission ───────────────────────────────────────── */}
      <section className="mb-14 sm:mb-20" aria-labelledby="mission-heading">
        <span className="text-brand text-[11px] font-bold uppercase tracking-widest font-sora">
          Our Mission
        </span>
        <h2
          id="mission-heading"
          className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mt-2 mb-5"
        >
          Empower founders by bringing everything into one place
        </h2>
        <div className="space-y-4 font-jakarta text-gray-600 dark:text-gray-400 text-base leading-relaxed">
          <p>
            {"Founders shouldn't have to piece together fragments from a dozen sources to understand their own ecosystem. Who's raising, which tools work, what other founders are doing, where the opportunities are — today that information is scattered, gated, or lost in noise."}
          </p>
          <p className="font-semibold text-navy dark:text-white">
            Our mission is to consolidate it.
          </p>
          <p>
            AIStartupImpact brings together founder stories, a complete startup directory, an AI
            tools directory, and a live funding dashboard — so a founder, investor, or operator
            can understand the whole picture in one visit, without paying for access. When the
            ecosystem is easy to see, it&apos;s easier to build in.
          </p>
        </div>
      </section>

      {/* ── What You'll Find ──────────────────────────────── */}
      <section className="mb-14 sm:mb-20" aria-labelledby="features-heading">
        <h2
          id="features-heading"
          className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mb-8"
        >
          What You&apos;ll Find Here
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="card p-5 flex items-start gap-4 group hover:border-brand/40 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0 group-hover:bg-brand transition-colors">
                <item.icon className="w-5 h-5 text-brand group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-sm text-navy dark:text-white group-hover:text-brand transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Where We Show Up ──────────────────────────────── */}
      <section
        className="card p-6 sm:p-8 mb-14 sm:mb-20 bg-gradient-to-br from-brand-50 to-white dark:from-brand-900/15 dark:to-gray-900 border-brand/20"
        aria-labelledby="reach-heading"
      >
        <span className="text-brand text-[11px] font-bold uppercase tracking-widest font-sora">
          Where We Show Up
        </span>
        <h2
          id="reach-heading"
          className="font-sora font-extrabold text-xl sm:text-2xl text-navy dark:text-white mt-2 mb-4"
        >
          Visibility only matters if people actually see it
        </h2>
        <div className="space-y-4 font-jakarta text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
          <p>
            We&apos;ve built a strong presence where the AI community already is — most notably a
            LinkedIn community with{' '}
            <strong className="text-navy dark:text-white">25,000+ members</strong>, where we
            regularly share founder stories, funding rounds, and updates on AI startups.
          </p>
          <p>
            That reach is the engine behind what we do: when we feature a startup, it
            doesn&apos;t sit on a page waiting to be found. It goes out to a large, engaged
            audience of founders, investors, and operators — exactly the people who can help it
            grow.
          </p>
        </div>
      </section>

      {/* ── Values ────────────────────────────────────────── */}
      <section className="mb-14 sm:mb-20" aria-labelledby="values-heading">
        <h2
          id="values-heading"
          className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mb-8"
        >
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {values.map((v) => (
            <div key={v.title} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
                <v.icon className="w-5 h-5 text-brand" />
              </div>
              <div>
                <h3 className="font-sora font-bold text-sm text-navy dark:text-white">{v.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-jakarta mt-1 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Founder ───────────────────────────────────────── */}
      <section className="mb-14 sm:mb-20" aria-labelledby="founder-heading">
        <h2
          id="founder-heading"
          className="font-sora font-extrabold text-2xl sm:text-3xl text-navy dark:text-white mb-8"
        >
          The Founder
        </h2>
        <div className="card p-6 sm:p-8 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center text-2xl font-extrabold text-brand font-sora shrink-0">
            L
          </div>
          <div>
            <h3 className="font-sora font-extrabold text-lg sm:text-xl text-navy dark:text-white">
              Lahori Venkatesh
            </h3>
            <p className="text-brand font-jakarta font-semibold text-sm mt-0.5">
              Founder, AIStartupImpact
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-jakarta mt-1 mb-4">
              NIT Jaipur
            </p>
            <div className="space-y-3 font-jakarta text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
              <p>
                Lahori Venkatesh is the Founder of AI Startup Impact, a leading platform dedicated
                to showcasing AI startups, founders, tools, and ecosystem developments.
              </p>
              <p>
                A graduate of NIT Jaipur, he is building a global AI ecosystem that helps startups
                gain visibility, credibility, and meaningful industry connections.
              </p>
              <p>
                Through AI Startup Impact, he has reached millions of professionals worldwide and
                continues to support innovation through media, community, and strategic partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collaborate ───────────────────────────────────── */}
      <section className="mb-8 sm:mb-10" aria-labelledby="collab-heading">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Feature your startup */}
          <div className="card p-5 flex flex-col gap-3 hover:border-brand/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">
                Feature Your Startup
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1 leading-relaxed">
                Get your startup in front of 25K+ founders, investors, and operators who follow the AI ecosystem.
              </p>
            </div>
            <a
              href="mailto:contact@aistartupimpact.com?subject=Feature My Startup"
              className="mt-auto text-xs font-semibold font-jakarta text-brand hover:underline inline-flex items-center gap-1"
            >
              Get featured <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Partnership */}
          <div className="card p-5 flex flex-col gap-3 hover:border-brand/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
              <Handshake className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">
                Partner With Us
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1 leading-relaxed">
                Sponsorships, media partnerships, co-promotions, or advertising — let&apos;s build something together.
              </p>
            </div>
            <a
              href="mailto:contact@aistartupimpact.com?subject=Partnership Inquiry"
              className="mt-auto text-xs font-semibold font-jakarta text-brand hover:underline inline-flex items-center gap-1"
            >
              Start a conversation <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Share your story */}
          <div className="card p-5 flex flex-col gap-3 hover:border-brand/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-brand/10 dark:bg-brand/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="font-sora font-bold text-sm text-navy dark:text-white">
                Share Your Story
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-jakarta mt-1 leading-relaxed">
                Are you a founder with a story worth telling? We&apos;d love to hear about what you&apos;re building.
              </p>
            </div>
            <a
              href="mailto:contact@aistartupimpact.com?subject=Founder Story"
              className="mt-auto text-xs font-semibold font-jakarta text-brand hover:underline inline-flex items-center gap-1"
            >
              Pitch your story <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ── Contact ───────────────────────────────────────── */}
      <section
        className="card p-6 sm:p-10 text-center bg-gradient-to-r from-brand-50 to-white dark:from-brand-900/15 dark:to-gray-900"
        aria-labelledby="contact-heading"
      >
        <h2
          id="contact-heading"
          className="font-sora font-extrabold text-xl sm:text-2xl text-navy dark:text-white"
        >
          Get in Touch
        </h2>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 font-jakarta mt-2 max-w-lg mx-auto leading-relaxed">
          Partnerships, getting your startup featured, advertising, or a correction — we read
          every message.
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Link
            href="/contact"
            className="btn-brand text-sm flex items-center gap-2 px-5 py-2.5"
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </Link>
          <a
            href="mailto:contact@aistartupimpact.com"
            className="inline-flex items-center gap-2 text-sm font-jakarta font-semibold text-gray-600 dark:text-gray-400 hover:text-brand dark:hover:text-brand transition-colors border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-2.5"
          >
            <Mail className="w-4 h-4" />
            contact@aistartupimpact.com
          </a>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 font-jakarta mt-8 italic">
          AIStartupImpact — One place to track the AI startup ecosystem.
        </p>
      </section>

    </main>
  );
}
