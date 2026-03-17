'use server';

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';

const sql = neon(process.env.DATABASE_URL!);

export async function getPublishedArticlesForHeroAction() {
  try {
    const rows = await sql`
      SELECT
        a.id, a.title, a.slug, a.type, a.excerpt,
        a."coverImage", a."thumbnailImage", a."readTimeMinutes",
        a."publishedAt"::text AS "publishedAt",
        u.name AS "authorName",
        c.name AS "categoryName"
      FROM "Article" a
      LEFT JOIN "User" u ON u.id = a."authorId"
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      WHERE a.status = 'PUBLISHED' AND a."deletedAt" IS NULL
      ORDER BY a."publishedAt" DESC NULLS LAST
      LIMIT 50
    `;
    return rows as any[];
  } catch (e) {
    console.error('getPublishedArticlesForHeroAction error:', e);
    return [];
  }
}

export async function getHeroSlotsAction() {
  try {
    const rows = await sql`
      SELECT id, title, excerpt, "coverImage", "ctaUrl", "ctaLabel",
             "badgeText", "badgeColor", "authorName", "readTimeMinutes",
             "startDate"::text AS "startDate", "endDate"::text AS "endDate",
             "isActive", "sortOrder", "createdAt"::text AS "createdAt"
      FROM "HeroSlot"
      ORDER BY "sortOrder" ASC, "createdAt" DESC
    `;
    return rows;
  } catch (e) {
    console.error('getHeroSlotsAction error:', e);
    return [];
  }
}

export async function createHeroSlotAction(data: {
  title: string; excerpt?: string; coverImage?: string;
  ctaUrl: string; ctaLabel?: string; badgeText?: string;
  authorName?: string; readTimeMinutes?: number;
  startDate: string; endDate: string; isActive?: boolean; sortOrder?: number;
}) {
  try {
    await sql`
      INSERT INTO "HeroSlot" (
        id, title, excerpt, "coverImage", "ctaUrl", "ctaLabel",
        "badgeText", "authorName", "readTimeMinutes",
        "startDate", "endDate", "isActive", "sortOrder", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${data.title}, ${data.excerpt || null}, ${data.coverImage || null},
        ${data.ctaUrl}, ${data.ctaLabel || 'Read Story'}, ${data.badgeText || 'Featured'},
        ${data.authorName || null}, ${data.readTimeMinutes || null},
        ${data.startDate}::timestamptz, ${data.endDate}::timestamptz,
        ${data.isActive !== false}, ${data.sortOrder || 0}, NOW(), NOW()
      )
    `;
    revalidatePath('/hero-slots');
    return { success: true };
  } catch (e: any) {
    console.error('createHeroSlotAction error:', e);
    return { success: false, error: e.message };
  }
}

export async function updateHeroSlotAction(id: string, data: {
  title: string; excerpt?: string; coverImage?: string;
  ctaUrl: string; ctaLabel?: string; badgeText?: string;
  authorName?: string; readTimeMinutes?: number;
  startDate: string; endDate: string; isActive: boolean; sortOrder?: number;
}) {
  try {
    await sql`
      UPDATE "HeroSlot" SET
        title = ${data.title},
        excerpt = ${data.excerpt || null},
        "coverImage" = ${data.coverImage || null},
        "ctaUrl" = ${data.ctaUrl},
        "ctaLabel" = ${data.ctaLabel || 'Read Story'},
        "badgeText" = ${data.badgeText || 'Featured'},
        "authorName" = ${data.authorName || null},
        "readTimeMinutes" = ${data.readTimeMinutes || null},
        "startDate" = ${data.startDate}::timestamptz,
        "endDate" = ${data.endDate}::timestamptz,
        "isActive" = ${data.isActive},
        "sortOrder" = ${data.sortOrder || 0},
        "updatedAt" = NOW()
      WHERE id = ${id}
    `;
    revalidatePath('/hero-slots');
    return { success: true };
  } catch (e: any) {
    console.error('updateHeroSlotAction error:', e);
    return { success: false, error: e.message };
  }
}

export async function deleteHeroSlotAction(id: string) {
  try {
    await sql`DELETE FROM "HeroSlot" WHERE id = ${id}`;
    revalidatePath('/hero-slots');
    return { success: true };
  } catch (e: any) {
    console.error('deleteHeroSlotAction error:', e);
    return { success: false, error: e.message };
  }
}
