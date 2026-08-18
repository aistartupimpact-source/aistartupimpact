import { getEmployerSession } from '@/lib/employer-auth';
import EmployerSidebar from '@/components/employer/EmployerSidebar';
import EmployerHeader from '@/components/employer/EmployerHeader';

export default async function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getEmployerSession();

  // If no session, render children without dashboard wrapper
  // (login/signup pages handle their own UI)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-page dark:bg-page-dark overflow-hidden">
      <div className="hidden md:block">
        <EmployerSidebar employer={session} />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <EmployerHeader employer={session} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
