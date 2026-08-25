import { redirect } from 'next/navigation';
import { getOrganizerSession } from '@/lib/organizer-auth';
import { prisma } from '@aistartupimpact/database';
import OnboardingClient from './OnboardingClient';

export default async function OrganizerOnboardingPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const session = await getOrganizerSession();

  if (!session) {
    redirect('/organizer/login');
  }

  const organizer = await prisma.eventOrganizer.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      name: true,
      company: true,
      phone: true,
      avatar: true,
      bio: true,
      website: true,
      linkedin: true,
      onboardingCompleted: true,
      onboardingStep: true,
    },
  });

  if (!organizer) {
    redirect('/organizer/login');
  }

  if (organizer.onboardingCompleted) {
    redirect(searchParams.returnTo || '/organizer');
  }

  return <OnboardingClient user={organizer} returnTo={searchParams.returnTo} />;
}
