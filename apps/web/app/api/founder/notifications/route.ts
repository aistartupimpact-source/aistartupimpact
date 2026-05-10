import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireFounderAuth } from '@/lib/founder-auth';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/founder/notifications
 * Get all notifications for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    // Get query params
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build query
    let query;
    if (unreadOnly) {
      query = sql`
        SELECT id, type, title, message, link, read, "createdAt"
        FROM "FounderNotification"
        WHERE "userId" = ${session.userId} AND read = false
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT id, type, title, message, link, read, "createdAt"
        FROM "FounderNotification"
        WHERE "userId" = ${session.userId}
        ORDER BY "createdAt" DESC
        LIMIT ${limit}
      `;
    }

    const notifications = await query;

    // Get unread count
    const unreadCount = await sql`
      SELECT COUNT(*) as count
      FROM "FounderNotification"
      WHERE "userId" = ${session.userId} AND read = false
    `;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount: parseInt(unreadCount[0].count),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/founder/notifications
 * Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireFounderAuth();
    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      // Mark all as read
      await sql`
        UPDATE "FounderNotification"
        SET read = true
        WHERE "userId" = ${session.userId} AND read = false
      `;

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else if (notificationId) {
      // Mark single notification as read
      await sql`
        UPDATE "FounderNotification"
        SET read = true
        WHERE id = ${notificationId} AND "userId" = ${session.userId}
      `;

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing notificationId or markAllRead' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/founder/notifications
 * Delete notification(s)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireFounderAuth();
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll) {
      // Delete all read notifications
      await sql`
        DELETE FROM "FounderNotification"
        WHERE "userId" = ${session.userId} AND read = true
      `;

      return NextResponse.json({
        success: true,
        message: 'All read notifications deleted',
      });
    } else if (notificationId) {
      // Delete single notification
      await sql`
        DELETE FROM "FounderNotification"
        WHERE id = ${notificationId} AND "userId" = ${session.userId}
      `;

      return NextResponse.json({
        success: true,
        message: 'Notification deleted',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Missing id or deleteAll parameter' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error deleting notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete notifications' },
      { status: 500 }
    );
  }
}
