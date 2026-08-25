import dynamic from 'next/dynamic';
import { cookies } from 'next/headers';
import { AuthContext } from '@/components/AuthContext';

// Navbar is above-fold — keep SSR. Footer is below-fold — lazy load.
import Navbar from '@/components/layout/Navbar';
const AnnouncementBar = dynamic(() => import('@/components/layout/AnnouncementBar'), { ssr: false });
const Footer = dynamic(() => import('@/components/layout/Footer'));

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const hasSession = !!(cookieStore.get('user-token')?.value || cookieStore.get('founder-token')?.value);

  return (
    <AuthContext>
      <AnnouncementBar />
      <Navbar hasSession={hasSession} />
      <div className="pt-[96px] sm:pt-[103px] min-h-screen flex flex-col">
        <main className="flex-1 pb-16 lg:pb-0 pb-safe">
          {children}
        </main>
      </div>
      <Footer />
    </AuthContext>
  );
}
