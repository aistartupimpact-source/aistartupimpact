import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { getFounderSession } from '@/lib/founder-auth';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  company: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  bio: z.string().max(1000).optional(),
  avatar: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getFounderSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = updateProfileSchema.parse(body);

    // Update profile with raw SQL
    await sql`
      UPDATE "FounderUser"
      SET 
        name = ${validated.name},
        company = ${validated.company || null},
        role = ${validated.role || null},
        phone = ${validated.phone || null},
        bio = ${validated.bio || null},
        avatar = ${validated.avatar || null},
        linkedin = ${validated.linkedin || null},
        twitter = ${validated.twitter || null},
        website = ${validated.website || null},
        "updatedAt" = NOW()
      WHERE id = ${session.userId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Profile update error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 }
    );
  }
}
