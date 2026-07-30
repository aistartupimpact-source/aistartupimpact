import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { getFounderSession } from '@/lib/founder-auth';
import { getUnifiedSession } from '@/lib/unified-auth';
import FounderNav from '@/components/founder/FounderNav';
import FounderSidebar from '@/components/founder/FounderSidebar';
import { neon } from '@neondatabase/serverless';
import DNSVerificationModal from '@/components/founder/DNSVerificationModal';

const USER_JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

export default async function FounderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: any = null;
  const sql = neon(process.env.DATABASE_URL!);

  // Try unified session first (user has founderId linked)
  const unifiedSession = await getUnifiedSession();
  if (unifiedSession?.founderId) {
    session = {
      userId: unifiedSession.founderId,
      email: unifiedSession.email,
      name: unifiedSession.name,
      avatar: unifiedSession.avatar,
    };
  }

  // Fallback: legacy founder session
  if (!session) {
    session = await getFounderSession();
  }

  // Fallback: user-token cookie → find founder by email
  if (!session) {
    try {
      const cookieStore = cookies();
      const userToken = cookieStore.get('user-token')?.value;
      if (userToken) {
        const { payload } = await jwtVerify(userToken, USER_JWT_SECRET);
        const email = (payload as any).email;
        if (email) {
          const founders = await sql`
            SELECT id, email, name, avatar FROM "FounderUser"
            WHERE email = ${email.toLowerCase()} AND status != 'SUSPENDED'
            LIMIT 1
          `;
          if (founders.length > 0) {
            session = {
              userId: founders[0].id,
              email: founders[0].email,
              name: founders[0].name,
              avatar: founders[0].avatar,
            };
          }
        }
      }
    } catch {}
  }

  if (!session) {
    redirect('/auth/login');
  }

  // Query unverified startups owned by the founder
  const unverifiedStartups = await sql`
    SELECT id, name, slug FROM "Startup"
    WHERE "ownerId" = ${session.userId} AND "isVerified" = false AND "deletedAt" IS NULL
  `;

  return (
    <div className="flex h-screen bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block">
        <FounderSidebar />
      </div>
      
      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <FounderNav session={session} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
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
