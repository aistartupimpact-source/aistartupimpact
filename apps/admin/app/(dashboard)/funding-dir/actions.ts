'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

export async function getFundingDigestsAction() {
  try {
    console.log('getFundingDigestsAction: Fetching funding digests...');
    const digests = await sql`
      SELECT 
        id, title, date, status, "dealsCount", "totalRaised", deals, "createdAt"
      FROM "FundingDigest"
      ORDER BY date DESC
    `;
    console.log('getFundingDigestsAction: Found', digests.length, 'digests');
    return digests;
  } catch (error) {
    console.error('Error fetching funding digests:', error);
    return [];
  }
}

export async function createFundingDigestAction(data: {
  title: string;
  date: string;
  status: string;
  dealsCount: number;
  totalRaised: string;
  deals: any[];
}) {
  try {
    await sql`
      INSERT INTO "FundingDigest" (
        id, title, date, status, "dealsCount", "totalRaised", deals, "createdAt"
      )
      VALUES (
        gen_random_uuid(), ${data.title}, ${data.date}::date, ${data.status},
        ${data.dealsCount}, ${data.totalRaised}, ${JSON.stringify(data.deals)}, NOW()
      )
    `;

    revalidatePath('/funding-dir');
    return { success: true };
  } catch (error) {
    console.error('Error creating funding digest:', error);
    return { success: false, error: 'Failed to create funding digest' };
  }
}

export async function updateFundingDigestAction(id: string, data: {
  title: string;
  date: string;
  status: string;
  dealsCount: number;
  totalRaised: string;
  deals: any[];
}) {
  try {
    await sql`
      UPDATE "FundingDigest"
      SET 
        title = ${data.title},
        date = ${data.date}::date,
        status = ${data.status},
        "dealsCount" = ${data.dealsCount},
        "totalRaised" = ${data.totalRaised},
        deals = ${JSON.stringify(data.deals)}
      WHERE id = ${id}
    `;

    revalidatePath('/funding-dir');
    return { success: true };
  } catch (error) {
    console.error('Error updating funding digest:', error);
    return { success: false, error: 'Failed to update funding digest' };
  }
}

export async function deleteFundingDigestAction(id: string) {
  try {
    await sql`
      DELETE FROM "FundingDigest" WHERE id = ${id}
    `;

    revalidatePath('/funding-dir');
    return { success: true };
  } catch (error) {
    console.error('Error deleting funding digest:', error);
    return { success: false, error: 'Failed to delete funding digest' };
  }
}

export async function toggleFundingDigestStatusAction(id: string) {
  try {
    await sql`
      UPDATE "FundingDigest"
      SET status = CASE 
        WHEN status = 'PUBLISHED' THEN 'DRAFT'
        ELSE 'PUBLISHED'
      END
      WHERE id = ${id}
    `;

    revalidatePath('/funding-dir');
    return { success: true };
  } catch (error) {
    console.error('Error toggling funding digest status:', error);
    return { success: false, error: 'Failed to toggle status' };
  }
}