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
      { label: 'Startups', href: '/startups' },
      { label: 'Funding Digest', href: '/funding' },
      { label: 'India AI', href: '/india-ai' },
      { label: 'Search', href: '/search' },
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
      { label: 'Founder Login', href: '/auth/login' },
      { label: 'Founder Signup', href: '/auth/signup' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
      { label: 'Refund Policy', href: '/refund' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  },
];

const socials = [
  { icon: Youtube, href: 'https://www.youtube.com/@aistartupimpact', label: 'YouTube' },
  { icon: Twitter, href: 'https://x.com/aistartupimapct', label: 'Twitter' },
  { icon: Linkedin, href: 'https://www.linkedin.com/company/ai-startup-imapact', label: 'LinkedIn' },
  { icon: Instagram, href: 'https://www.instagram.com/aistartupimpact/', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/AI-Startup-Impact', label: 'Facebook' },
];

export default function Footer() {
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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
    <footer className="bg-navy dark:bg-gray-950 border-t border-gray-800 dark:border-gray-800">
      {/* Newsletter CTA Section - Redesigned to match image */}
      {pathname !== '/newsletter' && (
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#1a2942] rounded-2xl p-8 sm:p-10 md:p-12 border border-blue-500/20 shadow-2xl">
              {/* Premium corner decorations */}
              <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-blue-400/30 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-blue-400/30 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-blue-400/30 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-blue-400/30 rounded-br-2xl" />
              
              {/* Animated gradient orbs */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
              
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.5) 1px, transparent 1px),
                                 linear-gradient(90deg, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
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
                    <div className="bg-[#0d1829]/80 backdrop-blur-sm border border-blue-400/20 rounded-2xl p-5 sm:p-6 shadow-xl">
                      <div className="text-center mb-5">
                        <p className="text-white text-3xl font-bold font-sora mb-1">5,000+</p>
                        <p className="text-gray-400 text-sm font-jakarta">
                          founders, investors & engineers
                        </p>
                        
                        {/* Overlapping avatar badges - Premium design */}
                        <div className="flex items-center justify-center mt-4">
                          <div className="flex items-center -space-x-3">
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-[#0d1829] shadow-lg shadow-emerald-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">RK</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-2 border-[#0d1829] shadow-lg shadow-blue-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">PM</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-[#0d1829] shadow-lg shadow-amber-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">SJ</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-[#0d1829] shadow-lg shadow-purple-500/50 transition-transform hover:scale-110 hover:z-10">
                              <span className="text-white text-sm font-bold">AV</span>
                            </div>
                            <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 border-2 border-[#0d1829] shadow-lg">
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
                          className="w-full px-4 py-3.5 bg-[#0a1628] border border-blue-400/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/50 font-jakarta text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <p className="text-gray-500 text-xs font-jakarta">
                          Every Friday · Free forever · No spam · Unsubscribe anytime
                        </p>
                      </div>

                      {/* Trusted by badges - Inline */}
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

      {/* Link Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-4 lg:mb-0">
            <Link href="/" className="inline-block">
              <Logo height={76} forceLight />
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

          {/* Link Columns - All in one row */}
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
                      className="text-sm font-jakarta transition-colors text-gray-400 hover:text-white"
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
            <span>&copy; {new Date().getFullYear()} AI Startup Impact. All rights reserved.</span>

            <a href="https://www.producthunt.com/products/aistartupimpact?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-aistartupimpact" target="_blank" rel="noopener noreferrer" className="order-first sm:order-none mb-4 sm:mb-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="AIStartupImpact - Discover, feature & grow AI startups in one place | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1121108&theme=light&t=1775982559914"
              />
            </a>

            <div className="flex items-center gap-4">
              <CookieSettingsLink className="hover:text-brand transition-colors" />
              <Link href="/contact" className="flex items-center gap-1.5 hover:text-brand transition-colors">
                <Mail className="w-3.5 h-3.5" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
