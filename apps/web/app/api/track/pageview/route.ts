import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics';
import { apiRateLimit, getClientIdentifier, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * POST /api/track/pageview
 * Track page views for analytics
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit pageview tracking
    if (apiRateLimit) {
      const identifier = getClientIdentifier(request);
      const { success } = await checkRateLimit(apiRateLimit, identifier);
      if (!success) {
        return NextResponse.json({ success: false }, { status: 429 });
      }
    }

    const body = await request.json();
    const { pathname } = body;

    if (!pathname) {
      return NextResponse.json(
        { success: false, error: 'Missing pathname' },
        { status: 400 }
      );
    }

    // Track the page view - pass the request object for headers
    await trackPageView(pathname, request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking page view:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track page view' },
      { status: 500 }
    );
  }
}
