import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

function generateId(): string {
  return randomBytes(16).toString('hex');
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const random = randomBytes(3).toString('hex');
  return `${base}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create founder user with FOUNDER role
    const user = await prisma.user.create({
      data: {
        id: generateId(),
        email: email.toLowerCase(),
        passwordHash,
        name,
        slug: generateSlug(name),
        role: 'FOUNDER', // Set role as FOUNDER
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Founder account created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        slug: user.slug,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Founder signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
