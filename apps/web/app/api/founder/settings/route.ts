import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { requireFounderAuth } from '@/lib/founder-auth';

const sql = neon(process.env.DATABASE_URL!);

/**
 * GET /api/founder/settings
 * Get user settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await requireFounderAuth();

    // Get settings
    const settings = await sql`
      SELECT 
        email_notifications,
        submission_updates,
        analytics_reports,
        public_profile,
        show_email
      FROM founder_settings
      WHERE user_id = ${session.userId}
    `;

    // If no settings exist, create default settings
    if (settings.length === 0) {
      await sql`
        INSERT INTO founder_settings (user_id)
        VALUES (${session.userId})
      `;

      return NextResponse.json({
        success: true,
        settings: {
          emailNotifications: true,
          submissionUpdates: true,
          analyticsReports: false,
          publicProfile: true,
          showEmail: false,
        },
      });
    }

    // Return settings (convert snake_case to camelCase)
    return NextResponse.json({
      success: true,
      settings: {
        emailNotifications: settings[0].email_notifications,
        submissionUpdates: settings[0].submission_updates,
        analyticsReports: settings[0].analytics_reports,
        publicProfile: settings[0].public_profile,
        showEmail: settings[0].show_email,
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/founder/settings
 * Update user settings
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireFounderAuth();
    const body = await request.json();

    // Convert camelCase to snake_case
    const updates: any = {};
    if ('emailNotifications' in body) updates.email_notifications = body.emailNotifications;
    if ('submissionUpdates' in body) updates.submission_updates = body.submissionUpdates;
    if ('analyticsReports' in body) updates.analytics_reports = body.analyticsReports;
    if ('publicProfile' in body) updates.public_profile = body.publicProfile;
    if ('showEmail' in body) updates.show_email = body.showEmail;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No settings to update' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existing = await sql`
      SELECT id FROM founder_settings WHERE user_id = ${session.userId}
    `;

    if (existing.length === 0) {
      // Create settings with updates
      await sql`
        INSERT INTO founder_settings (
          user_id,
          email_notifications,
          submission_updates,
          analytics_reports,
          public_profile,
          show_email
        ) VALUES (
          ${session.userId},
          ${updates.email_notifications ?? true},
          ${updates.submission_updates ?? true},
          ${updates.analytics_reports ?? false},
          ${updates.public_profile ?? true},
          ${updates.show_email ?? false}
        )
      `;
    } else {
      // Build dynamic update query
      const setClauses = Object.keys(updates).map(key => `${key} = $${key}`).join(', ');
      const values = { ...updates, userId: session.userId };
      
      // Update settings
      await sql`
        UPDATE founder_settings
        SET 
          email_notifications = ${updates.email_notifications ?? sql`email_notifications`},
          submission_updates = ${updates.submission_updates ?? sql`submission_updates`},
          analytics_reports = ${updates.analytics_reports ?? sql`analytics_reports`},
          public_profile = ${updates.public_profile ?? sql`public_profile`},
          show_email = ${updates.show_email ?? sql`show_email`},
          updated_at = NOW()
        WHERE user_id = ${session.userId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
