"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";

const ALLOWED_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER", "AD_MANAGER"];

export async function getSubscribersAction(page = 1, limit = 20, search = "") {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role)) {
    return { success: false, error: "Unauthorized", data: [], total: 0, pages: 0 };
  }

  try {
    const offset = (page - 1) * limit;
    const searchPattern = `%${search}%`;
    const limitInt = Number(limit);
    const offsetInt = Number(offset);

    const rows: any[] = search
      ? await prisma.$queryRawUnsafe(
          `SELECT id, email, name, source, "isActive", tags, "subscribedAt"::text AS "subscribedAt"
           FROM "NewsletterSubscriber"
           WHERE (email ILIKE $1 OR name ILIKE $1)
           ORDER BY "subscribedAt" DESC
           LIMIT $2 OFFSET $3`,
          searchPattern, limitInt, offsetInt
        )
      : await prisma.$queryRawUnsafe(
          `SELECT id, email, name, source, "isActive", tags, "subscribedAt"::text AS "subscribedAt"
           FROM "NewsletterSubscriber"
           ORDER BY "subscribedAt" DESC
           LIMIT $1 OFFSET $2`,
          limitInt, offsetInt
        );

    const countRows: any[] = search
      ? await prisma.$queryRawUnsafe(
          `SELECT COUNT(*) as count FROM "NewsletterSubscriber" WHERE (email ILIKE $1 OR name ILIKE $1)`,
          searchPattern
        )
      : await prisma.$queryRaw`SELECT COUNT(*) as count FROM "NewsletterSubscriber"`;

    const total = Number(countRows[0]?.count || 0);

    return {
      success: true,
      data: rows,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (e: any) {
    console.error("getSubscribersAction error:", e);
    return { success: false, error: e.message, data: [], total: 0, pages: 0 };
  }
}

export async function deleteSubscriberAction(id: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.$executeRaw`DELETE FROM "NewsletterSubscriber" WHERE id = ${id}`;
    return { success: true };
  } catch (e: any) {
    console.error("deleteSubscriberAction error:", e);
    return { success: false, error: e.message };
  }
}
