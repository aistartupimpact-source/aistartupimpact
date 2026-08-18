import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const APP_NAME = 'ASI Admin';

export function generateTOTPSecret(email: string) {
  const secret = speakeasy.generateSecret({
    name: `${APP_NAME} (${email})`,
    issuer: APP_NAME,
    length: 32,
  });
  return { secret: secret.base32, otpauthUrl: secret.otpauth_url! };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
  return QRCode.toDataURL(otpauthUrl);
}

export function verifyTOTPToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  });
}

export function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
}

export async function hashBackupCodes(codes: string[]): Promise<string[]> {
  return Promise.all(codes.map(code => bcrypt.hash(code, 10)));
}

export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(code, hashedCodes[i])) return i;
  }
  return -1;
}

export function encryptSecret(secret: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', crypto.createHash('sha256').update(key).digest(), iv);
  let encrypted = cipher.update(secret, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decryptSecret(encryptedSecret: string): string {
  const key = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  const [ivHex, encrypted] = encryptedSecret.split(':');
  if (!ivHex || !encrypted) throw new Error('Invalid encrypted secret format');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', crypto.createHash('sha256').update(key).digest(), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
