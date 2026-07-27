'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { logAuditEvent, canDelete } from '@/lib/audit-log';

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
    // Get tool details and owner email
    const tools = await sql`
      SELECT t.id, t.name, t.slug, t."ownerId",
             fu.email AS "founderEmail", fu.name AS "founderName"
      FROM "AiTool" t
      LEFT JOIN "FounderUser" fu ON fu.id = t."ownerId"
      WHERE t.id = ${id}
      LIMIT 1
    `;

    if (tools.length === 0) {
      return { success: false, error: 'Tool not found' };
    }

    const tool = tools[0] as any;

    await sql`
      UPDATE "AiTool"
      SET
        status = 'APPROVED'::"ToolApprovalStatus",
        "claimStatus" = 'CLAIMED',
        "approvedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    // Send approval email to founder if they have an email
    if (tool.founderEmail) {
      try {
        const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost'))
          ? process.env.NEXT_PUBLIC_SITE_URL
          : 'https://aistartupimpact.com';
        const liveUrl = `${siteUrl}/tools/${tool.slug}`;
        const dashboardUrl = `${siteUrl}/founder/dashboard`;

        const { Resend } = await import('resend');
        const resendKey = process.env.RESEND_API_KEY;
        if (resendKey) {
          const resend = new Resend(resendKey);
          await resend.emails.send({
            from: `${process.env.RESEND_FROM_NAME || 'AI Startup Impact'} <${process.env.RESEND_FROM_EMAIL || 'no-reply@aistartupimpact.com'}>`,
            to: tool.founderEmail,
            subject: `Your tool "${tool.name}" is now live on AI Startup Impact`,
            html: `
              <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px;">
                  <h1 style="color: #111827; font-size: 20px; font-weight: 700; margin: 0;">AI Startup Impact</h1>
                </div>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 8px;">Hi ${tool.founderName || 'there'},</p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  Your AI tool <strong>"${tool.name}"</strong> has been reviewed and approved by our editorial team. Your listing is now live and discoverable by developers, enterprise buyers, and the broader AI community.
                </p>

                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                  <p style="color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; font-weight: 600;">Your Live Listing</p>
                  <a href="${liveUrl}" style="color: #6366f1; font-size: 15px; font-weight: 600; text-decoration: none;">${liveUrl}</a>
                </div>

                <div style="margin: 32px 0;">
                  <a href="${liveUrl}" style="background: #111827; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600;">View Your Listing</a>
                  <a href="${dashboardUrl}" style="background: #ffffff; color: #374151; padding: 12px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-size: 14px; font-weight: 600; border: 1px solid #d1d5db; margin-left: 12px;">Founder Dashboard</a>
                </div>

                <p style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 8px;">
                  To increase visibility, we recommend sharing your listing on LinkedIn and with your network.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                
                <p style="color: #6b7280; font-size: 13px; line-height: 1.5; margin: 0;">
                  Best regards,<br/>
                  The AI Startup Impact Team<br/>
                  <a href="${siteUrl}" style="color: #6366f1; text-decoration: none;">${siteUrl}</a>
                </p>
              </div>
            `
          });
        }
      } catch (emailError) {
        console.error('Failed to send tool approval email:', emailError);
        // Don't fail the approval if email fails
      }
    }

    revalidatePath('/tools-dir');

    // Audit log
    await logAuditEvent({
      action: 'APPROVE',
      resourceType: 'AI_TOOL',
      resourceId: id,
      after: { name: tool.name, slug: tool.slug },
    });

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
    const cats = await sql`
      SELECT c.id, c.name, c.slug, c."parentId",
             p.name AS "parentName", p.slug AS "parentSlug", p.icon AS "parentIcon"
      FROM "ToolCategory" c
      LEFT JOIN "ToolCategory" p ON p.id = c."parentId"
      WHERE c.level = 1 AND c."isActive" = true
      ORDER BY p."sortOrder" ASC, c."sortOrder" ASC, c.name ASC
    `;
    return cats;
  } catch (error) {
    console.error('getCategoriesAction error:', error);
    return [];
  }
}

export async function getCategoryTreeAction() {
  try {
    const parents = await sql`
      SELECT id, name, slug, icon, description, "toolCount", "sortOrder"
      FROM "ToolCategory"
      WHERE level = 0 AND "isActive" = true
      ORDER BY "sortOrder" ASC
    `;
    const subcategories = await sql`
      SELECT id, name, slug, description, "parentId", "toolCount", "sortOrder"
      FROM "ToolCategory"
      WHERE level = 1 AND "isActive" = true
      ORDER BY "sortOrder" ASC, name ASC
    `;

    const subsByParent: Record<string, any[]> = {};
    for (const sub of subcategories) {
      const pid = (sub as any).parentId;
      if (!subsByParent[pid]) subsByParent[pid] = [];
      subsByParent[pid].push(sub);
    }

    return parents.map((p: any) => ({
      ...p,
      subcategories: subsByParent[p.id] || [],
    }));
  } catch (error) {
    console.error('getCategoryTreeAction error:', error);
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
    // Check for duplicate name or slug
    const existingTool = await sql`
      SELECT id FROM "AiTool"
      WHERE (LOWER(name) = LOWER(${data.name}) OR slug = ${data.slug}) AND "deletedAt" IS NULL
      LIMIT 1
    `;
    if (existingTool.length > 0) {
      return { success: false, error: 'A tool with this name or slug already exists' };
    }

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

    // Audit log
    await logAuditEvent({
      action: 'CREATE',
      resourceType: 'AI_TOOL',
      resourceId: toolId,
      after: { name: data.name, slug: data.slug, pricingModel: data.pricingModel, status: data.status },
    });

    return { success: true, toolId };
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

    // Audit log
    await logAuditEvent({
      action: 'UPDATE',
      resourceType: 'AI_TOOL',
      resourceId: id,
      after: { name: data.name, pricingModel: data.pricingModel, status: data.status },
    });

    return { success: true };
  } catch (error: any) {
    console.error('updateToolAction error:', error);
    return { success: false, error: error.message || 'Failed to update tool' };
  }
}

export async function deleteToolAction(id: string) {
  // Only SUPER_ADMIN can delete
  const { allowed, error } = await canDelete();
  if (!allowed) {
    return { success: false, error: error || 'Unauthorized' };
  }

  try {
    // Capture before state for audit
    const existing = await sql`SELECT id, name, slug FROM "AiTool" WHERE id = ${id} LIMIT 1`;
    const before = existing[0] || null;

    await sql`UPDATE "AiTool" SET "deletedAt" = NOW() WHERE id = ${id}`;
    revalidatePath('/tools-dir');

    // Audit log
    await logAuditEvent({
      action: 'DELETE',
      resourceType: 'AI_TOOL',
      resourceId: id,
      before: before ? { name: before.name, slug: before.slug } : undefined,
    });

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

// ─── Tool Featured Campaign System ─────────────────────────────────────────

const TOOL_TIER_SLOTS: Record<string, number> = {
  FEATURED: 1,
  PRIORITY: 4,
  FREE: 6,
};

export async function getToolFeaturedCampaignsAction() {
  try {
    const campaigns = await sql`
      SELECT tfc.id, tfc."toolId", tfc.tier, tfc."startDate", tfc."endDate",
             tfc.notes, tfc."pricePaid", tfc."cancelledAt", tfc."createdAt",
             t.name AS "toolName", t."logoUrl"
      FROM "ToolFeaturedCampaign" tfc
      JOIN "AiTool" t ON t.id = tfc."toolId"
      ORDER BY
        CASE WHEN tfc."cancelledAt" IS NOT NULL THEN 2
             WHEN tfc."startDate" > NOW() THEN 1
             ELSE 0 END ASC,
        tfc.tier ASC,
        tfc."startDate" ASC
    `;
    return campaigns;
  } catch (error) {
    console.error('Error fetching tool featured campaigns:', error);
    return [];
  }
}

export async function scheduleToolFeaturedCampaignAction(data: {
  toolId: string;
  tier: 'FEATURED' | 'PRIORITY' | 'FREE';
  startDate: string;
  endDate: string;
  notes?: string;
  pricePaid?: number;
}) {
  try {
    const { toolId, tier, startDate, endDate, notes, pricePaid } = data;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      return { success: false, error: 'End date must be after start date' };
    }

    // Check slot availability
    const overlapping = await sql`
      SELECT COUNT(*)::int AS count
      FROM "ToolFeaturedCampaign"
      WHERE tier = ${tier}::"ListingTier"
        AND "cancelledAt" IS NULL
        AND tsrange("startDate", "endDate", '[]') && tsrange(${startDate}::timestamp, ${endDate}::timestamp, '[]')
    `;

    const usedSlots = (overlapping[0] as any).count;
    const maxSlots = TOOL_TIER_SLOTS[tier] || 4;

    if (usedSlots >= maxSlots) {
      const nextAvailable = await sql`
        SELECT "endDate"
        FROM "ToolFeaturedCampaign"
        WHERE tier = ${tier}::"ListingTier"
          AND "cancelledAt" IS NULL
          AND "endDate" > NOW()
        ORDER BY "endDate" ASC
        LIMIT 1
      `;

      const nextDate = nextAvailable.length > 0
        ? new Date((nextAvailable[0] as any).endDate).toISOString().split('T')[0]
        : null;

      return {
        success: false,
        error: `All ${maxSlots} ${tier} slot(s) are booked for this period.`,
        nextAvailableDate: nextDate,
        slotsUsed: usedSlots,
        slotsMax: maxSlots
      };
    }

    // Insert campaign
    try {
      await sql`
        INSERT INTO "ToolFeaturedCampaign" (id, "toolId", tier, "startDate", "endDate", notes, "pricePaid", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${toolId}, ${tier}::"ListingTier", ${startDate}::timestamp, ${endDate}::timestamp, ${notes || null}, ${pricePaid || null}, NOW(), NOW())
      `;
    } catch (dbError: any) {
      if (dbError.message?.includes('no_overlapping_tool_campaigns')) {
        return { success: false, error: 'Slot conflict — another campaign was just booked for this window. Please try a different date range.' };
      }
      throw dbError;
    }

    // Update legacy listingTier on the tool for backward compat
    if (start <= new Date()) {
      await sql`UPDATE "AiTool" SET "listingTier" = ${tier}::"ListingTier", "updatedAt" = NOW() WHERE id = ${toolId}`;
    }

    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('Error scheduling tool featured campaign:', error);
    return { success: false, error: error.message || 'Failed to schedule campaign' };
  }
}

export async function cancelToolFeaturedCampaignAction(campaignId: string) {
  try {
    const result = await sql`
      UPDATE "ToolFeaturedCampaign"
      SET "cancelledAt" = NOW(), "updatedAt" = NOW()
      WHERE id = ${campaignId} AND "cancelledAt" IS NULL
      RETURNING "toolId"
    `;

    if (result.length > 0) {
      const toolId = (result[0] as any).toolId;
      const activeCampaigns = await sql`
        SELECT COUNT(*)::int AS count FROM "ToolFeaturedCampaign"
        WHERE "toolId" = ${toolId}
          AND "cancelledAt" IS NULL
          AND "startDate" <= NOW() AND "endDate" >= NOW()
      `;
      if ((activeCampaigns[0] as any).count === 0) {
        await sql`UPDATE "AiTool" SET "listingTier" = 'FREE'::"ListingTier", "updatedAt" = NOW() WHERE id = ${toolId}`;
      }
    }

    revalidatePath('/tools-dir');
    return { success: true };
  } catch (error: any) {
    console.error('Error cancelling tool featured campaign:', error);
    return { success: false, error: error.message || 'Failed to cancel campaign' };
  }
}
