'use server';

import { neon } from '@neondatabase/serverless';

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
        "claimStatus" AS status,
        "createdAt"::text AS "createdAt"
      FROM "Startup"
      WHERE "ownerId" = ${founderId}
      ORDER BY "createdAt" DESC
    `;

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
