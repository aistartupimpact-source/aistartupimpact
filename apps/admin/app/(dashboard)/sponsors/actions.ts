'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

export async function getSponsorsAction() {
  try {
    const sponsors = await sql`
      SELECT id, brand, tagline, "ctaUrl", "logoUrl", "isActive", "sortOrder",
             "startDate"::text AS "startDate", "endDate"::text AS "endDate",
             "createdAt"::text AS "createdAt"
      FROM "Sponsor"
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `;
    return { success: true, data: sponsors };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createSponsorAction(data: {
  brand: string; tagline: string; ctaUrl: string; logoUrl?: string;
  isActive: boolean; sortOrder: number; startDate?: string; endDate?: string;
}) {
  try {
    await sql`
      INSERT INTO "Sponsor" (id, brand, tagline, "ctaUrl", "logoUrl", "isActive", "sortOrder", "startDate", "endDate", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(), ${data.brand}, ${data.tagline}, ${data.ctaUrl},
        ${data.logoUrl || null}, ${data.isActive}, ${data.sortOrder},
        ${data.startDate ? data.startDate + 'T00:00:00' : null}::timestamp,
        ${data.endDate ? data.endDate + 'T23:59:59' : null}::timestamp,
        NOW(), NOW()
      )
    `;
    revalidatePath('/sponsors');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSponsorAction(id: string, data: {
  brand: string; tagline: string; ctaUrl: string; logoUrl?: string;
  isActive: boolean; sortOrder: number; startDate?: string; endDate?: string;
}) {
  try {
    await sql`
      UPDATE "Sponsor" SET
        brand = ${data.brand}, tagline = ${data.tagline}, "ctaUrl" = ${data.ctaUrl},
        "logoUrl" = ${data.logoUrl || null}, "isActive" = ${data.isActive},
        "sortOrder" = ${data.sortOrder},
        "startDate" = ${data.startDate ? data.startDate + 'T00:00:00' : null}::timestamp,
        "endDate" = ${data.endDate ? data.endDate + 'T23:59:59' : null}::timestamp,
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath('/sponsors');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteSponsorAction(id: string) {
  try {
    await sql`DELETE FROM "Sponsor" WHERE id = ${id}`;
    revalidatePath('/sponsors');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleSponsorStatusAction(id: string, current: boolean) {
  try {
    await sql`UPDATE "Sponsor" SET "isActive" = ${!current}, "updatedAt" = NOW() WHERE id = ${id}`;
    revalidatePath('/sponsors');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
