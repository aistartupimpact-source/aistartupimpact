import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics';

/**
 * POST /api/track/pageview
 * Track page views for analytics
 */
export async function POST(request: NextRequest) {
  try {
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
