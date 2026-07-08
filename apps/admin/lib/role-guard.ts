import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server-side role guard for admin pages.
 * Call at the top of any page.tsx that needs role restriction.
 * Redirects to /dashboard with an error if the user lacks permission.
 */
export async function requireRole(allowedRoles: string[]) {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const userRole = session.user.role;
  if (!allowedRoles.includes(userRole)) {
    redirect('/dashboard?error=unauthorized');
  }

  return session;
}
