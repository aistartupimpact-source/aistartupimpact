import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/founder/auth/google/callback'
);

// Personal email domains to block
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
  'aol.com',
  'zoho.com',
  'yandex.com',
  'gmx.com',
  'rediffmail.com',
];

export function getGoogleAuthUrl(state?: string): string {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: state || '',
    prompt: 'consent',
  });
}

export async function verifyGoogleToken(code: string) {
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    return {
      googleId: payload.sub,
      email: payload.email!,
      name: payload.name!,
      avatar: payload.picture,
      emailVerified: payload.email_verified || false,
    };
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw new Error('Failed to verify Google token');
  }
}

export function isCompanyEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  
  return !PERSONAL_EMAIL_DOMAINS.includes(domain);
}

export function extractCompanyDomain(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain || PERSONAL_EMAIL_DOMAINS.includes(domain)) {
    return null;
  }
  return domain;
}

export function getCompanyNameFromDomain(domain: string): string {
  // Remove common TLDs and format as company name
  const name = domain
    .replace(/\.(com|in|io|ai|co|net|org)$/i, '')
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return name;
}
