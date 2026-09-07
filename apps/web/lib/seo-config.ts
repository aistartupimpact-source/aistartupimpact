import { prisma } from "@aistartupimpact/database";
import { cache } from "react";

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  canonicalDomain: string;
  twitterHandle: string;
  gaId: string;
  gscVerification: string;
  noindex: boolean;
  autoSitemap: boolean;
  contactEmail: string;
  socialTwitter: string;
  socialLinkedin: string;
  socialInstagram: string;
  socialFacebook: string;
  socialYoutube: string;
}

const SEO_KEYS = [
  "metaTitle", "metaDescription", "canonicalDomain",
  "seo_twitterHandle", "seo_gaId", "seo_gscVerification", "seo_noindex",
  "autoSitemap", "contactEmail",
  "socialTwitter", "socialLinkedin", "socialInstagram", "socialFacebook", "socialYoutube",
];

const DEFAULTS: SeoConfig = {
  metaTitle: "AI Startup Impact – AI Startup India News & Funding",
  metaDescription: "AI Startup Impact is the premier platform for Indian AI news. Discover top artificial intelligence startups, funding, tools, and founder stories.",
  canonicalDomain: "https://aistartupimpact.com",
  twitterHandle: "@aikitstartup",
  gaId: "",
  gscVerification: "",
  noindex: false,
  autoSitemap: true,
  contactEmail: "hello@aistartupimpact.com",
  socialTwitter: "https://x.com/aistartupimpact",
  socialLinkedin: "https://www.linkedin.com/company/ai-startup-impact/",
  socialInstagram: "https://www.instagram.com/aistartupimpact/",
  socialFacebook: "https://facebook.com/aistartupimpact",
  socialYoutube: "https://www.youtube.com/@aistartupimpact",
};

export const getSeoConfig = cache(async (): Promise<SeoConfig> => {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: SEO_KEYS } },
      select: { key: true, value: true },
    });

    const map: Record<string, any> = {};
    for (const s of settings) map[s.key] = s.value;

    return {
      metaTitle: (map.metaTitle as string) || DEFAULTS.metaTitle,
      metaDescription: (map.metaDescription as string) || DEFAULTS.metaDescription,
      canonicalDomain: (map.canonicalDomain as string) || DEFAULTS.canonicalDomain,
      twitterHandle: (map.seo_twitterHandle as string) || DEFAULTS.twitterHandle,
      gaId: (map.seo_gaId as string) || DEFAULTS.gaId,
      gscVerification: (map.seo_gscVerification as string) || DEFAULTS.gscVerification,
      noindex: map.seo_noindex === true,
      autoSitemap: map.autoSitemap !== false,
      contactEmail: (map.contactEmail as string) || DEFAULTS.contactEmail,
      socialTwitter: (map.socialTwitter as string) || DEFAULTS.socialTwitter,
      socialLinkedin: (map.socialLinkedin as string) || DEFAULTS.socialLinkedin,
      socialInstagram: (map.socialInstagram as string) || DEFAULTS.socialInstagram,
      socialFacebook: (map.socialFacebook as string) || DEFAULTS.socialFacebook,
      socialYoutube: (map.socialYoutube as string) || DEFAULTS.socialYoutube,
    };
  } catch {
    return { ...DEFAULTS };
  }
});
