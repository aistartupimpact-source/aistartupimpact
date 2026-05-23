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
  affiliateUrl?: string;
  categoryId: string;
  pricingModel: string;
  pricingUrl?: string;
  startingPrice?: number | null;
  hasApi?: boolean;
  hasMobileApp?: boolean;
  launchYear?: number;
  founderNames?: string[];
  headquartersCountry?: string;
  avgRating: number;
  listingTier?: string;
  status?: string;
  screenshotUrls?: string[];
  faqs?: Array<{ question: string; answer: string; order: number }>;
}) {
  try {
    const result = await sql`
      INSERT INTO "AiTool" (
        id, name, slug, tagline, description, "websiteUrl", "logoUrl", "affiliateUrl",
        "categoryId", "pricingModel", "pricingUrl", "startingPrice",
        "hasApi", "hasMobileApp", "launchYear", "founderNames", "headquartersCountry",
        "avgRating", "listingTier", status, "screenshotUrls", "aiSuggestedEdits",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        ${data.name}, ${data.slug}, ${data.tagline}, ${data.description},
        ${data.websiteUrl}, ${data.logoUrl || null}, ${data.affiliateUrl || null},
        ${data.categoryId}, ${data.pricingModel}::"PricingModel",
        ${data.pricingUrl || null}, ${data.startingPrice ? Math.round(data.startingPrice * 8300 * 100) : null},
        ${data.hasApi ?? false}, ${data.hasMobileApp ?? false},
        ${data.launchYear || new Date().getFullYear()},
        ${data.founderNames || []}, ${data.headquartersCountry || null},
        ${data.avgRating}, ${data.listingTier || 'STANDARD'}::"ListingTier",
        ${data.status || 'APPROVED'}::"ToolApprovalStatus",
        ${data.screenshotUrls || []}, ARRAY[]::text[],
        NOW(), NOW()
      )
      RETURNING id
    `;
    
    const toolId = result[0].id;
    
    // Insert FAQs if provided
    if (data.faqs && data.faqs.length > 0) {
      for (const faq of data.faqs) {
        await sql`
          INSERT INTO "ToolFAQ" (id, "toolId", question, answer, "order", "createdAt", "updatedAt")
          VALUES (gen_random_uuid()::text, ${toolId}, ${faq.question}, ${faq.answer}, ${faq.order}, NOW(), NOW())
        `;
      }
    }
    
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
  affiliateUrl?: string;
  categoryId: string;
  pricingModel: string;
  pricingUrl?: string;
  startingPrice?: number | null;
  hasApi?: boolean;
  hasMobileApp?: boolean;
  launchYear?: number;
  founderNames?: string[];
  headquartersCountry?: string;
  avgRating: number;
  listingTier: string;
  status: string;
  screenshotUrls?: string[];
  faqs?: Array<{ id?: string; question: string; answer: string; order: number }>;
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
        "affiliateUrl" = ${data.affiliateUrl || null},
        "categoryId" = ${data.categoryId},
        "pricingModel" = ${data.pricingModel}::"PricingModel",
        "pricingUrl" = ${data.pricingUrl || null},
        "startingPrice" = ${data.startingPrice ? Math.round(data.startingPrice * 8300 * 100) : null},
        "hasApi" = ${data.hasApi ?? false},
        "hasMobileApp" = ${data.hasMobileApp ?? false},
        "launchYear" = ${data.launchYear || new Date().getFullYear()},
        "founderNames" = ${data.founderNames || []},
        "headquartersCountry" = ${data.headquartersCountry || null},
        "avgRating" = ${data.avgRating},
        "listingTier" = ${data.listingTier}::"ListingTier",
        status = ${data.status}::"ToolApprovalStatus",
        "screenshotUrls" = ${data.screenshotUrls || []},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    
    // Update FAQs if provided
    if (data.faqs !== undefined) {
      // Delete existing FAQs
      await sql`DELETE FROM "ToolFAQ" WHERE "toolId" = ${id}`;
      
      // Insert new FAQs
      if (data.faqs.length > 0) {
        for (const faq of data.faqs) {
          await sql`
            INSERT INTO "ToolFAQ" (id, "toolId", question, answer, "order", "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, ${id}, ${faq.question}, ${faq.answer}, ${faq.order}, NOW(), NOW())
          `;
        }
      }
    }
    
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

export async function getToolFAQsAction(toolId: string) {
  try {
    const faqs = await sql`
      SELECT id, question, answer, "order"
      FROM "ToolFAQ"
      WHERE "toolId" = ${toolId}
      ORDER BY "order" ASC
    `;
    return faqs.map((faq: any) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    }));
  } catch (error) {
    console.error('getToolFAQsAction error:', error);
    return [];
  }
}
