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

    // Check if founder already exists
    const existingFounder = await prisma.founderUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingFounder) {
      return NextResponse.json(
        { error: 'Founder with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token
    const verifyToken = randomBytes(32).toString('hex');

    // Create founder user in FounderUser table
    const founder = await prisma.founderUser.create({
      data: {
        id: generateId(),
        email: email.toLowerCase(),
        passwordHash,
        name,
        status: 'PENDING_VERIFICATION', // Require email verification
        emailVerified: false,
        verifyToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
      },
    });

    // Send verification email
    try {
      const { sendVerificationEmail } = await import('@/lib/founder-email');
      await sendVerificationEmail(founder.email, founder.name, verifyToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the signup if email fails, user can resend later
    }

    return NextResponse.json({
      success: true,
      message: 'Founder account created successfully. Please check your email to verify your account.',
      emailVerified: false, // Email verification required
      user: {
        id: founder.id,
        email: founder.email,
        name: founder.name,
        status: founder.status,
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
