import { prisma } from "@aistartupimpact/database";
import { cache } from "react";

export interface BrandConfig {
  logoLight: string | null;
  logoDark: string | null;
  favicon: string | null;
  ogImage: string | null;
  brandColor: string;
  brandSecondary: string;
  brandTertiary: string;
  darkDefault: boolean;
  displayFont: string | null;
  bodyFont: string | null;
  customDisplayFontUrl: string | null;
  customBodyFontUrl: string | null;
  customDisplayFontName: string | null;
  customBodyFontName: string | null;
}

const BRAND_KEYS = [
  "brand_logoLight", "brand_logoDark", "brand_favicon", "brand_ogImage",
  "brandColor", "brandSecondary", "brandTertiary", "darkDefault",
  "brand_displayFont", "brand_bodyFont",
  "brand_customDisplayFontUrl", "brand_customBodyFontUrl",
  "brand_customDisplayFontName", "brand_customBodyFontName",
];

export const getBrandConfig = cache(async (): Promise<BrandConfig> => {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: BRAND_KEYS } },
      select: { key: true, value: true },
    });

    const map: Record<string, any> = {};
    for (const s of settings) map[s.key] = s.value;

    return {
      logoLight: map.brand_logoLight || null,
      logoDark: map.brand_logoDark || null,
      favicon: map.brand_favicon || null,
      ogImage: map.brand_ogImage || null,
      brandColor: (map.brandColor as string) || "#FF3131",
      brandSecondary: (map.brandSecondary as string) || "#1B3A5C",
      brandTertiary: (map.brandTertiary as string) || "#F59E0B",
      darkDefault: map.darkDefault === true,
      displayFont: (map.brand_displayFont as string) || null,
      bodyFont: (map.brand_bodyFont as string) || null,
      customDisplayFontUrl: (map.brand_customDisplayFontUrl as string) || null,
      customBodyFontUrl: (map.brand_customBodyFontUrl as string) || null,
      customDisplayFontName: (map.brand_customDisplayFontName as string) || null,
      customBodyFontName: (map.brand_customBodyFontName as string) || null,
    };
  } catch {
    return {
      logoLight: null, logoDark: null, favicon: null, ogImage: null,
      brandColor: "#FF3131", brandSecondary: "#1B3A5C", brandTertiary: "#F59E0B",
      darkDefault: false,
      displayFont: null, bodyFont: null,
      customDisplayFontUrl: null, customBodyFontUrl: null,
      customDisplayFontName: null, customBodyFontName: null,
    };
  }
});
