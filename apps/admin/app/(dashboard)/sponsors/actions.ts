'use server';

import { prisma } from '@aistartupimpact/database';
import { revalidatePath } from 'next/cache';

export async function getSponsorsAction() {
  try {
    // Use the same pattern as other admin pages
    const sponsors = await prisma.$queryRawUnsafe(`
      SELECT 
        id::text as id,
        brand,
        tagline,
        "ctaUrl",
        "logoUrl",
        "isActive",
        "sortOrder",
        "createdAt"::text as "createdAt",
        "updatedAt"::text as "updatedAt"
      FROM "Sponsor"
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `);

    return { success: true, data: sponsors };
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return { success: false, error: `Failed to fetch sponsors: ${(error as any).message}` };
  }
}

export async function createSponsorAction(formData: FormData) {
  try {
    const brand = formData.get('brand') as string;
    const tagline = formData.get('tagline') as string;
    const ctaUrl = formData.get('ctaUrl') as string;
    const logoUrl = formData.get('logoUrl') as string;
    const isActive = formData.get('isActive') === 'true';
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;

    if (!brand || !tagline || !ctaUrl) {
      return { success: false, error: 'Brand, tagline, and CTA URL are required' };
    }

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Sponsor" (id, brand, tagline, "ctaUrl", "logoUrl", "isActive", "sortOrder", "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, brand, tagline, ctaUrl, logoUrl || null, isActive, sortOrder);

    revalidatePath('/sponsors');
    return { success: true };
  } catch (error) {
    console.error('Error creating sponsor:', error);
    return { success: false, error: 'Failed to create sponsor' };
  }
}

export async function updateSponsorAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const brand = formData.get('brand') as string;
    const tagline = formData.get('tagline') as string;
    const ctaUrl = formData.get('ctaUrl') as string;
    const logoUrl = formData.get('logoUrl') as string;
    const isActive = formData.get('isActive') === 'true';
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;

    if (!id || !brand || !tagline || !ctaUrl) {
      return { success: false, error: 'ID, brand, tagline, and CTA URL are required' };
    }

    await prisma.$executeRawUnsafe(`
      UPDATE "Sponsor" 
      SET brand = $2, tagline = $3, "ctaUrl" = $4, "logoUrl" = $5, "isActive" = $6, "sortOrder" = $7, "updatedAt" = NOW()
      WHERE id = $1
    `, id, brand, tagline, ctaUrl, logoUrl || null, isActive, sortOrder);

    revalidatePath('/sponsors');
    return { success: true };
  } catch (error) {
    console.error('Error updating sponsor:', error);
    return { success: false, error: 'Failed to update sponsor' };
  }
}

export async function deleteSponsorAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;

    if (!id) {
      return { success: false, error: 'Sponsor ID is required' };
    }

    await prisma.$executeRawUnsafe(`
      DELETE FROM "Sponsor" WHERE id = $1
    `, id);

    revalidatePath('/sponsors');
    return { success: true };
  } catch (error) {
    console.error('Error deleting sponsor:', error);
    return { success: false, error: 'Failed to delete sponsor' };
  }
}

export async function toggleSponsorStatusAction(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    const isActive = formData.get('isActive') === 'true';

    if (!id) {
      return { success: false, error: 'Sponsor ID is required' };
    }

    await prisma.$executeRawUnsafe(`
      UPDATE "Sponsor" 
      SET "isActive" = $2, "updatedAt" = NOW()
      WHERE id = $1
    `, id, !isActive);

    revalidatePath('/sponsors');
    return { success: true };
  } catch (error) {
    console.error('Error toggling sponsor status:', error);
    return { success: false, error: 'Failed to toggle sponsor status' };
  }
}