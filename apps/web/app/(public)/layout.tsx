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
      <BreakingTicker />
      <main className="pt-16 pb-16 lg:pb-0">
        {children}
      </main>
      <Footer />
    </>
  );
}
