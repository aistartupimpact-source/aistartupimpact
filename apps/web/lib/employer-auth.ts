import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@aistartupimpact/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.EMPLOYER_JWT_SECRET!
);

const COOKIE_NAME = 'employer_session';
const SESSION_EXPIRY_DAYS = 7;

export interface EmployerSession {
  id: string;
  email: string;
  companyName: string;
  slug: string;
  plan: string;
  onboardingCompleted: boolean;
}

/**
 * Create and set employer session cookie (JWT).
 */
export async function setEmployerSession(employer: {
  id: string;
  email: string;
  companyName: string;
  slug: string;
  plan: string;
  onboardingCompleted: boolean;
}): Promise<void> {
  const jwt = await new SignJWT({
    employerId: employer.id,
    email: employer.email,
    companyName: employer.companyName,
    slug: employer.slug,
    plan: employer.plan,
    onboardingCompleted: employer.onboardingCompleted,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_EXPIRY_DAYS}d`)
    .sign(JWT_SECRET);

  cookies().set(COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

/**
 * Get current employer session from cookie.
 * Returns null if not authenticated.
 */
export async function getEmployerSession(): Promise<EmployerSession | null> {
  try {
    const cookieStore = cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;

    const { payload } = await jwtVerify(cookie.value, JWT_SECRET);

    const employer = await prisma.jobBoardEmployer.findUnique({
      where: { id: payload.employerId as string },
      select: { isActive: true, deactivatedAt: true },
    });
    if (!employer || !employer.isActive || employer.deactivatedAt) return null;

    return {
      id: payload.employerId as string,
      email: payload.email as string,
      companyName: payload.companyName as string,
      slug: payload.slug as string,
      plan: payload.plan as string,
      onboardingCompleted: !!payload.onboardingCompleted,
    };
  } catch {
    return null;
  }
}

/**
 * Require employer authentication.
 * Throws redirect if not authenticated.
 */
export async function requireEmployerAuth(): Promise<EmployerSession> {
  const session = await getEmployerSession();
  if (!session) {
    throw new Error('EMPLOYER_AUTH_REQUIRED');
  }
  return session;
}

/**
 * Clear employer session cookie.
 */
export async function clearEmployerSession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}
