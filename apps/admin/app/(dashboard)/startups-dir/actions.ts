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
    `;    return startups;
  } catch (error) {
    console.error('Error fetching startups:', error);
    return [];
  }
}

export async function createStartupAction(data: {
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  websiteUrl?: string;
  stage: string;
  headquartersCity?: string;
  isFeatured?: boolean;
  statValue?: string;
  statLabel?: string;
}) {
  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Math.random().toString(36).substring(2, 6);
    await sql`
      INSERT INTO "Startup" (
        id, name, slug, tagline, description, "logoUrl", "websiteUrl", stage, "headquartersCity",
        "isFeatured", "isIndian", "createdAt", "updatedAt"
      )
      VALUES (
        gen_random_uuid(), ${data.name}, ${slug}, ${data.tagline}, ${data.description},
        ${data.logoUrl || null}, ${data.websiteUrl || null}, ${data.stage}::"StartupStage", ${data.headquartersCity || null},
        ${data.isFeatured || false}, true, NOW(), NOW()
      )
    `;

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
  stage: string;
  headquartersCity?: string;
  isFeatured?: boolean;
  foundedYear?: number | null;
  employeeCount?: number | null;
  impactScore?: number | null;
}) {
  try {
    await sql`
      UPDATE "Startup"
      SET 
        name = ${data.name},
        tagline = ${data.tagline},
        description = ${data.description},
        "logoUrl" = ${data.logoUrl || null},
        "websiteUrl" = ${data.websiteUrl || null},
        stage = ${data.stage}::"StartupStage",
        "headquartersCity" = ${data.headquartersCity || null},
        "isFeatured" = ${data.isFeatured || false},
        "foundedYear" = ${data.foundedYear || null},
        "employeeCount" = ${data.employeeCount || null},
        "impactScore" = ${data.impactScore || null},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

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
    await sql`
      UPDATE "Startup"
      SET 
        "isFeatured" = ${isFeatured},
        "featuredUntil" = ${isFeatured ? sql`NOW() + INTERVAL '30 days'` : null},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    revalidatePath('/startups-dir');
    return { success: true };
  } catch (error) {
    console.error('Error toggling featured status:', error);
    return { success: false, error: 'Failed to update featured status' };
  }
}