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
  category?: string;
  businessType?: string;
  totalFundingInr?: number;
  faqs?: Array<{
    question: string;
    answer: string;
    order: number;
  }>;
}

export async function submitStartupAction(data: StartupSubmission) {
  try {
    const session = await requireFounderAuth();

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists using raw query
    const existing = await prisma.$queryRaw<any[]>`
      SELECT id
      FROM "Startup"
      WHERE slug = ${slug}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return {
        success: false,
        error: 'A startup with this name already exists',
      };
    }

    // Create startup using raw query
    // Try to include category and businessType if columns exist, otherwise skip them
    let startupId: string | null = null;
    try {
      const result = await prisma.$queryRaw<any[]>`
        INSERT INTO "Startup" (
          id, name, slug, tagline, description, "websiteUrl", "linkedinUrl", "twitterUrl",
          "foundedYear", "headquartersCity", stage, "employeeCount", founders, "logoUrl",
          "totalFundingInr", category, "businessType", "ownerId", "claimStatus", "submittedBy", "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(),
          ${data.name},
          ${slug},
          ${data.tagline},
          ${data.description},
          ${data.websiteUrl},
          ${data.linkedinUrl || null},
          ${data.twitterUrl || null},
          ${data.foundedYear},
          ${data.headquartersCity || null},
          ${data.stage}::"StartupStage",
          ${data.employeeCount || null},
          ${data.founders}::text[],
          ${data.logoUrl || null},
          ${data.totalFundingInr || 0},
          ${data.category || null},
          ${data.businessType || null},
          ${session.userId},
          'PENDING'::"ClaimStatus",
          'FOUNDER',
          NOW(),
          NOW()
        )
        RETURNING id
      `;
      startupId = result[0]?.id;
    } catch (error: any) {
      // If category or businessType column doesn't exist, insert without them
      if (error.message?.includes('category') || error.message?.includes('businessType') || error.message?.includes('column')) {
        console.log('[submitStartup] Category or businessType column not found, inserting without them');
        const result = await prisma.$queryRaw<any[]>`
          INSERT INTO "Startup" (
            id, name, slug, tagline, description, "websiteUrl", "linkedinUrl", "twitterUrl",
            "foundedYear", "headquartersCity", stage, "employeeCount", founders, "logoUrl",
            "totalFundingInr", "ownerId", "claimStatus", "submittedBy", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            ${data.name},
            ${slug},
            ${data.tagline},
            ${data.description},
            ${data.websiteUrl},
            ${data.linkedinUrl || null},
            ${data.twitterUrl || null},
            ${data.foundedYear},
            ${data.headquartersCity || null},
            ${data.stage}::"StartupStage",
            ${data.employeeCount || null},
            ${data.founders}::text[],
            ${data.logoUrl || null},
            ${data.totalFundingInr || 0},
            ${session.userId},
            'PENDING'::"ClaimStatus",
            'FOUNDER',
            NOW(),
            NOW()
          )
          RETURNING id
        `;
        startupId = result[0]?.id;
      } else {
        throw error;
      }
    }

    // Insert FAQs if provided
    if (startupId && data.faqs && data.faqs.length > 0) {
      for (const faq of data.faqs) {
        await prisma.$executeRaw`
          INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${startupId}, ${faq.question}, ${faq.answer}, ${faq.order}, NOW(), NOW())
        `;
      }
    }

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

    // Verify ownership using raw query
    const startups = await prisma.$queryRaw<any[]>`
      SELECT id, name, slug, "ownerId", "claimStatus"
      FROM "Startup"
      WHERE id = ${id}
      LIMIT 1
    `;

    const startup = startups[0];

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

      // Check if new slug already exists using raw query
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id
        FROM "Startup"
        WHERE slug = ${slug} AND id != ${id}
        LIMIT 1
      `;

      if (existing.length > 0) {
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

    // Try to update with category and businessType, fallback if columns don't exist
    try {
      await prisma.$executeRaw`
        UPDATE "Startup"
        SET 
          name = ${data.name},
          slug = ${slug},
          tagline = ${data.tagline},
          description = ${data.description},
          "websiteUrl" = ${data.websiteUrl},
          "linkedinUrl" = ${data.linkedinUrl || null},
          "twitterUrl" = ${data.twitterUrl || null},
          "foundedYear" = ${data.foundedYear},
          "headquartersCity" = ${data.headquartersCity || null},
          stage = ${data.stage}::"StartupStage",
          "employeeCount" = ${data.employeeCount || null},
          founders = ${data.founders}::text[],
          "logoUrl" = ${data.logoUrl || null},
          "totalFundingInr" = ${data.totalFundingInr || 0},
          category = ${data.category || null},
          "businessType" = ${data.businessType || null},
          "claimStatus" = ${newStatus}::"ClaimStatus",
          "updatedAt" = NOW()
        WHERE id = ${id}
      `;
    } catch (error: any) {
      // If category or businessType column doesn't exist, update without them
      if (error.message?.includes('category') || error.message?.includes('businessType') || error.message?.includes('column')) {
        console.log('[updateStartup] Category or businessType column not found, updating without them');
        await prisma.$executeRaw`
          UPDATE "Startup"
          SET 
            name = ${data.name},
            slug = ${slug},
            tagline = ${data.tagline},
            description = ${data.description},
            "websiteUrl" = ${data.websiteUrl},
            "linkedinUrl" = ${data.linkedinUrl || null},
            "twitterUrl" = ${data.twitterUrl || null},
            "foundedYear" = ${data.foundedYear},
            "headquartersCity" = ${data.headquartersCity || null},
            stage = ${data.stage}::"StartupStage",
            "employeeCount" = ${data.employeeCount || null},
            founders = ${data.founders}::text[],
            "logoUrl" = ${data.logoUrl || null},
            "totalFundingInr" = ${data.totalFundingInr || 0},
            "claimStatus" = ${newStatus}::"ClaimStatus",
            "updatedAt" = NOW()
          WHERE id = ${id}
        `;
      } else {
        throw error;
      }
    }

    // Update FAQs if provided
    if (data.faqs) {
      // Delete existing FAQs
      await prisma.$executeRaw`
        DELETE FROM "StartupFAQ" WHERE "startupId" = ${id}
      `;
      
      // Insert new FAQs
      for (const faq of data.faqs) {
        await prisma.$executeRaw`
          INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${id}, ${faq.question}, ${faq.answer}, ${faq.order}, NOW(), NOW())
        `;
      }
    }

    // TODO: Send notification to admin if status changed to PENDING
    // TODO: Send confirmation email to founder

    revalidatePath('/founder/startups');
    revalidatePath(`/founder/startups/${slug}`);
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
