'use server';

import { requireFounderAuth } from '@/lib/founder-auth';
import { prisma } from '@aistartupimpact/database';
import { revalidatePath } from 'next/cache';

interface ToolSubmission {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  affiliateUrl?: string;
  pricingModel: string;
  pricingUrl?: string;
  startingPrice?: number;
  hasApi: boolean;
  hasMobileApp: boolean;
  launchYear: number;
  features: string[];
  useCases: string[];
  logoUrl?: string;
  screenshotUrls: string[];
}

export async function submitToolAction(data: ToolSubmission) {
  try {
    const session = await requireFounderAuth();

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const existing = await prisma.aiTool.findUnique({
      where: { slug },
    });

    if (existing) {
      return {
        success: false,
        error: 'A tool with this name already exists',
      };
    }

    // Get first tool category (or create a default one)
    let category = await prisma.toolCategory.findFirst();
    
    if (!category) {
      // Create a default category if none exists
      category = await prisma.toolCategory.create({
        data: {
          name: 'General',
          slug: 'general',
          description: 'General AI tools',
        },
      });
    }

    // Convert starting price to paise (cents)
    const startingPricePaise = data.startingPrice 
      ? Math.round(data.startingPrice * 100) 
      : null;

    // Create tool
    const tool = await prisma.aiTool.create({
      data: {
        name: data.name,
        slug,
        tagline: data.tagline,
        description: data.description,
        websiteUrl: data.websiteUrl,
        affiliateUrl: data.affiliateUrl,
        pricingModel: data.pricingModel as any,
        pricingUrl: data.pricingUrl,
        startingPrice: startingPricePaise,
        hasApi: data.hasApi,
        hasMobileApp: data.hasMobileApp,
        launchYear: data.launchYear,
        logoUrl: data.logoUrl,
        screenshotUrls: data.screenshotUrls,
        categoryId: category.id,
        ownerId: session.userId,
        claimStatus: 'PENDING',
        status: 'PENDING',
        submittedBy: session.userId,
      },
    });

    // Create features as ToolUseCase entries
    if (data.features.length > 0) {
      await prisma.toolUseCase.createMany({
        data: data.features.map(text => ({
          toolId: tool.id,
          text,
        })),
      });
    }

    // Create use cases
    if (data.useCases.length > 0) {
      await prisma.toolUseCase.createMany({
        data: data.useCases.map(text => ({
          toolId: tool.id,
          text,
        })),
      });
    }

    // TODO: Send notification to admin
    // TODO: Send confirmation email to founder

    revalidatePath('/founder/tools');
    revalidatePath('/founder/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Tool submission error:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit tool',
    };
  }
}

export async function updateToolAction(id: string, data: ToolSubmission) {
  try {
    const session = await requireFounderAuth();

    // Verify ownership
    const tool = await prisma.aiTool.findUnique({
      where: { id },
    });

    if (!tool || tool.ownerId !== session.userId) {
      return {
        success: false,
        error: 'Tool not found or you do not have permission to edit it',
      };
    }

    // Generate new slug if name changed
    let slug = tool.slug;
    if (data.name !== tool.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if new slug already exists
      const existing = await prisma.aiTool.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      });

      if (existing) {
        return {
          success: false,
          error: 'A tool with this name already exists',
        };
      }
    }

    // Convert starting price to paise (cents)
    const startingPricePaise = data.startingPrice 
      ? Math.round(data.startingPrice * 100) 
      : null;

    // Update tool
    // If tool was live (CLAIMED/VERIFIED), set back to PENDING for re-approval
    const newStatus = ['CLAIMED', 'VERIFIED'].includes(tool.claimStatus)
      ? 'PENDING'
      : tool.claimStatus;

    await prisma.aiTool.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        tagline: data.tagline,
        description: data.description,
        websiteUrl: data.websiteUrl,
        affiliateUrl: data.affiliateUrl,
        pricingModel: data.pricingModel as any,
        pricingUrl: data.pricingUrl,
        startingPrice: startingPricePaise,
        hasApi: data.hasApi,
        hasMobileApp: data.hasMobileApp,
        launchYear: data.launchYear,
        logoUrl: data.logoUrl,
        screenshotUrls: data.screenshotUrls,
        claimStatus: newStatus,
        status: newStatus === 'PENDING' ? 'PENDING' : tool.status,
      },
    });

    // Delete existing use cases and create new ones
    await prisma.toolUseCase.deleteMany({
      where: { toolId: id },
    });

    // Create new features and use cases
    const allUseCases = [...data.features, ...data.useCases];
    if (allUseCases.length > 0) {
      await prisma.toolUseCase.createMany({
        data: allUseCases.map(text => ({
          toolId: id,
          text,
        })),
      });
    }

    // TODO: Send notification to admin if status changed to PENDING
    // TODO: Send confirmation email to founder

    revalidatePath('/founder/tools');
    revalidatePath(`/founder/tools/${id}`);
    revalidatePath('/founder/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error('Tool update error:', error);
    return {
      success: false,
      error: error.message || 'Failed to update tool',
    };
  }
}
