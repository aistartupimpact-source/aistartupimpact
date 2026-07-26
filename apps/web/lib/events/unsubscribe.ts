import { SignJWT, jwtVerify } from "jose";

/**
 * Unsubscribe token utilities.
 * Generates and verifies signed tokens for one-click unsubscribe links.
 * No login required — the signed JWT is proof of identity.
 */

const UNSUBSCRIBE_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret"
);

const TOKEN_EXPIRY = "30d"; // Tokens valid for 30 days

interface UnsubscribePayload {
  subscriberId: string;
  email: string;
}

/**
 * Generate a signed unsubscribe token for use in email links.
 * Format: /api/events/unsubscribe?token=<jwt>
 */
export async function generateUnsubscribeToken(
  subscriberId: string,
  email: string
): Promise<string> {
  const token = await new SignJWT({ subscriberId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(UNSUBSCRIBE_SECRET);

  return token;
}

/**
 * Verify an unsubscribe token from an email link.
 * Returns the subscriber info or null if invalid/expired.
 */
export async function verifyUnsubscribeToken(
  token: string
): Promise<UnsubscribePayload | null> {
  try {
    const { payload } = await jwtVerify(token, UNSUBSCRIBE_SECRET);
    const { subscriberId, email } = payload as unknown as UnsubscribePayload;

    if (!subscriberId || !email) {
      return null;
    }

    return { subscriberId, email };
  } catch {
    return null;
  }
}
