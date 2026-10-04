import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Welcome to Udyaibase',
  robots: { index: false, follow: false },
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50 dark:from-slate-950 dark:to-slate-900">
      <header className="flex items-center justify-center py-6">
        <a href="/" className="text-2xl font-bold text-slate-900 dark:text-white">
          Udyaibase
        </a>
      </header>
      <main className="flex items-center justify-center px-4 pb-12">
        {children}
      </main>
    </div>
  );
}
