'use server';

import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import { revalidatePath } from 'next/cache';

export async function completeOnboardingAction(data: {
  company: string;
  role: string;
  phone?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}) {
  try {
    const session = await requireFounderAuth();

    await prisma.founderUser.update({
      where: { id: session.userId },
      data: {
        company: data.company,
        role: data.role,
        phone: data.phone || null,
        linkedin: data.linkedin || null,
        twitter: data.twitter || null,
        website: data.website || null,
        onboardingCompleted: true,
        onboardingStep: 2,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/founder/dashboard');
    revalidatePath('/founder/onboarding');

    return { success: true };
  } catch (error: any) {
    console.error('Onboarding completion error:', error);
    return { success: false, error: error.message || 'Failed to complete onboarding' };
  }
}
