import crypto from 'crypto';

const OTP_SECRET = process.env.NEXTAUTH_SECRET || 'founder-team-otp-fallback';
const OTP_EXPIRY_MS = 10 * 60 * 1000;

export function generateOTP(): { code: string; token: string } {
  const code = crypto.randomInt(100000, 999999).toString();
  const payload = JSON.stringify({
    h: crypto.createHash('sha256').update(code).digest('hex'),
    e: Date.now() + OTP_EXPIRY_MS,
  });
  const sig = crypto.createHmac('sha256', OTP_SECRET).update(payload).digest('hex');
  const token = Buffer.from(JSON.stringify({ p: payload, s: sig })).toString('base64url');
  return { code, token };
}

export function verifyOTP(token: string, code: string): { valid: boolean; error?: string } {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());
    const expectedSig = crypto.createHmac('sha256', OTP_SECRET).update(decoded.p).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(decoded.s, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return { valid: false, error: 'Invalid verification token' };
    }
    const payload = JSON.parse(decoded.p);
    if (payload.e < Date.now()) {
      return { valid: false, error: 'Code expired — request a new one' };
    }
    const codeHash = crypto.createHash('sha256').update(code).digest('hex');
    if (!crypto.timingSafeEqual(Buffer.from(codeHash, 'hex'), Buffer.from(payload.h, 'hex'))) {
      return { valid: false, error: 'Incorrect code' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid verification token' };
  }
}
