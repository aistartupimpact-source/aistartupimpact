import { SignJWT } from 'jose';

const TEST_SECRETS = {
  USER_JWT_SECRET: 'test-user-jwt-secret-for-testing',
  FOUNDER_JWT_SECRET: 'test-founder-jwt-secret-for-testing',
  EMPLOYER_JWT_SECRET: 'test-employer-jwt-secret-for-testing',
  NEXTAUTH_SECRET: 'test-nextauth-secret-for-testing',
};

function encodeSecret(key: keyof typeof TEST_SECRETS) {
  return new TextEncoder().encode(TEST_SECRETS[key]);
}

export function getTestSecrets() {
  return { ...TEST_SECRETS };
}

export function stubAuthEnv() {
  process.env.USER_JWT_SECRET = TEST_SECRETS.USER_JWT_SECRET;
  process.env.FOUNDER_JWT_SECRET = TEST_SECRETS.FOUNDER_JWT_SECRET;
  process.env.EMPLOYER_JWT_SECRET = TEST_SECRETS.EMPLOYER_JWT_SECRET;
  process.env.NEXTAUTH_SECRET = TEST_SECRETS.NEXTAUTH_SECRET;
}

export async function createUserToken(overrides: Record<string, any> = {}) {
  const payload = {
    userId: 'user-001',
    email: 'user@example.com',
    sessionId: 'session-001',
    ...overrides,
  };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(encodeSecret('USER_JWT_SECRET'));
}

export async function createFounderToken(overrides: Record<string, any> = {}) {
  const payload = {
    userId: 'founder-001',
    email: 'founder@example.com',
    name: 'Test Founder',
    onboardingCompleted: true,
    ...overrides,
  };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(encodeSecret('FOUNDER_JWT_SECRET'));
}

export async function createEmployerToken(overrides: Record<string, any> = {}) {
  const payload = {
    employerId: 'employer-001',
    email: 'employer@example.com',
    companyName: 'Test Corp',
    slug: 'test-corp',
    plan: 'FREE',
    onboardingCompleted: true,
    ...overrides,
  };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(encodeSecret('EMPLOYER_JWT_SECRET'));
}

export async function createOrganizerToken(overrides: Record<string, any> = {}) {
  const payload = {
    sessionToken: 'org-session-token-001',
    ...overrides,
  };
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(encodeSecret('NEXTAUTH_SECRET'));
}

export async function createExpiredToken(type: 'user' | 'founder' | 'employer' | 'organizer') {
  const secrets: Record<string, keyof typeof TEST_SECRETS> = {
    user: 'USER_JWT_SECRET',
    founder: 'FOUNDER_JWT_SECRET',
    employer: 'EMPLOYER_JWT_SECRET',
    organizer: 'NEXTAUTH_SECRET',
  };
  const payloads: Record<string, Record<string, any>> = {
    user: { userId: 'user-expired', email: 'expired@example.com' },
    founder: { userId: 'founder-expired', email: 'expired@example.com', name: 'Expired', onboardingCompleted: true },
    employer: { employerId: 'emp-expired', email: 'expired@example.com', companyName: 'Expired Corp', slug: 'expired', plan: 'FREE', onboardingCompleted: true },
    organizer: { sessionToken: 'expired-session-token' },
  };
  const iat = Math.floor(Date.now() / 1000) - 7200;
  const exp = Math.floor(Date.now() / 1000) - 3600;
  return new SignJWT({ ...payloads[type], iat, exp })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(encodeSecret(secrets[type]));
}

export function createInvalidToken() {
  return 'eyJhbGciOiJIUzI1NiJ9.eyJ0ZXN0IjoidHJ1ZSJ9.invalid-signature-data';
}

export async function createWrongSecretToken() {
  const wrongSecret = new TextEncoder().encode('completely-wrong-secret-key');
  return new SignJWT({ userId: 'hacker', email: 'hacker@evil.com' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(wrongSecret);
}
