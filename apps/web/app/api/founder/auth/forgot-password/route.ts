import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aistartupimpact/database';
import { randomBytes } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.founderUser.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true, authProvider: true },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent.',
      });
    }

    // Don't allow password reset for Google OAuth users
    if (user.authProvider === 'google') {
      return NextResponse.json({
        success: true,
        message: 'If an account exists, a reset link has been sent.',
      });
    }

    // Generate reset token (expires in 1 hour)
    const resetToken = randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to user record
    await prisma.founderUser.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetExpiry,
        updatedAt: new Date(),
      },
    });

    // Send password reset email
    try {
      const { sendPasswordResetEmail } = await import('@/lib/founder-email');
      await sendPasswordResetEmail(user.email, user.name, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      // Don't expose email sending failures
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
