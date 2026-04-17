"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@aistartupimpact/database";
import { revalidatePath } from "next/cache";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadMediaAction(formData: FormData) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized or insufficient permissions to upload media" };
  }

  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const bucketName = process.env.R2_BUCKET_NAME;
    if (!bucketName) {
      return { success: false, error: "R2 Environment variables missing container name" };
    }

    // Generate unique filename securely
    const uniqueId = crypto.randomUUID();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileKey = `uploads/${uniqueId}-${cleanFilename}`;

    // Convert Web File stream to Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: file.type,
      Body: buffer,
    });

    await s3Client.send(command);

    // The frontend Next.js App proxy handles `/v1/media/[key]`, but we can also use R2 Public Domain
    const publicDomain = process.env.R2_PUBLIC_URL || (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");
    const url = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${fileKey}`
      : `${publicDomain}/v1/media/${fileKey}`;

    return {
      success: true,
      data: {
        url,
        id: fileKey,
        fileName: cleanFilename
      }
    };
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return { success: false, error: error.message || "Failed to upload file to storage bucket" };
  }
}

export async function saveArticleAction(payload: any, articleId?: string | null) {
  const session: any = await getServerSession(authOptions);

  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized or insufficient permissions to save articles" };
  }

  try {
    const { title, subtitle, content, type, category, tags, coverImage, thumbnailImage, seoTitle, seoDescription, focusKeyword, slug, status, canonicalUrl, ogImage, noIndex } = payload;
    const authorId = session.user.id;

    let baseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let finalSlug = baseSlug;

    // Check for slug uniqueness
    let isUnique = false;
    let counter = 1;
    while (!isUnique) {
      const existing = await prisma.article.findUnique({
        where: { slug: finalSlug },
        select: { id: true }
      });

      if (!existing || (articleId && existing.id === articleId)) {
        isUnique = true;
      } else {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // The Prisma schema expects `content` to be a `Json` object (for TipTap), but we are storing HTML strings from the legacy editor.
    // Wrap the string in a JSON-compatible object so Neon's HTTP adapter doesn't crash from type mismatch.
    const contentJson = { html: content };

    // Optional: look up categoryId properly later, but for MVP saving, we can use Prisma logic matching the schema
    const data: any = {
      title,
      slug: finalSlug,
      excerpt: subtitle,
      content: contentJson,
      type: type || 'NEWS',
      coverImage,
      thumbnailImage,
      seoTitle,
      seoDescription,
      focusKeyword,
      canonicalUrl,
      ogImage,
      noIndex: noIndex || false,
      status: status || 'DRAFT',
    };

    let article;
    if (articleId) {
      article = await prisma.article.update({
        where: { id: articleId },
        data,
      });
    } else {
      article = await prisma.article.create({
        data: {
          ...data,
          authorId,
        },
      });
    }

    // Refresh dashboard feeds
    revalidatePath("/articles");
    revalidatePath("/dashboard");

    return { success: true, data: article };
  } catch (error: any) {
    console.error("Article Save Error:", error);
    return { success: false, error: error.message || "Failed to save article" };
  }
}

export async function getArticleByIdAction(id: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized" };
  }
  try {
    const rows: any[] = await prisma.$queryRaw`
      SELECT
        a.id, a.title, a.slug, a.status, a.type, a.excerpt,
        a.content, a."coverImage", a."thumbnailImage", a."seoTitle", a."seoDescription",
        a."focusKeyword", a."isFeatured", a."isPinned", a."isSponsored",
        a."canonicalUrl", a."ogImage", a."noIndex",
        a."publishedAt"::text AS "publishedAt",
        a."scheduledAt"::text AS "scheduledAt",
        u.name AS "authorName",
        c.name AS "categoryName"
      FROM "Article" a
      LEFT JOIN "User" u ON u.id = a."authorId"
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      WHERE a.id = ${id} AND a."deletedAt" IS NULL
      LIMIT 1
    `;
    if (!rows.length) return { success: false, error: "Article not found" };
    return { success: true, data: rows[0] };
  } catch (error: any) {
    console.error("Get Article Error:", error);
    return { success: false, error: error.message || "Failed to fetch article" };
  }
}


export async function getArticlesAction() {
  const session: any = await getServerSession(authOptions);
  console.log("[DEBUG] getArticlesAction Session User:", session?.user?.email, "Role:", session?.user?.role);

  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER"].includes(session.user.role)) {
    console.log("[DEBUG] Unauthorized. Expected admin role, got:", session?.user?.role);
    return { success: false, error: "Unauthorized" };
  }

  try {
    // NOTE: Neon HTTP adapter returns DateTime fields as strings, not Date objects.
    // Avoid calling .toISOString() on them — they're already strings.
    // Also avoid orderBy on DateTime columns as it can cause adapter issues; use id ordering instead.
    // NOTE: Some rows have corrupt publishedAt values (e.g. `{}`), which crash the Neon HTTP adapter.
    // Use raw SQL to safely cast it to text and avoid the adapter's strict type parsing.
    const rows: any[] = await prisma.$queryRaw`
      SELECT
        a.id,
        a.title,
        a.slug,
        a.status,
        a.type,
        a."viewCount",
        a."publishedAt"::text AS "publishedAt",
        u.name AS "authorName",
        c.name AS "categoryName"
      FROM "Article" a
      LEFT JOIN "User" u ON u.id = a."authorId"
      LEFT JOIN "Category" c ON c.id = a."categoryId"
      WHERE a."deletedAt" IS NULL
      ORDER BY a.id DESC
    `;

    console.log(`[DEBUG] Found ${rows.length} articles in Prisma DB`);

    const safeData = rows.map((a: any) => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      status: a.status,
      type: a.type,
      viewCount: a.viewCount ?? 0,
      publishedAt: a.publishedAt || null,
      author: { name: a.authorName },
      category: { name: a.categoryName },
    }));

    return { success: true, data: safeData };
  } catch (error: any) {
    console.error("Fetch Articles Error:", error);
    return { success: false, error: error.message || "Failed to fetch articles" };
  }
}

export async function updateArticleStatusAction(id: string, status: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
    if (status === 'PUBLISHED') return { success: false, error: "Unauthorized to publish" };
  }
  try {
    if (status === 'PUBLISHED') {
      await prisma.$executeRaw`UPDATE "Article" SET status = ${status}::"ArticleStatus", "publishedAt" = NOW() WHERE id = ${id}`;
    } else {
      await prisma.$executeRaw`UPDATE "Article" SET status = ${status}::"ArticleStatus" WHERE id = ${id}`;
    }
    revalidatePath("/articles");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Update Article Status Error:", error);
    return { success: false, error: error.message || "Failed to update status" };
  }
}

export async function deleteArticleAction(id: string) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !["SUPER_ADMIN", "EDITOR_IN_CHIEF"].includes(session.user.role)) {
    return { success: false, error: "Unauthorized to delete articles" };
  }
  try {
    // Soft delete to avoid FK constraint failures from related records
    await prisma.$executeRaw`UPDATE "Article" SET "deletedAt" = NOW() WHERE id = ${id}`;
    revalidatePath("/articles");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Article Error:", error);
    return { success: false, error: error.message || "Failed to delete article" };
  }
}
