import { redirect } from 'next/navigation';
import { getFounderSession } from '@/lib/founder-auth';
import FounderNav from '@/components/founder/FounderNav';
import FounderSidebar from '@/components/founder/FounderSidebar';
import { neon } from '@neondatabase/serverless';
import DNSVerificationModal from '@/components/founder/DNSVerificationModal';

export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication
  const session = await getFounderSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  // Query unverified startups owned by the founder
  const sql = neon(process.env.DATABASE_URL!);
  const unverifiedStartups = await sql`
    SELECT id, name, slug FROM "Startup"
    WHERE "ownerId" = ${session.userId} AND "isVerified" = false AND "deletedAt" IS NULL
  `;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Sticky Header - Fixed at top */}
      <div className="flex-none">
        <FounderNav session={session} />
      </div>
      
      {/* Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Fixed Sidebar */}
        <div className="flex-none">
          <FounderSidebar />
        </div>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* DNS Verification Reminder Modal */}
      <DNSVerificationModal unverifiedStartups={unverifiedStartups as any[]} />
    </div>
  );
}
