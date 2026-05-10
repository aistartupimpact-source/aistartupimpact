'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

export async function getToolsAction() {
  try {
    const tools = await sql`
      SELECT
        t.id, t.name, t.slug, t.tagline, t.description, t."websiteUrl", t."logoUrl",
        t."pricingModel", t."avgRating", t."listingTier", t.status, t."claimStatus",
        t."founderNames", t."headquartersCountry", t."hasApi", t."hasMobileApp",
        t."pricingUrl", t."startingPrice", t."ownerId",
        t."createdAt", t."updatedAt",
        c.name AS "categoryName", c.id AS "categoryId",
        u.name AS "ownerName", u.email AS "ownerEmail"
      FROM "AiTool" t
      LEFT JOIN "ToolCategory" c ON c.id = t."categoryId"
      LEFT JOIN "User" u ON u.id = t."ownerId"
      WHERE t."deletedAt" IS NULL
      ORDER BY
        CASE WHEN t.status = 'PENDING' THEN 0 ELSE 1 END ASC,
        CASE WHEN t."listingTier" = 'FEATURED' THEN 1
             WHEN t."listingTier" = 'PRIORITY' THEN 2
             ELSE 3 END ASC,
        t."createdAt" DESC
    `;
    return tools;
  } catch (error) {
    console.error('getToolsAction error:', error);
    return [];
  }
}

export async function approveToolAction(id: string) {
  try {
    await sql`
      UPDATE "AiTool"
      SET
        status = 'APPROVED'::"ToolApprovalStatus",
        "claimStatus" = 'CLAIMED',
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('approveToolAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function rejectToolAction(id: string, reason?: string) {
  try {
    await sql`
      UPDATE "AiTool"
      SET
        status = 'ARCHIVED'::"ToolApprovalStatus",
        "claimStatus" = 'REJECTED',
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('rejectToolAction error:', error);
    return { success: false, error: error.message };
  }
}

export async function getCategoriesAction() {
  try {
    const cats = await sql`SELECT id, name, slug FROM "ToolCategory" ORDER BY name ASC`;
    return cats;
  } catch (error) {
    console.error('getCategoriesAction error:', error);
    return [];
  }
}

export async function createToolAction(data: {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  categoryId: string;
  pricingModel: string;
  avgRating: number;
  listingTier: string;
  status: string;
}) {
  try {
    await sql`
      INSERT INTO "AiTool" (
        id, name, slug, tagline, description, "websiteUrl", "logoUrl",
        "categoryId", "pricingModel", "avgRating", "listingTier", status,
        "founderNames", "screenshotUrls", "aiSuggestedEdits",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        ${data.name}, ${data.slug}, ${data.tagline}, ${data.description},
        ${data.websiteUrl}, ${data.logoUrl || null}, ${data.categoryId},
        ${data.pricingModel}::"PricingModel", ${data.avgRating},
        ${data.listingTier}::"ListingTier", ${data.status}::"ToolApprovalStatus",
        ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
        NOW(), NOW()
      )
    `;
    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('createToolAction error:', error);
    return { success: false, error: error.message || 'Failed to create tool' };
  }
}

export async function updateToolAction(id: string, data: {
  name: string;
  tagline: string;
  description: string;
  websiteUrl: string;
  logoUrl?: string;
  categoryId: string;
  pricingModel: string;
  pricingUrl?: string;
  startingPrice?: number | null;
  hasApi?: boolean;
  hasMobileApp?: boolean;
  founderNames?: string[];
  headquartersCountry?: string;
  avgRating: number;
  listingTier: string;
  status: string;
}) {
  try {
    await sql`
      UPDATE "AiTool"
      SET
        name = ${data.name},
        tagline = ${data.tagline},
        description = ${data.description},
        "websiteUrl" = ${data.websiteUrl},
        "logoUrl" = ${data.logoUrl || null},
        "categoryId" = ${data.categoryId},
        "pricingModel" = ${data.pricingModel}::"PricingModel",
        "pricingUrl" = ${data.pricingUrl || null},
        "startingPrice" = ${data.startingPrice ? Math.round(data.startingPrice * 8300 * 100) : null},
        "hasApi" = ${data.hasApi ?? false},
        "hasMobileApp" = ${data.hasMobileApp ?? false},
        "founderNames" = ${data.founderNames || []},
        "headquartersCountry" = ${data.headquartersCountry || null},
        "avgRating" = ${data.avgRating},
        "listingTier" = ${data.listingTier}::"ListingTier",
        status = ${data.status}::"ToolApprovalStatus",
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('updateToolAction error:', error);
    return { success: false, error: error.message || 'Failed to update tool' };
  }
}

export async function deleteToolAction(id: string) {
  try {
    await sql`UPDATE "AiTool" SET "deletedAt" = NOW() WHERE id = ${id}`;
    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('deleteToolAction error:', error);
    return { success: false, error: error.message || 'Failed to delete tool' };
  }
}

export async function setListingTierAction(id: string, tier: string) {
  try {
    await sql`
      UPDATE "AiTool"
      SET "listingTier" = ${tier}::"ListingTier", "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('setListingTierAction error:', error);
    return { success: false, error: error.message || 'Failed to update tier' };
  }
}
