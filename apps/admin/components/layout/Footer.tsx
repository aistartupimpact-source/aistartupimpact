import Link from 'next/link';
import { Mail, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';

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
    ],
  },
];

const socials = [
  { icon: Twitter, href: 'https://twitter.com/aistartupimpact', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com/company/aistartupimpact', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://instagram.com/aistartupimpact', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/aistartupimpact', label: 'Facebook' },
];

export default function Footer() {
  return (
    <footer className="bg-navy dark:bg-gray-950 border-t border-gray-800 dark:border-gray-800">
      {/* Newsletter CTA Strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h3 className="font-sora font-extrabold text-xl sm:text-2xl text-white">
                Stay ahead of India&apos;s AI revolution
              </h3>
              <p className="text-gray-400 text-sm font-jakarta mt-1.5">
                Weekly insights on AI tools, funding, and founder stories. Free forever.
              </p>
            </div>
            <div className="flex w-full sm:w-auto gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 sm:w-56 px-4 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-brand font-jakarta text-sm min-h-[44px]"
              />
              <button className="btn-brand whitespace-nowrap text-sm">
                Subscribe
              </button>
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
