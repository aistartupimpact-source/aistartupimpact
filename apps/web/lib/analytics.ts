import { headers } from 'next/headers';
import { prisma } from '@aistartupimpact/database';
import crypto from 'crypto';

// Parse user agent to detect device type
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'TABLET';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'MOBILE';
  }
  return 'DESKTOP';
}

// Parse user agent to detect browser
function getBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('edg/')) return 'Edge';
  if (ua.includes('chrome/')) return 'Chrome';
  if (ua.includes('safari/') && !ua.includes('chrome')) return 'Safari';
  if (ua.includes('firefox/')) return 'Firefox';
  if (ua.includes('opera/') || ua.includes('opr/')) return 'Opera';
  return 'Other';
}

// Parse user agent to detect OS
function getOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('win')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Other';
}

// Determine traffic source from referrer
function getTrafficSource(referrer: string | null): string {
  if (!referrer) return 'DIRECT';
  
  const ref = referrer.toLowerCase();
  
  // Search engines
  if (ref.includes('google.') || ref.includes('bing.') || ref.includes('yahoo.') || 
      ref.includes('duckduckgo.') || ref.includes('baidu.')) {
    return 'SEARCH';
  }
  
  // Social media
  if (ref.includes('facebook.') || ref.includes('twitter.') || ref.includes('x.com') ||
      ref.includes('linkedin.') || ref.includes('instagram.') || ref.includes('reddit.') ||
      ref.includes('youtube.') || ref.includes('tiktok.')) {
    return 'SOCIAL';
  }
  
  // Email
  if (ref.includes('mail.') || ref.includes('email.') || ref.includes('newsletter')) {
    return 'EMAIL';
  }
  
  return 'REFERRAL';
}

// Create a hash for privacy
function createHash(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').substring(0, 16);
}

// Track page view
export async function trackPageView(pathname: string) {
  try {
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const referrer = headersList.get('referer') || headersList.get('referrer') || null;
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 
               headersList.get('x-real-ip') || 
               'unknown';
    
    // Create session hash (IP + User Agent)
    const sessionHash = createHash(`${ip}-${userAgent}`);
    const ipHash = createHash(ip);
    
    const device = getDeviceType(userAgent);
    const browser = getBrowser(userAgent);
    const os = getOS(userAgent);
    const source = getTrafficSource(referrer);
    
    // Check if this is a bounce (only one page view in session in last 30 minutes)
    const recentViews = await prisma.pageView.count({
      where: {
        sessionHash,
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
        },
      },
    });
    
    const bounced = recentViews === 0; // First page in session
    
    // Create page view record
    await prisma.pageView.create({
      data: {
        pathname,
        referrer,
        source,
        device,
        browser,
        os,
        sessionHash,
        ipHash,
        userAgent,
        bounced,
      },
    });
    
    // Update previous page views in this session to mark as not bounced
    if (recentViews > 0) {
      await prisma.pageView.updateMany({
        where: {
          sessionHash,
          createdAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000),
          },
        },
        data: {
          bounced: false,
        },
      });
    }
  } catch (error) {
    // Silently fail - don't break the page if analytics fails
    console.error('Analytics tracking error:', error);
  }
}

// Track article view (increment viewCount)
export async function trackArticleView(articleId: string) {
  try {
    await prisma.article.update({
      where: { id: articleId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error('Article view tracking error:', error);
  }
}
