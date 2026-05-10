import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

const JWT_SECRET = new TextEncoder().encode(
  process.env.USER_JWT_SECRET || 'user-secret-change-in-production'
);

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('user-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const verified = await jwtVerify(token, JWT_SECRET);
    const userId = (verified.payload as any).userId;

    // Get update data
    const { name, bio, twitter, linkedin } = await request.json();

    // Validate data
    if (name && name.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (bio && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be less than 500 characters' },
        { status: 400 }
      );
    }

    // Update user
    await sql`
      UPDATE "WebUser"
      SET 
        name = COALESCE(${name || null}, name),
        bio = ${bio || null},
        twitter = ${twitter || null},
        linkedin = ${linkedin || null}
      WHERE id = ${userId}
    `;

    // Fetch updated user
    const users = await sql`
      SELECT id, email, name, bio, twitter, linkedin, avatar, slug
      FROM "WebUser"
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
