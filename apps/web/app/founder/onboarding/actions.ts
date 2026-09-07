'use server';

import { requireFounderAuth, setFounderSession } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import { revalidatePath } from 'next/cache';

export async function completeOnboardingAction(data: {
  name: string;
  company: string;
  previousCompany?: string;
  role: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  bio?: string;
  avatar?: string;
}) {
  try {
    const session = await requireFounderAuth();

    if (data.bio && data.bio.length > 1000) {
      return { success: false, error: 'Bio must be 1000 characters or less' };
    }
    if (data.name.length > 100) {
      return { success: false, error: 'Name must be 100 characters or less' };
    }

    await prisma.founderUser.update({
      where: { id: session.userId },
      data: {
        name: data.name.slice(0, 100),
        company: data.company.slice(0, 100),
        previousCompany: data.previousCompany?.slice(0, 200) || null,
        role: data.role.slice(0, 100),
        phone: data.phone?.slice(0, 20) || null,
        linkedin: data.linkedin?.slice(0, 500) || null,
        twitter: data.twitter?.slice(0, 500) || null,
        website: data.website?.slice(0, 500) || null,
        bio: data.bio?.slice(0, 1000) || null,
        avatar: data.avatar || null,
        onboardingCompleted: true,
        onboardingStep: 2,
        status: 'ACTIVE',
        updatedAt: new Date(),
      },
    });

    // Refresh the session cookie with onboardingCompleted: true
    await setFounderSession(session.userId, session.email, session.name, true);

    revalidatePath('/founder/dashboard');
    revalidatePath('/founder/onboarding');

    return { success: true };
  } catch (error: any) {
    console.error('Onboarding completion error:', error);
    return { success: false, error: error.message || 'Failed to complete onboarding' };
  }
}
