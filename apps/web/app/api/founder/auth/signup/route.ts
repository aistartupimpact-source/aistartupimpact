import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hashPassword, generateToken } from '@/lib/founder-auth';
import { sendVerificationEmail } from '@/lib/founder-email';
import { isCompanyEmail, extractCompanyDomain, getCompanyNameFromDomain } from '@/lib/google-oauth';
import { z } from 'zod';

const sql = neon(process.env.DATABASE_URL!);

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  company: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validated = signupSchema.parse(body);
    
    // Validate company email
    if (!isCompanyEmail(validated.email)) {
      return NextResponse.json(
        { error: 'Please use your company email address. Personal emails (Gmail, Yahoo, etc.) are not allowed.' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existing = await sql`
      SELECT id FROM "FounderUser" WHERE email = ${validated.email.toLowerCase()} LIMIT 1
    `;
    
    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Extract company domain
    const companyDomain = extractCompanyDomain(validated.email);
    const suggestedCompany = companyDomain ? getCompanyNameFromDomain(companyDomain) : null;
    
    // Hash password
    const passwordHash = await hashPassword(validated.password);
    
    // Generate verification token
    const verifyToken = generateToken();
    
    // Create user with raw SQL
    const result = await sql`
      INSERT INTO "FounderUser" (
        id, email, name, "passwordHash", company, "companyDomain",
        "authProvider", "emailVerified", "verifyToken", status,
        "onboardingCompleted", "onboardingStep",
        "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        ${validated.email.toLowerCase()},
        ${validated.name},
        ${passwordHash},
        ${validated.company || suggestedCompany},
        ${companyDomain},
        'email',
        false,
        ${verifyToken},
        'PENDING_VERIFICATION',
        false,
        0,
        NOW(),
        NOW()
      )
      RETURNING id, email, name
    `;
    
    const user = result[0];
    
    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name, verifyToken);
      console.log('✅ Verification email sent successfully to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError);
      console.error('Email error details:', JSON.stringify(emailError, null, 2));
      
      // In development, auto-verify the email
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 Development mode: Auto-verifying email...');
        await sql`
          UPDATE "FounderUser"
          SET "emailVerified" = true, status = 'ACTIVE', "updatedAt" = NOW()
          WHERE id = ${user.id}
        `;
        console.log('✅ Email auto-verified in development mode');
      }
    }
    
    // Check if email was auto-verified in development
    const finalUser = await sql`
      SELECT "emailVerified" FROM "FounderUser" WHERE id = ${user.id} LIMIT 1
    `;
    
    const message = finalUser[0].emailVerified 
      ? 'Account created and verified! You can now login.'
      : 'Account created! Please check your email to verify.';
    
    return NextResponse.json({
      success: true,
      message,
      autoVerified: finalUser[0].emailVerified
    });
    
  } catch (error: any) {
    console.error('Signup error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
