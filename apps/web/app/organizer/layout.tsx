import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { neon } from "@neondatabase/serverless";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { getUnifiedSession } from "@/lib/unified-auth";
import OrganizerSidebar from "@/components/organizer/OrganizerSidebar";
import OrganizerHeader from "@/components/organizer/OrganizerHeader";
import OrganizerMobileNav from "@/components/organizer/OrganizerMobileNav";

const USER_JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || "user-secret-change-in-production"
);

export default async function OrganizerWorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session: any = null;

  // 1. Try unified session
  const unifiedSession = await getUnifiedSession();
  if (unifiedSession?.organizerId) {
    session = {
      id: unifiedSession.organizerId,
      name: unifiedSession.name,
      email: unifiedSession.email,
      avatar: unifiedSession.avatar || undefined,
    };
  }

  // 2. Fallback: legacy organizer session
  if (!session) {
    session = await getOrganizerSession();
  }

  // 3. Fallback: user-token → find organizer by email
  if (!session) {
    try {
      const cookieStore = cookies();
      const userToken = cookieStore.get("user-token")?.value;
      if (userToken) {
        const { payload } = await jwtVerify(userToken, USER_JWT_SECRET);
        const email = (payload as any).email;
        if (email) {
          const sql = neon(process.env.DATABASE_URL!);
          const organizers = await sql`
            SELECT id, email, name, avatar FROM "EventOrganizer"
            WHERE email = ${email.toLowerCase()} AND status != 'SUSPENDED'
            LIMIT 1
          `;
          if (organizers.length > 0) {
            session = {
              id: organizers[0].id,
              name: organizers[0].name,
              email: organizers[0].email,
              avatar: organizers[0].avatar || undefined,
            };
          }
        }
      }
    } catch {}
  }

  if (!session) redirect("/organizer/login");

  return (
    <div className="flex h-screen bg-[#F9FAFB] dark:bg-gray-950 overflow-hidden">
      <div className="hidden md:block">
        <OrganizerSidebar organizer={session} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <OrganizerHeader organizer={session} />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">{children}</main>
      </div>
      <OrganizerMobileNav />
    </div>
  );
}
