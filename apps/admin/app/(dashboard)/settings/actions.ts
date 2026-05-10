"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";

const ALLOWED = ["SUPER_ADMIN", "EDITOR_IN_CHIEF", "AD_MANAGER"];

export async function getSettingsAction() {
  const session: any = await getServerSession(authOptions);
  
  if (!session?.user || !ALLOWED.includes(session.user.role)) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    let settingsMap = {};
    try {
      const settings = await prisma.siteSetting.findMany({
        select: { key: true, value: true },
      });
      settingsMap = settings.reduce((acc: any, setting: any) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
    } catch {
      // Continue with defaults if DB fails
    }

    // Default values if not set
    const defaults = {
      siteTitle: 'AIStartupImpact',
      tagline: "India's AI Startup Ecosystem",
      contactEmail: 'hello@aistartupimpact.com',
      socialTwitter: 'https://twitter.com/aistartupimpact',
      socialLinkedin: 'https://linkedin.com/company/aistartupimpact',
      socialInstagram: 'https://instagram.com/aistartupimpact',
      socialFacebook: 'https://facebook.com/aistartupimpact',
      metaTitle: "AIStartupImpact — India's AI Startup Ecosystem",
      metaDescription: "Breaking news, founder stories, funding digests, and AI tool reviews from India's fastest-growing AI startup ecosystem.",
      ogImage: '',
      autoSitemap: true,
      brandColor: '#FF3131',
      darkDefault: false,
      notifArticle: true,
      notifPublish: true,
      notifSubscriber: true,
      notifPlacement: true,
      require2FA: false,
      sessionTimeout: 60,
    };

    return {
      success: true,
      data: { ...defaults, ...settingsMap },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function saveSettingsAction(settings: Record<string, any>) {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED.includes(session.user.role))
    return { success: false, error: "Unauthorized" };

  try {
    // Upsert each setting using Prisma ORM
    for (const [key, value] of Object.entries(settings)) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { 
          value: value as any,
          updatedAt: new Date(),
        },
        create: {
          id: `setting_${key}_${Date.now()}`,
          key,
          value: value as any,
          updatedAt: new Date(),
        },
      });
    }

    return { success: true };
  } catch (e: any) {
    console.error('Save settings error:', e);
    return { success: false, error: e.message };
  }
}

export async function getSystemStatsAction() {
  const session: any = await getServerSession(authOptions);
  if (!session?.user || !ALLOWED.includes(session.user.role))
    return { success: false, error: "Unauthorized" };

  try {
    const [
      articleCount,
      userCount,
      subscriberCount,
      campaignCount,
    ] = await Promise.all([
      prisma.article.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.newsletterSubscriber.count({ where: { isActive: true } }),
      prisma.adCampaign.count(),
    ]);

    return {
      success: true,
      data: {
        articles: articleCount,
        users: userCount,
        subscribers: subscriberCount,
        campaigns: campaignCount,
      },
    };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}