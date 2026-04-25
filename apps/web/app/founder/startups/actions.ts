'use server';

import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import { revalidatePath } from 'next/cache';

interface StartupSubmission {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  foundedYear: number;
  headquartersCity?: string;
  stage: string;
  employeeCount?: number;
  founders: string[];
  logoUrl?: string;
}

export async function submitStartupAction(data: StartupSubmission) {
  try {
    const session = await requireFounderAuth();

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const existing = await prisma.startup.findUnique({
      where: { slug },
    });

    if (existing) {
      return {
        success: false,
        error: 'A startup with this name already exists',
      };
    }

    // Create startup
    await prisma.startup.create({
      data: {
        name: data.name,
        slug,
        tagline: data.tagline,
        description: data.description,
        websiteUrl: data.websiteUrl,
        linkedinUrl: data.linkedinUrl,
        twitterUrl: data.twitterUrl,
        foundedYear: data.foundedYear,
        headquartersCity: data.headquartersCity,
        stage: data.stage as any,
        employeeCount: data.employeeCount,
        founders: data.founders,
        logoUrl: data.logoUrl,
        ownerId: session.userId,
        claimStatus: 'PENDING',
        submittedBy: 'FOUNDER',
      },
    });

    // TODO: Send notification to admin
    // TODO: Send confirmation email to founder

    revalidatePath('/founder/startups');
    revalidatePath('/founder/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Startup submission error:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit startup',
    };
  }
}

export async function updateStartupAction(id: string, data: StartupSubmission) {
  try {
    const session = await requireFounderAuth();

    // Verify ownership
    const startup = await prisma.startup.findUnique({
      where: { id },
    });

    if (!startup || startup.ownerId !== session.userId) {
      return {
        success: false,
        error: 'Startup not found or you do not have permission to edit it',
      };
    }

    // Generate new slug if name changed
    let slug = startup.slug;
    if (data.name !== startup.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if new slug already exists
      const existing = await prisma.startup.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existing) {
        return {
          success: false,
          error: 'A startup with this name already exists',
        };
      }
    }

    // Update startup
    // If startup was live (CLAIMED/VERIFIED), set back to PENDING for re-approval
    const newStatus = ['CLAIMED', 'VERIFIED'].includes(startup.claimStatus)
      ? 'PENDING'
      : startup.claimStatus;

    await prisma.startup.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        tagline: data.tagline,
        description: data.description,
        websiteUrl: data.websiteUrl,
        linkedinUrl: data.linkedinUrl,
        twitterUrl: data.twitterUrl,
        foundedYear: data.foundedYear,
        headquartersCity: data.headquartersCity,
        stage: data.stage as any,
        employeeCount: data.employeeCount,
        founders: data.founders,
        logoUrl: data.logoUrl,
        claimStatus: newStatus,
      },
    });

    // TODO: Send notification to admin if status changed to PENDING
    // TODO: Send confirmation email to founder

    revalidatePath('/founder/startups');
    revalidatePath(`/founder/startups/${id}`);
    revalidatePath('/founder/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Startup update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update startup',
    };
  }
}
