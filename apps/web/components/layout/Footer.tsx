import Link from 'next/link';
import { Mail, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import SubscribeForm from '@/components/SubscribeForm';

const footerLinks = [
  {
    title: 'Content',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Founder Stories', href: '/stories' },
      { label: 'Opinion', href: '/opinion' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'AI Tools', href: '/tools' },
      { label: 'Funding Digest', href: '/funding' },
      { label: 'India AI', href: '/india-ai' },
      { label: 'Search', href: '/search' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
];

const socials = [
  { icon: Twitter, href: 'https://x.com/aistartupimapct', label: 'Twitter' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/ai-startup-imapact', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/aistartupimpact/', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/AI-Startup-Impact', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-navy dark:bg-gray-950 border-t border-gray-800 dark:border-gray-800">
      {/* Newsletter CTA Section - Redesigned */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0F2239] via-[#1A2B42] to-[#0D1B2A] rounded-2xl p-6 sm:p-8 md:p-10">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-[100px] -translate-y-32 translate-x-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand/5 rounded-full blur-[80px] translate-y-24 -translate-x-24" />

              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left Content */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-brand/10 px-3 py-1.5 rounded-full mb-4">
                      <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                      <span className="text-brand text-xs font-bold uppercase tracking-wider font-jakarta">
                        Free Weekly
                      </span>
                    </div>

                    <h3 className="font-sora font-extrabold text-2xl sm:text-3xl text-white leading-tight mb-3">
                      Don&apos;t miss the{' '}
                      <span className="text-brand italic">AI signal</span>
                      <span className="text-gray-400 font-normal"> in the noise</span>
                    </h3>

                    <p className="text-gray-400 text-sm sm:text-base font-jakarta leading-relaxed mb-6">
                      Every Friday — the week&apos;s most important AI funding rounds, founder stories,
                      and tool releases from India&apos;s ecosystem. Curated, not aggregated.
                    </p>

                    {/* Features - 2x2 grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0" />
                        India-first AI funding digest
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0" />
                        Exclusive founder interviews
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0" />
                        Tool reviews & recommendations
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0" />
                        Policy analysis for builders
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs font-jakarta">
                      Read by teams at{' '}
                      <span className="text-white font-medium">Google India</span>,{' '}
                      <span className="text-white font-medium">Flipkart</span> &{' '}
                      <span className="text-white font-medium">Zerodha</span>
                    </p>
                  </div>

                  {/* Right Form */}
                  <div className="lg:pl-8">
                    <div className="text-center lg:text-left mb-4">
                      <p className="text-gray-500 text-sm font-jakarta mb-4">
                        Join <span className="text-brand font-bold">5,000+</span> founders, investors & engineers
                      </p>
                    </div>

                    <div className="space-y-3">
                      <SubscribeForm
                        buttonText="Get the Weekly Digest →"
                        source="footer"
                        className="flex-col gap-3"
                      />
                    </div>

                    <div className="text-center lg:text-left mt-3 space-y-1">
                      <p className="text-gray-500 text-xs font-jakarta">
                        Every Friday. Free forever. No credit card.
                      </p>
                      <p className="text-gray-600 text-xs font-jakarta">
                        No spam. Unsubscribe in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-block">
              <span className="font-sora font-extrabold text-xl">
                <span className="text-brand">AI</span>
                <span className="text-white">StartupImpact</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm font-jakarta mt-3 leading-relaxed max-w-xs">
              India&apos;s definitive source for AI startup news, tools, funding data,
              and ecosystem intelligence.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/5 hover:bg-brand/20 flex items-center justify-center transition-colors"
                  aria-label={s.label}
                >
                  <s.icon className="w-4 h-4 text-gray-400 hover:text-brand" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-jakarta font-bold text-xs uppercase tracking-widest text-gray-500 mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm font-jakarta transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 font-jakarta">
            <span>&copy; {new Date().getFullYear()} AIStartupImpact. All rights reserved.</span>

            <a href="https://www.producthunt.com/products/aistartupimpact?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-aistartupimpact" target="_blank" rel="noopener noreferrer" className="order-first sm:order-none mb-4 sm:mb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="AIStartupImpact - Discover, feature & grow AI startups in one place | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1121108&theme=light&t=1775982559914"
              />
            </a>

            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              hello@aistartupimpact.com
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
