'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CookieSettingsLink } from '@/components/CookieConsent';
import Logo from '@/components/Logo';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Founder Stories', href: '/stories' },
      { label: 'Opinion', href: '/opinions' },
      { label: 'AI Tools', href: '/tools' },
      { label: 'Startups', href: '/startups' },
      { label: 'AI Jobs', href: '/jobs' },
      { label: 'Funding Digest', href: '/funding' },
      { label: 'Events', href: '/events' },
      { label: 'India AI', href: '/india-ai' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Advertise', href: '/advertise' },
      { label: 'Newsletter', href: '/newsletter' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Get Started',
    links: [
      { label: 'Submit Startup', href: '/submit-startup' },
      { label: 'Submit AI Tool', href: '/submit-tool' },
      { label: 'Host an Event', href: '/organizer/signup' },
      { label: 'Post a Job', href: '/employer/signup' },
      { label: 'Founder Login', href: '/auth/login' },
      { label: 'Organizer Login', href: '/organizer/login' },
      { label: 'Employer Login', href: '/employer/login' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Content Guidelines', href: '/content-guidelines' },
      { label: 'Copyright Policy', href: '/copyright' },
      { label: 'Trademark Policy', href: '/trademark' },
      { label: 'Verification Policy', href: '/verification-policy' },
      { label: 'Grievance Officer', href: '/privacy#grievance-officer' },
    ],
  },
];

const socials = [
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@aistartupimpact',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    label: 'Twitter',
    href: 'https://x.com/aistartupimpact',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/ai-startup-impact',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/aistartupimpact/',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 0C8.74 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.257 0 3.666-.014 4.947-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.256-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.256 0 12 0zm0 5.838a6.162 6.162 0 1 1 0 12.324 6.162 6.162 0 0 1 0-12.324zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" clipRule="evenodd" />
      </svg>
    )
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/aistartupimpact',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" clipRule="evenodd" />
      </svg>
    )
  }
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className={`${pathname === '/newsletter' ? 'hidden md:block' : ''} bg-black relative`}>
      {/* Red top stroke with glow */}
      <div className="h-[2px] bg-brand shadow-[0_4px_20px_rgba(239,68,68,0.5)]" />
      <div className="h-6 bg-gradient-to-b from-brand/15 to-transparent" />
      {/* Link Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6 sm:pb-12">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-3 sm:col-span-3 lg:col-span-1 mb-2 lg:mb-0">
            <Link href="/" className="inline-block">
              <Logo height={76} forceLight />
            </Link>
            <p className="text-gray-400 text-[13px] font-jakarta mt-4 leading-relaxed max-w-xs">
              AI Startup Impact is your source for AI startups in India, startup news, stories, funding, AI tools, and the Indian AI ecosystem.
            </p>
            <p className="text-gray-500 text-xs font-jakarta mt-3">
              Hyderabad, Telangana, India
            </p>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-jakarta font-bold text-xs sm:text-xs uppercase tracking-widest text-white mb-3 sm:mb-5">
                {col.title}
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[12px] sm:text-sm font-jakarta transition-colors text-gray-400 hover:text-white"
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

      {/* Giant watermark — positioned at the boundary; bottom bar covers its lower half */}
      <div
        className="hidden md:block absolute inset-x-0 pointer-events-none select-none"
        style={{ bottom: 55, zIndex: 1 }}
        aria-hidden="true"
      >
        <p
          className="text-center whitespace-nowrap font-bebas uppercase"
          style={{
            fontSize: 'min(15vw, 300px)',
            lineHeight: 0.9,
            letterSpacing: '0.04em',
            color: 'rgba(255,255,255,0.055)',
            WebkitTextStroke: '1px rgba(255,255,255,0.08)',
          }}
        >
          AI STARTUP IMPACT
        </p>
      </div>

      {/* Bottom Bar — z-10 so it covers the watermark's lower half */}
      <div className="border-t border-gray-900 bg-black relative z-10">
        {/* Gradient fade on top edge */}
        <div className="absolute inset-x-0 bottom-full h-20 bg-gradient-to-t from-black to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-xs sm:text-xs text-gray-500 font-jakarta">

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left order-last md:order-first">
              <span>&copy; {new Date().getFullYear()} AI Startup Impact. All rights reserved.</span>
              <CookieSettingsLink className="hover:text-brand transition-colors" />
            </div>

            <div className="flex items-center gap-5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-brand transition-colors duration-250 transform hover:scale-110"
                  aria-label={s.label}
                >
                  <s.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
