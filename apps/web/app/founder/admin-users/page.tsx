import { requireFounderAuth } from '@/lib/founder-auth';
import { neon } from '@neondatabase/serverless';
import AdminUsersClient from './AdminUsersClient';

const sql = neon(process.env.DATABASE_URL!);

export const metadata = {
  title: 'Admin Users | Founder Portal',
  description: 'Manage admin users and their roles',
};

export const revalidate = 0;

export default async function AdminUsersPage() {
  const session = await requireFounderAuth();

  console.log('[admin-users] Fetching admin users...');

  // Get all users from User table using raw SQL to avoid Prisma DateTime issues
  const adminUsers = await sql`
    SELECT 
      id, 
      email, 
      name, 
      role, 
      avatar, 
      "lastLoginAt"::text as "lastLoginAt",
      "createdAt"::text as "createdAt"
    FROM "User"
    WHERE "isActive" = true
    ORDER BY 
      CASE role
        WHEN 'SUPER_ADMIN' THEN 1
        WHEN 'EDITOR_IN_CHIEF' THEN 2
        WHEN 'SENIOR_WRITER' THEN 3
        WHEN 'WRITER' THEN 4
        WHEN 'AD_MANAGER' THEN 5
        WHEN 'CONTRIBUTOR' THEN 6
        WHEN 'FOUNDER' THEN 7
        ELSE 8
      END,
      "createdAt" DESC
  `;

  console.log('[admin-users] Found users:', adminUsers.length);
  console.log('[admin-users] Users data:', JSON.stringify(adminUsers, null, 2));

  return <AdminUsersClient users={adminUsers as any} />;
}
