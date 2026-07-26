import crypto from "crypto";

/**
 * Generates a short, URL-safe, scannable QR token.
 * 16 characters of base62 — compact enough for readable QR codes
 * while having negligible collision risk at typical event scale.
 *
 * Collision probability: ~1 in 47 trillion at 16 chars base62.
 */
const BASE62_CHARS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function generateQrToken(length: number = 16): string {
  const bytes = crypto.randomBytes(length);
  let token = "";
  for (let i = 0; i < length; i++) {
    token += BASE62_CHARS[bytes[i]! % 62];
  }
  return token;
}
