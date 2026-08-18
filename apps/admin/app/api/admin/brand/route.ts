import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { logAuditEvent } from "@/lib/audit-log";

const SUPER_ROLES = ["SUPER_ADMIN", "EDITOR_IN_CHIEF"];

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

function getPublicUrl(key: string) {
  if (process.env.R2_PUBLIC_URL) return `${process.env.R2_PUBLIC_URL}/${key}`;
  return `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/v1/media/${key}`;
}

const ALLOWED_TYPES: Record<string, string[]> = {
  logoLight: ["image/svg+xml", "image/png", "image/webp"],
  logoDark: ["image/svg+xml", "image/png", "image/webp"],
  favicon: ["image/png", "image/x-icon", "image/svg+xml", "image/vnd.microsoft.icon"],
  ogImage: ["image/png", "image/jpeg", "image/webp"],
  customFont: ["font/woff2", "application/font-woff2", "application/octet-stream"],
};

const BRAND_KEYS = [
  "brand_logoLight", "brand_logoDark", "brand_favicon", "brand_ogImage",
  "brandColor", "brandSecondary", "brandTertiary", "darkDefault",
  "brand_displayFont", "brand_bodyFont",
  "brand_customDisplayFontUrl", "brand_customBodyFontUrl",
  "brand_customDisplayFontName", "brand_customBodyFontName",
];

export async function POST(request: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions);
    if (!session?.user || !SUPER_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const { action } = body;

      if (action === "saveColors") {
        const { brandColor, brandSecondary, brandTertiary } = body;
        const colorEntries: [string, string][] = [];
        if (brandColor) colorEntries.push(["brandColor", brandColor]);
        if (brandSecondary) colorEntries.push(["brandSecondary", brandSecondary]);
        if (brandTertiary) colorEntries.push(["brandTertiary", brandTertiary]);

        for (const [key, value] of colorEntries) {
          await prisma.siteSetting.upsert({
            where: { key },
            update: { value: value as any, updatedAt: new Date() },
            create: { id: `setting_${key}_${Date.now()}`, key, value: value as any, updatedAt: new Date() },
          });
        }
        logAuditEvent({ action: 'CONFIG_CHANGE', resourceType: 'BRAND', after: { brandColor, brandSecondary, brandTertiary } });
        return NextResponse.json({ success: true });
      }

      if (action === "saveFonts") {
        const { displayFont, bodyFont } = body;
        const fontEntries: [string, string | null][] = [
          ["brand_displayFont", displayFont || null],
          ["brand_bodyFont", bodyFont || null],
        ];
        for (const [key, value] of fontEntries) {
          if (value === null) {
            await prisma.siteSetting.deleteMany({ where: { key } });
          } else {
            await prisma.siteSetting.upsert({
              where: { key },
              update: { value: value as any, updatedAt: new Date() },
              create: { id: `setting_${key}_${Date.now()}`, key, value: value as any, updatedAt: new Date() },
            });
          }
        }
        logAuditEvent({ action: 'CONFIG_CHANGE', resourceType: 'BRAND', after: { displayFont, bodyFont } });
        return NextResponse.json({ success: true });
      }

      if (action === "removeCustomFont") {
        const { role } = body;
        if (role !== "display" && role !== "body") {
          return NextResponse.json({ error: "Invalid font role" }, { status: 400 });
        }
        const prefix = role === "display" ? "brand_customDisplayFont" : "brand_customBodyFont";
        await prisma.siteSetting.deleteMany({ where: { key: { in: [`${prefix}Url`, `${prefix}Name`] } } });
        logAuditEvent({ action: 'DELETE', resourceType: 'BRAND', after: { removedFont: role } });
        return NextResponse.json({ success: true });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const assetType = formData.get("assetType") as string;

    if (!file || !assetType) {
      return NextResponse.json({ error: "File and assetType required" }, { status: 400 });
    }

    const isCustomFont = assetType === "customDisplayFont" || assetType === "customBodyFont";

    if (isCustomFont) {
      if (file.size > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Font file too large. Maximum 2MB." }, { status: 400 });
      }
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext !== "woff2") {
        return NextResponse.json({ error: "Only .woff2 font files are accepted" }, { status: 400 });
      }
    } else {
      if (!ALLOWED_TYPES[assetType]) {
        return NextResponse.json({ error: "Invalid asset type" }, { status: 400 });
      }
      if (!ALLOWED_TYPES[assetType].includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type for ${assetType}. Allowed: ${ALLOWED_TYPES[assetType].join(", ")}` }, { status: 400 });
      }
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
      }
    }

    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
      return NextResponse.json({ error: "R2 not configured" }, { status: 500 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const key = `brand/${assetType}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: isCustomFont ? "font/woff2" : file.type,
        Body: buffer,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const url = getPublicUrl(key);

    if (isCustomFont) {
      const fontName = formData.get("fontName") as string || file.name.replace(/\.woff2$/i, "");
      const urlKey = `brand_${assetType}Url`;
      const nameKey = `brand_${assetType}Name`;
      await prisma.siteSetting.upsert({
        where: { key: urlKey },
        update: { value: url as any, updatedAt: new Date() },
        create: { id: `setting_${urlKey}_${Date.now()}`, key: urlKey, value: url as any, updatedAt: new Date() },
      });
      await prisma.siteSetting.upsert({
        where: { key: nameKey },
        update: { value: fontName as any, updatedAt: new Date() },
        create: { id: `setting_${nameKey}_${Date.now()}`, key: nameKey, value: fontName as any, updatedAt: new Date() },
      });
      logAuditEvent({ action: 'UPLOAD', resourceType: 'BRAND', after: { assetType, fontName, url } });
      return NextResponse.json({ success: true, url, fontName });
    }

    const settingKey = `brand_${assetType}`;
    await prisma.siteSetting.upsert({
      where: { key: settingKey },
      update: { value: url as any, updatedAt: new Date() },
      create: { id: `setting_${settingKey}_${Date.now()}`, key: settingKey, value: url as any, updatedAt: new Date() },
    });

    logAuditEvent({ action: 'UPLOAD', resourceType: 'BRAND', after: { assetType, url } });

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Brand upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: BRAND_KEYS } },
      select: { key: true, value: true },
    });

    const map: Record<string, any> = {};
    for (const s of settings) map[s.key] = s.value;

    return NextResponse.json({
      success: true,
      brand: {
        logoLight: map.brand_logoLight || null,
        logoDark: map.brand_logoDark || null,
        favicon: map.brand_favicon || null,
        ogImage: map.brand_ogImage || null,
        brandColor: map.brandColor || "#FF3131",
        brandSecondary: map.brandSecondary || "#1B3A5C",
        brandTertiary: map.brandTertiary || "#F59E0B",
        darkDefault: map.darkDefault || false,
        displayFont: map.brand_displayFont || null,
        bodyFont: map.brand_bodyFont || null,
        customDisplayFontUrl: map.brand_customDisplayFontUrl || null,
        customBodyFontUrl: map.brand_customBodyFontUrl || null,
        customDisplayFontName: map.brand_customDisplayFontName || null,
        customBodyFontName: map.brand_customBodyFontName || null,
      },
    });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to load" }, { status: 500 });
  }
}
