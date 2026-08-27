'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SignInModal from '@/components/auth/SignInModal';
import { Rocket, Loader2, TrendingUp, Users, BarChart3, FileText, Globe, Zap, UserPlus } from 'lucide-react';

const benefits = [
  { icon: Rocket, title: 'Startup Showcase', desc: 'List your startup and get discovered by investors & talent' },
  { icon: TrendingUp, title: 'Funding Insights', desc: 'Access real-time AI funding data across India' },
  { icon: Users, title: 'Community Access', desc: 'Connect with 10,000+ AI founders, builders & investors' },
  { icon: BarChart3, title: 'Impact Analytics', desc: 'Track your startup\'s visibility and engagement metrics' },
  { icon: FileText, title: 'Content Platform', desc: 'Publish articles, case studies & thought leadership' },
  { icon: Globe, title: 'Industry Network', desc: 'Join India\'s fastest-growing AI ecosystem' },
];

function LoginContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-black/30">

        {/* Left — Benefits panel */}
        <div className="relative bg-gradient-to-br from-brand via-red-600 to-rose-700 p-5 sm:p-6 lg:p-12 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\'/%3E%3Cpath d=\'M20 0v40M0 20h40\' stroke=\'%23fff\' stroke-width=\'.5\'/%3E%3C/svg%3E")', backgroundSize: '40px 40px' }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-4 lg:mb-8">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Rocket className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
              </div>
              <span className="font-sora font-bold text-white text-xs lg:text-sm tracking-wide uppercase">Founder & User Portal</span>
            </div>

            <h2 className="font-sora font-extrabold text-xl lg:text-3xl text-white leading-tight mb-2 lg:mb-3">
              Welcome Back to AI Startup Impact
            </h2>
            <p className="text-white/80 text-xs lg:text-sm font-jakarta leading-relaxed mb-4 lg:mb-8 max-w-sm">
              Sign in to manage your startup profile, access funding data, and connect with the AI community.
            </p>

            {/* Mobile: compact chips */}
            <div className="flex flex-wrap gap-2 lg:hidden">
              {benefits.slice(0, 3).map((b) => (
                <div key={b.title} className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <b.icon className="w-3.5 h-3.5 text-white" />
                  <span className="text-white text-xs font-semibold font-jakarta">{b.title}</span>
                </div>
              ))}
            </div>

            {/* Desktop: full grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div key={b.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
                    <b.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm font-jakarta">{b.title}</p>
                    <p className="text-white/65 text-xs font-jakarta leading-snug mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-4 lg:mt-8 pt-4 lg:pt-6 border-t border-white/15">
            <div className="flex items-center gap-2.5">
              <div className="flex -space-x-1.5 lg:-space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center">
                    <UserPlus className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white/80" />
                  </div>
                ))}
              </div>
              <p className="text-white/75 text-[11px] lg:text-xs font-jakarta">
                Trusted by <span className="text-white font-semibold">5,000+</span> founders & professionals
              </p>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
          <SignInModal
            isOpen={true}
            onClose={() => {}}
            defaultMode="signin"
            defaultTab="founder"
            returnTo={returnTo}
            embedded={true}
          />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-64px)] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-brand" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
