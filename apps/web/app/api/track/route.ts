import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

/**
 * POST /api/track
 * Track views and clicks for tools and startups
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityType, entityId, eventType, ownerId } = body;

    // Validate input
    if (!entityType || !entityId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['TOOL', 'STARTUP'].includes(entityType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid entity type' },
        { status: 400 }
      );
    }

    if (!['VIEW', 'CLICK'].includes(eventType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if analytics record exists for today
    const existing = await sql`
      SELECT id, views, clicks
      FROM "FounderAnalytics"
      WHERE "userId" = ${ownerId}
        AND "entityType" = ${entityType}
        AND "entityId" = ${entityId}
        AND date = ${today}
    `;

    if (existing.length > 0) {
      // Update existing record
      if (eventType === 'VIEW') {
        await sql`
          UPDATE "FounderAnalytics"
          SET views = views + 1, "updatedAt" = NOW()
          WHERE id = ${existing[0].id}
        `;
      } else {
        await sql`
          UPDATE "FounderAnalytics"
          SET clicks = clicks + 1, "updatedAt" = NOW()
          WHERE id = ${existing[0].id}
        `;
      }
    } else {
      // Create new record
      await sql`
        INSERT INTO "FounderAnalytics" (
          "userId", "entityType", "entityId", date,
          views, clicks, "directViews", "searchViews", "socialViews", "referralViews",
          "createdAt", "updatedAt"
        ) VALUES (
          ${ownerId}, ${entityType}, ${entityId}, ${today},
          ${eventType === 'VIEW' ? 1 : 0},
          ${eventType === 'CLICK' ? 1 : 0},
          0, 0, 0, 0,
          NOW(), NOW()
        )
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
