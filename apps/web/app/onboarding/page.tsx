import { redirect } from 'next/navigation';
import { getUserSession } from '@/lib/user-session';
import { sql } from '@/lib/db';
import OnboardingClient from './OnboardingClient';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect('/auth/login');
  }

  const params = await searchParams;
  const returnTo = params.returnTo || '/';

  const users = await sql`
    SELECT "onboardingCompleted" FROM "WebUser" WHERE id = ${session.id} LIMIT 1
  `;

  if (users.length > 0 && users[0].onboardingCompleted) {
    redirect(returnTo);
  }

  const categories = await sql`
    SELECT id, name, slug, icon
    FROM "ToolCategory"
    WHERE level = 0 AND "isActive" = true
    ORDER BY "sortOrder", name
  `;

  return (
    <OnboardingClient
      categories={categories as { id: string; name: string; slug: string; icon: string | null }[]}
      returnTo={returnTo}
      userName={session.name}
    />
  );
}
