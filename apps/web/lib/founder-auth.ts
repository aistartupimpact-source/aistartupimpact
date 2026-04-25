import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { prisma } from '@aistartupimpact/database';

const JWT_SECRET = new TextEncoder().encode(
  process.env.FOUNDER_JWT_SECRET || 'founder-secret-change-in-production'
);

export interface FounderSession {
  userId: string;
  email: string;
  name: string;
}

// Create JWT token
export async function createFounderToken(userId: string, email: string, name: string) {
  const token = await new SignJWT({ userId, email, name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return token;
}

// Verify JWT token
export async function verifyFounderToken(token: string): Promise<FounderSession | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as unknown as FounderSession;
  } catch (error) {
    return null;
  }
}

// Get current founder session
export async function getFounderSession(): Promise<FounderSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('founder-token')?.value;
  
  if (!token) return null;
  
  return await verifyFounderToken(token);
}

// Set founder session cookie
export async function setFounderSession(userId: string, email: string, name: string) {
  const token = await createFounderToken(userId, email, name);
  const cookieStore = cookies();
  
  cookieStore.set('founder-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

// Clear founder session
export async function clearFounderSession() {
  const cookieStore = cookies();
  cookieStore.delete('founder-token');
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Require founder authentication (use in server actions)
export async function requireFounderAuth(): Promise<FounderSession> {
  const session = await getFounderSession();
  
  if (!session) {
    throw new Error('Unauthorized - Please login');
  }
  
  return session;
}

// Generate verification token
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
