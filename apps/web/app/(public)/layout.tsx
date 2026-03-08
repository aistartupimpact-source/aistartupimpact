import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BreakingTicker from '@/components/layout/BreakingTicker';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="pt-14 sm:pt-16 min-h-screen flex flex-col">
        <BreakingTicker />
        <main className="flex-1 pb-16 lg:pb-0">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
