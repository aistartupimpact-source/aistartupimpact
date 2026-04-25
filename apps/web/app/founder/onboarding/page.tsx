import { redirect } from 'next/navigation';
import { getFounderSession } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import OnboardingClient from './OnboardingClient';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const session = await getFounderSession();
  
  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.founderUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      companyDomain: true,
      role: true,
      phone: true,
      linkedin: true,
      twitter: true,
      website: true,
      onboardingCompleted: true,
      onboardingStep: true,
    },
  });

  if (!user) {
    redirect('/auth/login');
  }

  // If onboarding is complete, redirect to returnTo or dashboard
  if (user.onboardingCompleted) {
    redirect(searchParams.returnTo || '/founder/dashboard');
  }

  return <OnboardingClient user={user} returnTo={searchParams.returnTo} />;
}
