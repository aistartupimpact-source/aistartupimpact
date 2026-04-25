import dynamic from 'next/dynamic';
import BreakingTicker from '@/components/layout/BreakingTicker';
import { AuthContext } from '@/components/AuthContext';

// Navbar is above-fold — keep SSR. Footer is below-fold — lazy load.
import Navbar from '@/components/layout/Navbar';
const Footer = dynamic(() => import('@/components/layout/Footer'));

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthContext>
      <Navbar />
      <div className="pt-14 sm:pt-16 min-h-screen flex flex-col">
        <BreakingTicker />
        <main className="flex-1 pb-16 lg:pb-0 pb-safe">
          {children}
        </main>
      </div>
      <Footer />
    </AuthContext>
  );
}
