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
  categoryId: string;
  pricingModel: string;
  pricingUrl?: string;
  startingPrice?: number;
  hasApi: boolean;
  hasMobileApp: boolean;
  launchYear: number;
  founderNames?: string[];
  headquartersCountry?: string;
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

    // Check if slug already exists using raw SQL
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id FROM "AiTool" WHERE slug = ${slug} LIMIT 1
    `;

    if (existing.length > 0) {
      return {
        success: false,
        error: 'A tool with this name already exists',
      };
    }

    // Get category ID from submission or use first available
    let categoryId = data.categoryId;
    
    if (!categoryId) {
      const categories = await prisma.$queryRaw<any[]>`
        SELECT id FROM "ToolCategory" LIMIT 1
      `;
      
      if (categories.length === 0) {
        // Create a default category if none exists
        const newCategories = await prisma.$queryRaw<any[]>`
          INSERT INTO "ToolCategory" (id, name, slug, description, "createdAt")
          VALUES (gen_random_uuid(), 'General', 'general', 'General AI tools', NOW())
          RETURNING id
        `;
        categoryId = newCategories[0].id;
      } else {
        categoryId = categories[0].id;
      }
    }

    // Convert starting price to paise (cents)
    const startingPricePaise = data.startingPrice 
      ? Math.round(data.startingPrice * 100) 
      : null;

    // Create tool using raw SQL to avoid date validation issues
    const tools = await prisma.$queryRaw<any[]>`
      INSERT INTO "AiTool" (
        id, name, slug, tagline, description, "websiteUrl", "affiliateUrl",
        "pricingModel", "pricingUrl", "startingPrice", "hasApi", "hasMobileApp",
        "launchYear", "founderNames", "headquartersCountry", "logoUrl", "screenshotUrls",
        "categoryId", "ownerId", "claimStatus", status, "submittedBy", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), ${data.name}, ${slug}, ${data.tagline}, ${data.description},
        ${data.websiteUrl}, ${data.affiliateUrl || null},
        ${data.pricingModel}, ${data.pricingUrl || null}, ${startingPricePaise},
        ${data.hasApi}, ${data.hasMobileApp}, ${data.launchYear},
        ${data.founderNames || []}::text[], ${data.headquartersCountry || null},
        ${data.logoUrl || null}, ${data.screenshotUrls}::text[],
        ${categoryId}, ${session.userId}, 'PENDING', 'PENDING', ${session.userId},
        NOW(), NOW()
      )
      RETURNING id
    `;

    const toolId = tools[0].id;

    // Create features as ToolUseCase entries
    if (data.features.length > 0) {
      await prisma.toolUseCase.createMany({
        data: data.features.map((text, index) => ({
          id: `usecase_${toolId}_feat_${index}_${Date.now()}`,
          toolId: toolId,
          text,
        })),
      });
    }

    // Create use cases
    if (data.useCases.length > 0) {
      await prisma.toolUseCase.createMany({
        data: data.useCases.map((text, index) => ({
          id: `usecase_${toolId}_use_${index}_${Date.now()}`,
          toolId: toolId,
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

    // Verify ownership using raw SQL
    const tools = await prisma.$queryRaw<any[]>`
      SELECT id, slug, name, "claimStatus", "ownerId"
      FROM "AiTool"
      WHERE id = ${id}
      LIMIT 1
    `;

    if (tools.length === 0 || tools[0].ownerId !== session.userId) {
      return {
        success: false,
        error: 'Tool not found or you do not have permission to edit it',
      };
    }

    const tool = tools[0];

    // Generate new slug if name changed
    let slug = tool.slug;
    if (data.name !== tool.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if new slug already exists using raw SQL
      const existingTools = await prisma.$queryRaw<any[]>`
        SELECT id FROM "AiTool" 
        WHERE slug = ${slug} AND id != ${id}
        LIMIT 1
      `;

      if (existingTools.length > 0) {
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
    // Keep the current status - no need for re-approval after initial approval
    // This allows founders to edit freely once their tool is approved

    // Use raw SQL to avoid date validation issues
    await prisma.$queryRaw`
      UPDATE "AiTool"
      SET
        name = ${data.name},
        slug = ${slug},
        tagline = ${data.tagline},
        description = ${data.description},
        "websiteUrl" = ${data.websiteUrl},
        "affiliateUrl" = ${data.affiliateUrl || null},
        "categoryId" = ${data.categoryId},
        "pricingModel" = ${data.pricingModel}::"PricingModel",
        "pricingUrl" = ${data.pricingUrl || null},
        "startingPrice" = ${startingPricePaise},
        "hasApi" = ${data.hasApi},
        "hasMobileApp" = ${data.hasMobileApp},
        "launchYear" = ${data.launchYear},
        "founderNames" = ${data.founderNames || []}::text[],
        "headquartersCountry" = ${data.headquartersCountry || null},
        "logoUrl" = ${data.logoUrl || null},
        "screenshotUrls" = ${data.screenshotUrls}::text[],
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    // Delete existing use cases using raw SQL
    await prisma.$queryRaw`
      DELETE FROM "ToolUseCase"
      WHERE "toolId" = ${id}
    `;

    // Create new features using raw SQL
    if (data.features.length > 0) {
      for (const text of data.features) {
        await prisma.$queryRaw`
          INSERT INTO "ToolUseCase" (id, "toolId", text)
          VALUES (gen_random_uuid(), ${id}, ${text})
        `;
      }
    }

    // Create new use cases using raw SQL
    if (data.useCases.length > 0) {
      for (const text of data.useCases) {
        await prisma.$queryRaw`
          INSERT INTO "ToolUseCase" (id, "toolId", text)
          VALUES (gen_random_uuid(), ${id}, ${text})
        `;
      }
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
