'use server';

import { getOrganizerSession } from '@/lib/organizer-auth';
import { prisma } from '@aistartupimpact/database';
import { revalidatePath } from 'next/cache';

export async function completeOrganizerOnboarding(data: {
  name: string;
  company: string;
  bio: string;
  avatar: string;
  phone?: string;
  website?: string;
  linkedin?: string;
}) {
  try {
    const session = await getOrganizerSession();
    if (!session) {
      return { success: false, error: 'Not authenticated' };
    }

    if (data.bio && data.bio.length > 1000) {
      return { success: false, error: 'Bio must be 1000 characters or less' };
    }
    if (data.name.length > 100) {
      return { success: false, error: 'Name must be 100 characters or less' };
    }

    await prisma.eventOrganizer.update({
      where: { id: session.id },
      data: {
        name: data.name.slice(0, 100),
        company: data.company.slice(0, 100),
        bio: data.bio.slice(0, 1000),
        avatar: data.avatar || null,
        phone: data.phone?.slice(0, 20) || null,
        website: data.website?.slice(0, 500) || null,
        linkedin: data.linkedin?.slice(0, 500) || null,
        onboardingCompleted: true,
        onboardingStep: 2,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/organizer');
    revalidatePath('/organizer/onboarding');

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to complete onboarding' };
  }
}
