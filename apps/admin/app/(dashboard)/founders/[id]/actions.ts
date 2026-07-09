'use server';

import { neon } from '@neondatabase/serverless';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const sql = neon(process.env.DATABASE_URL!);

export async function getFounderByIdAction(founderId: string) {
  try {
    // Get founder details
    const founders = await sql`
      SELECT 
        id,
        name,
        email,
        company,
        "companyDomain",
        role,
        phone,
        linkedin,
        twitter,
        website,
        "authProvider",
        "googleId",
        "emailVerified",
        status,
        "onboardingCompleted",
        "onboardingStep",
        avatar,
        bio,
        "createdAt"::text AS "createdAt",
        "lastLoginAt"::text AS "lastLoginAt",
        "updatedAt"::text AS "updatedAt"
      FROM "FounderUser"
      WHERE id = ${founderId}
      LIMIT 1
    `;

    if (founders.length === 0) {
      return { success: false, error: 'Founder not found' };
    }

    const founder = founders[0];

    // Get founder's startups
    const startups = await sql`
      SELECT 
        id,
        name,
        slug,
        tagline,
        description,
        "logoUrl",
        "websiteUrl",
        "linkedinUrl",
        "twitterUrl",
        "foundedYear",
        "headquartersCity",
        stage,
        "employeeCount",
        category,
        "businessType",
        "foundersData",
        "claimStatus" AS status,
        "isApproved",
        "createdAt"::text AS "createdAt"
      FROM "Startup"
      WHERE "ownerId" = ${founderId} AND "deletedAt" IS NULL
      ORDER BY "createdAt" DESC
    `;

    // Fetch FAQs and Funding Rounds for each startup
    if (startups && startups.length > 0) {
      for (const startup of startups) {
        let faqs: any[] = [];
        try {
          faqs = await sql`
            SELECT id, question, answer, "order"
            FROM "StartupFAQ"
            WHERE "startupId" = ${startup.id}
            ORDER BY "order" ASC
          `;
        } catch (faqError) {
          console.error(`Error fetching FAQs for startup ${startup.id}:`, faqError);
        }

        let fundingRounds: any[] = [];
        try {
          fundingRounds = await sql`
            SELECT id, "roundType", "amountUsd", "amountInr", "announcedAt"::text AS "announcedAt", "leadInvestors", "allInvestors"
            FROM "FundingRound"
            WHERE "startupId" = ${startup.id}
            ORDER BY "announcedAt" DESC
          `;
        } catch (fundingError) {
          console.error(`Error fetching FundingRounds for startup ${startup.id}:`, fundingError);
        }

        startup.faqs = faqs || [];
        startup.fundingRounds = fundingRounds || [];
      }
    }

    // Get founder's tools
    const tools = await sql`
      SELECT 
        id,
        name,
        slug,
        tagline,
        status,
        "createdAt"::text AS "createdAt"
      FROM "AiTool"
      WHERE "ownerId" = ${founderId}
      ORDER BY "createdAt" DESC
    `;

    const result = {
      ...founder,
      startups: startups || [],
      tools: tools || [],
    };

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Get founder by ID error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteFounderAction(founderId: string) {
  try {
    const session: any = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admins can delete founders' };
    }

    // Delete founder (CASCADE will handle related records)
    await sql`
      DELETE FROM "FounderUser"
      WHERE id = ${founderId}
    `;

    return { success: true };
  } catch (error: any) {
    console.error('Delete founder error:', error);
    return { success: false, error: error.message || 'Failed to delete founder' };
  }
}

export async function updateFounderStatusAction(founderId: string, newStatus: string) {
  try {
    const session: any = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admins can update founder status' };
    }

    await sql`
      UPDATE "FounderUser"
      SET status = ${newStatus}, "updatedAt" = NOW()
      WHERE id = ${founderId}
    `;

    return { success: true };
  } catch (error: any) {
    console.error('Update founder status error:', error);
    return { success: false, error: error.message || 'Failed to update status' };
  }
}
