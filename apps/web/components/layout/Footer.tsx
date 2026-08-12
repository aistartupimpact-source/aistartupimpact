'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mail, Twitter, Linkedin, Instagram, Facebook, Youtube, CheckCircle2 } from 'lucide-react';
import SubscribeForm from '@/components/SubscribeForm';
import { CookieSettingsLink } from '@/components/CookieConsent';
import { useState } from 'react';
import Logo from '@/components/Logo';

const footerLinks = [
  {
    title: 'Explore',
    links: [
      { label: 'News', href: '/news' },
      { label: 'Founder Stories', href: '/stories' },
      { label: 'AI Tools', href: '/tools' },
      { label: 'Startups', href: '/startups' },
      { label: 'AI Jobs', href: '/jobs' },
      { label: 'Funding Digest', href: '/funding' },
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
    title: 'For Founders',
    links: [
      { label: 'Submit Startup', href: '/submit-startup' },
      { label: 'Submit AI Tool', href: '/submit-tool' },
      { label: 'Create Event', href: '/events' },
      { label: 'Post a Job', href: '/employer/signup' },
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
    href: 'https://x.com/aistartupimapct',
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/ai-startup-imapact',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const showNewsletter = false; // hidden for now

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' })
      });
      
      const data = await res.json();
      
      if (data.success || res.ok) {
        setShowSuccess(true);
        e.currentTarget.reset();
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        // Show the error message from the API
        alert(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      // Only show alert for network/fetch errors
      console.error('Subscription error:', error);
      alert('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={`${pathname === '/newsletter' ? 'hidden md:block' : ''} bg-black border-t border-gray-900`}>
      {/* Newsletter CTA Section - Hidden on mobile, shown on tablet+ */}
      {showNewsletter && (
      <div className="border-b border-gray-950 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-black rounded-2xl p-8 sm:p-10 md:p-12 border border-gray-800 shadow-2xl">
              {/* Premium corner decorations */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-gray-800 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-gray-800 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-gray-800 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-gray-800 rounded-br-2xl" />
              
              {/* Animated gradient orbs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand/5 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-950/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255, 49, 49, 0.2) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(255, 49, 49, 0.2) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
              }} />
 
              <div className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                  {/* Left Content */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 px-4 py-2 rounded-full mb-6">
                      <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                      <span className="text-brand text-xs font-bold uppercase tracking-wider font-jakarta">
                        FREE · EVERY FRIDAY
                      </span>
                    </div>
 
                    <h3 className="font-sora font-extrabold text-3xl sm:text-4xl text-white leading-tight mb-4">
                      Don&apos;t miss the{' '}
                      <span className="text-brand">AI signal</span>
                      <br />
                      <span className="text-gray-400 font-normal text-2xl sm:text-3xl">in the noise</span>
                    </h3>
 
                    <p className="text-gray-400 text-base font-jakarta leading-relaxed mb-8 max-w-lg">
                      India&apos;s most curated AI newsletter — funding rounds, founder stories, and tool releases. Signal only, no noise.
                    </p>
 
                    {/* Features - Bullet list */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3 text-sm text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0 mt-2" />
                        <span>India-first AI funding digest</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0 mt-2" />
                        <span>Exclusive founder interviews</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0 mt-2" />
                        <span>Tool reviews and recommendations</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-gray-300 font-jakarta">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full flex-shrink-0 mt-2" />
                        <span>Policy analysis for builders</span>
                      </div>
                    </div>
 
                    <p className="text-gray-500 text-sm font-jakarta">
                      Read by teams at{' '}
                      <span className="text-gray-300 font-semibold">Google India</span>,{' '}
                      <span className="text-gray-300 font-semibold">Flipkart</span> &{' '}
                      <span className="text-gray-300 font-semibold">Zerodha</span>
                    </p>
                  </div>
 
                  {/* Right Form */}
                  <div className="lg:pl-4">
                    <div className="bg-[#0b0b0c]/85 backdrop-blur-sm border border-gray-800 rounded-2xl p-5 sm:p-6 shadow-xl">
                      <div className="text-center mb-5">
                        <p className="text-white text-3xl font-bold font-sora mb-1">5,000+</p>
                        <p className="text-gray-400 text-sm font-jakarta">
                          founders, investors & engineers
                        </p>
                        
                        {/* Overlapping avatar badges */}
                        <div className="flex items-center justify-center mt-4">
                          <div className="flex items-center -space-x-3">
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-black shadow-lg shadow-emerald-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">RK</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-black shadow-lg shadow-blue-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">PM</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-black shadow-lg shadow-amber-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">SJ</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-black shadow-lg shadow-purple-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">AV</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-black shadow-lg">
                              <span className="text-gray-300 text-xs font-semibold">+4.9k</span>
                            </div>
                          </div>
                        </div>
                      </div>
 
                      <form className="space-y-3" onSubmit={handleSubmit}>
                        <input
                          type="email"
                          name="email"
                          placeholder="your@email.com"
                          required
                          disabled={isSubmitting || showSuccess}
                          className="w-full px-4 py-3.5 bg-black border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 font-jakarta text-sm transition-all disabled:opacity-50"
                        />
                        <button
                          type="submit"
                          disabled={isSubmitting || showSuccess}
                          className={`w-full px-6 py-3.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed ${
                            isSubmitting 
                              ? 'bg-brand hover:bg-brand/90 text-white' 
                              : 'bg-white hover:bg-gray-100 text-black'
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Subscribing...
                            </>
                          ) : (
                            'Get the weekly digest →'
                          )}
                        </button>
                      </form>
 
                      {/* Premium Success Card */}
                      {showSuccess && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/40 rounded-xl backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-500">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-white font-semibold text-sm font-sora mb-1">
                                Successfully subscribed! 🎉
                              </h4>
                              <p className="text-emerald-200 text-xs font-jakarta leading-relaxed">
                                Check your inbox for a confirmation email. You'll receive your first AI digest this Friday!
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
 
                      <div className="text-center mt-3 space-y-1">
                        <p className="text-gray-500 text-[11px] font-jakarta leading-relaxed">
                          By subscribing, you agree to receive the AI Startup Impact newsletter. You can{' '}
                          <a href="/privacy" className="underline hover:text-gray-400">unsubscribe</a> at any time.
                        </p>
                        <p className="text-gray-500 text-xs font-jakarta">
                          Every Friday · Free forever · No spam
                        </p>
                      </div>
 
                      {/* Trusted by badges */}
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <span className="text-gray-500 text-[10px] font-jakarta">Trusted by</span>
                          <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">
                            <span className="text-gray-300 text-[9px] font-semibold">Sarvam AI</span>
                          </div>
                          <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">
                            <span className="text-gray-300 text-[9px] font-semibold">Krutrim</span>
                          </div>
                          <div className="px-2 py-0.5 bg-white/5 border border-white/10 rounded">
                            <span className="text-gray-300 text-[9px] font-semibold">Ola AI</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
 
      {/* Compact Mobile Newsletter */}
      {showNewsletter && (
        <div className="sm:hidden border-b border-gray-900 px-4 py-4">
          <p className="text-white text-xs font-bold font-sora mb-2">Weekly AI Newsletter <span className="text-gray-500 font-normal font-jakarta">· Every Friday</span></p>
          <form className="flex gap-2" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              required
              disabled={isSubmitting || showSuccess}
              className="flex-1 px-3 py-2 bg-white/5 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-brand/50 font-jakarta text-xs disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting || showSuccess}
              className="px-3 py-2 bg-brand text-white text-xs font-bold rounded-lg shrink-0 disabled:opacity-50"
            >
              {showSuccess ? '✓' : 'Join'}
            </button>
          </form>
        </div>
      )}
 
      {/* Link Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-3 sm:col-span-3 lg:col-span-1 mb-2 lg:mb-0">
            <Link href="/" className="inline-block">
              <Logo height={76} forceLight />
            </Link>
            <p className="text-gray-400 text-[13px] font-jakarta mt-4 leading-relaxed max-w-xs">
              India&apos;s definitive source for AI startup news, tools, funding data,
              and ecosystem intelligence.
            </p>
            <p className="text-gray-500 text-[11px] font-jakarta mt-3">
              Hyderabad, Telangana, India
            </p>
          </div>
 
          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="font-jakarta font-bold text-[11px] sm:text-xs uppercase tracking-widest text-white mb-3 sm:mb-5">
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
 
      {/* Bottom Bar */}
      <div className="border-t border-gray-900 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-[11px] sm:text-xs text-gray-500 font-jakarta">
            
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left order-last md:order-first">
              <span>&copy; {new Date().getFullYear()} AI Startup Impact. All rights reserved.</span>
              <div className="flex items-center gap-4">
                <CookieSettingsLink className="hover:text-brand transition-colors" />
                <Link href="/contact" className="flex items-center gap-1 hover:text-brand transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                  Contact
                </Link>
              </div>
            </div>
 
            <a href="https://www.producthunt.com/products/aistartupimpact?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-aistartupimpact" target="_blank" rel="noopener noreferrer" className="hidden sm:block order-none mb-2 sm:mb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="AIStartupImpact - Discover, feature & grow AI startups in one place | Product Hunt"
                width="220"
                height="48"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1121108&theme=light&t=1775982559914"
                className="opacity-90 hover:opacity-100 transition-opacity"
              />
            </a>
 
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
