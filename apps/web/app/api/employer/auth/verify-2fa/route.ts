import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sql } from '@/lib/db';
import { setEmployerSession } from '@/lib/employer-auth';
import { verifyTOTPToken, decryptSecret, verifyBackupCode } from '@/lib/two-factor';

export const dynamic = 'force-dynamic';

const CHALLENGE_SECRET = new TextEncoder().encode(process.env.EMPLOYER_JWT_SECRET || process.env.USER_JWT_SECRET!);

export async function POST(request: NextRequest) {
  try {
    const { challengeToken, token, isBackupCode } = await request.json();

    if (!challengeToken || !token) {
      return NextResponse.json({ error: 'Challenge token and verification code are required' }, { status: 400 });
    }

    let userId: string;

    try {
      const { payload } = await jwtVerify(challengeToken, CHALLENGE_SECRET);
      if (payload.purpose !== '2fa-challenge') {
        return NextResponse.json({ error: 'Invalid challenge token' }, { status: 400 });
      }
      userId = payload.userId as string;
    } catch {
      return NextResponse.json({ error: 'Challenge expired. Please log in again.' }, { status: 401 });
    }

    const employers = await sql`
      SELECT id, "companyName", slug, email, plan, "twoFactorEnabled", "twoFactorSecret", "twoFactorBackupCodes"
      FROM "JobBoardEmployer"
      WHERE id = ${userId}
      LIMIT 1
    `;

    if (employers.length === 0 || !employers[0].twoFactorEnabled) {
      return NextResponse.json({ error: 'Invalid challenge' }, { status: 400 });
    }

    const employer = employers[0];
    let isValid = false;

    if (isBackupCode) {
      const codes = employer.twoFactorBackupCodes || [];
      if (codes.length === 0) {
        return NextResponse.json({ error: 'No backup codes available' }, { status: 400 });
      }
      const idx = await verifyBackupCode(token, codes);
      if (idx >= 0) {
        isValid = true;
        const updated = [...codes];
        updated.splice(idx, 1);
        await sql`UPDATE "JobBoardEmployer" SET "twoFactorBackupCodes" = ${updated} WHERE id = ${userId}`;
      }
    } else {
      if (!employer.twoFactorSecret) {
        return NextResponse.json({ error: '2FA secret not found' }, { status: 400 });
      }
      const secret = decryptSecret(employer.twoFactorSecret);
      isValid = verifyTOTPToken(token, secret);
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 401 });
    }

    await sql`UPDATE "JobBoardEmployer" SET "lastLoginAt" = NOW() WHERE id = ${userId}`;

    await setEmployerSession({
      id: employer.id,
      email: employer.email,
      companyName: employer.companyName,
      slug: employer.slug,
      plan: employer.plan,
    });

    return NextResponse.json({
      success: true,
      employer: { id: employer.id, companyName: employer.companyName, slug: employer.slug },
    });
  } catch (error) {
    console.error('Error verifying employer 2FA:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA code' }, { status: 500 });
  }
}
