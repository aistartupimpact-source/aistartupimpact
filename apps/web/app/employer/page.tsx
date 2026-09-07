import { redirect } from 'next/navigation';
import { getEmployerSession } from '@/lib/employer-auth';

export default async function EmployerRootPage() {
  const session = await getEmployerSession();

  if (!session) {
    redirect('/employer/login');
  }

  if (!session.onboardingCompleted) {
    redirect('/employer/onboarding');
  }

  redirect('/employer/dashboard');
}
