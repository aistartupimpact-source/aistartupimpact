'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

export async function getStartupsAction() {
  try {
    const startups = await sql`
      SELECT 
        id, name, tagline, description, "logoUrl", "websiteUrl", "linkedinUrl", "twitterUrl",
        "foundedYear", "headquartersCity", stage, "totalFundingInr", "employeeCount",
        "isFeatured", "featuredUntil", "impactScore", "createdAt", "updatedAt"
      FROM "Startup"
      WHERE "deletedAt" IS NULL
      ORDER BY "isFeatured" DESC, "createdAt" DESC
    `;
    return startups;
  } catch (error) {
    console.error('Error fetching startups:', error);
    return [];
  }
}

export async function getStartupFAQsAction(startupId: string) {
  try {
    const faqs = await sql`
      SELECT id, "startupId", question, answer, "order", "createdAt", "updatedAt"
      FROM "StartupFAQ"
      WHERE "startupId" = ${startupId}
      ORDER BY "order" ASC
    `;
    return faqs;
  } catch (error) {
    console.error('Error fetching startup FAQs:', error);
    return [];
  }
}

export async function createStartupAction(data: {
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  stage: string;
  headquartersCity?: string;
  isFeatured?: boolean;
  foundedYear?: number | null;
  employeeCount?: number | null;
  impactScore?: number | null;
  faqs?: Array<{ question: string; answer: string; order: number }>;
}) {
  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 6);
    // Ensure impactScore is never null - default to 0 if not provided
    const impactScore = data.impactScore ?? 0;
    
    const result = await sql`
      INSERT INTO "Startup" (
        id, name, slug, tagline, description, "logoUrl", "websiteUrl", "linkedinUrl", "twitterUrl", stage, "headquartersCity",
        "isFeatured", "isIndian", "impactScore", "foundedYear", "employeeCount", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${data.name}, ${slug}, ${data.tagline}, ${data.description},
        ${data.logoUrl || null}, ${data.websiteUrl || null}, ${data.linkedinUrl || null}, ${data.twitterUrl || null}, ${data.stage}::"StartupStage", ${data.headquartersCity || null},
        ${data.isFeatured || false}, true, ${impactScore}, ${data.foundedYear || null}, ${data.employeeCount || null}, NOW(), NOW()
      )
      RETURNING id
    `;

    const startupId = result[0]?.id;

    // Insert FAQs if provided
    if (startupId && data.faqs && data.faqs.length > 0) {
      for (const faq of data.faqs) {
        await sql`
          INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${startupId}, ${faq.question}, ${faq.answer}, ${faq.order}, NOW(), NOW())
        `;
      }
    }

    revalidatePath('/startups-dir');
    return { success: true };
  } catch (error) {
    console.error('Error creating startup:', error);
    return { success: false, error: 'Failed to create startup' };
  }
}

export async function updateStartupAction(id: string, data: {
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  stage: string;
  headquartersCity?: string;
  isFeatured?: boolean;
  foundedYear?: number | null;
  employeeCount?: number | null;
  impactScore?: number | null;
  faqs?: Array<{ question: string; answer: string; order: number }>;
}) {
  try {
    // Ensure impactScore is never null - default to 0 if not provided
    const impactScore = data.impactScore ?? 0;
    
    await sql`
      UPDATE "Startup"
      SET 
        name = ${data.name},
        tagline = ${data.tagline},
        description = ${data.description},
        "logoUrl" = ${data.logoUrl || null},
        "websiteUrl" = ${data.websiteUrl || null},
        "linkedinUrl" = ${data.linkedinUrl || null},
        "twitterUrl" = ${data.twitterUrl || null},
        stage = ${data.stage}::"StartupStage",
        "headquartersCity" = ${data.headquartersCity || null},
        "isFeatured" = ${data.isFeatured || false},
        "foundedYear" = ${data.foundedYear || null},
        "employeeCount" = ${data.employeeCount || null},
        "impactScore" = ${impactScore},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    // Update FAQs if provided
    if (data.faqs !== undefined) {
      // Delete existing FAQs
      await sql`DELETE FROM "StartupFAQ" WHERE "startupId" = ${id}`;
      
      // Insert new FAQs
      if (data.faqs.length > 0) {
        for (const faq of data.faqs) {
          await sql`
            INSERT INTO "StartupFAQ" (id, "startupId", question, answer, "order", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${id}, ${faq.question}, ${faq.answer}, ${faq.order}, NOW(), NOW())
          `;
        }
      }
    }

    revalidatePath('/startups-dir');
    return { success: true };
  } catch (error) {
    console.error('Error updating startup:', error);
    return { success: false, error: 'Failed to update startup' };
  }
}

export async function deleteStartupAction(id: string) {
  try {
    await sql`
      UPDATE "Startup"
      SET "deletedAt" = NOW()
      WHERE id = ${id}
    `;

    revalidatePath('/startups-dir');
    return { success: true };
  } catch (error) {
    console.error('Error deleting startup:', error);
    return { success: false, error: 'Failed to delete startup' };
  }
}

export async function toggleFeaturedAction(id: string, isFeatured: boolean) {
  try {
    if (isFeatured) {
      // Set featured with expiry date
      await sql`
        UPDATE "Startup"
        SET 
          "isFeatured" = ${isFeatured},
          "featuredUntil" = NOW() + INTERVAL '30 days',
          "updatedAt" = NOW()
        WHERE id = ${id}
      `;
    } else {
      // Unset featured
      await sql`
        UPDATE "Startup"
        SET 
          "isFeatured" = ${isFeatured},
          "featuredUntil" = NULL,
          "updatedAt" = NOW()
        WHERE id = ${id}
      `;
    }

    revalidatePath('/startups-dir');
    return { success: true };
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return { success: false, error: 'Failed to update featured status' };
  }
}

// One-time fix for null impactScore values
export async function fixNullImpactScoresAction() {
  try {
    const result = await sql`
      UPDATE "Startup"
      SET "impactScore" = 0
      WHERE "impactScore" IS NULL
    `;
    
    return { success: true, message: `Fixed ${result.length} startups with null impactScore` };
  } catch (error) {
    console.error('Error fixing null impactScores:', error);
    return { success: false, error: 'Failed to fix null impactScores' };
  }
}