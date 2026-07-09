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

    await prisma.founderUser.update({
      where: { id: session.userId },
      data: {
        name: data.name,
        company: data.company,
        previousCompany: data.previousCompany || null,
        role: data.role,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        website: data.website || null,
        bio: data.bio || null,
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
