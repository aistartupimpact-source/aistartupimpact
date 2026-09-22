import { NextResponse } from "next/server";
import { prisma } from "@udyaibase/database";

export const dynamic = "force-dynamic";
export const revalidate = 300;

const BRAND_KEYS = [
  "brand_logoLight", "brand_logoDark", "brand_favicon", "brand_ogImage",
  "brandColor", "brandSecondary", "brandTertiary", "darkDefault",
  "brand_displayFont", "brand_bodyFont",
  "brand_customDisplayFontUrl", "brand_customBodyFontUrl",
  "brand_customDisplayFontName", "brand_customBodyFontName",
];

export async function GET() {
  try {
    const placeholders = BRAND_KEYS.map((_, i) => `$${i + 1}`).join(', ');
    const settings = await prisma.$queryRawUnsafe<Array<{ key: string; value: string }>>(
      `SELECT key, value::text FROM "SiteSetting" WHERE key IN (${placeholders})`,
      ...BRAND_KEYS
    );

    const map: Record<string, any> = {};
    for (const s of settings) {
      try { map[s.key] = JSON.parse(s.value); } catch { map[s.key] = s.value; }
    }

    return NextResponse.json({
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
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch {
    return NextResponse.json({
      brandColor: "#FF3131", brandSecondary: "#1B3A5C", brandTertiary: "#F59E0B",
      darkDefault: false,
      logoLight: null, logoDark: null, favicon: null, ogImage: null,
      displayFont: null, bodyFont: null,
      customDisplayFontUrl: null, customBodyFontUrl: null,
      customDisplayFontName: null, customBodyFontName: null,
    });
  }
}
