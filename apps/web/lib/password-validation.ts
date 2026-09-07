const COMMON_PASSWORDS = new Set([
  'password', '12345678', '123456789', '1234567890', 'qwerty123',
  'password1', 'iloveyou', 'sunshine1', 'princess1', 'football1',
  'trustno1', 'letmein1', 'dragon12', 'master12', 'monkey12',
  'abc12345', 'mustang1', 'shadow12', 'michael1', 'jennifer',
  'baseball', 'passw0rd', 'starwars', 'whatever', 'computer1',
  'superman', 'welcome1', 'admin123', 'login123', 'hello123',
  'qwerty12', 'changeme', 'password123', 'admin1234', 'welcome123',
  'p@ssw0rd', 'p@ssword', 'iloveu123', '11111111', '00000000',
  'abcdefgh', 'abcd1234', 'test1234', 'pass1234', 'user1234',
]);

export interface PasswordStrength {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
}

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
  strength: PasswordStrength;
}

function computeStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password) && /[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 2) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 3) return { score, label: 'Good', color: '#3b82f6' };
  return { score, label: 'Strong', color: '#22c55e' };
}

export function validatePassword(
  password: string,
  context?: { name?: string | null; email?: string | null }
): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Must be at least 8 characters');
  if (password.length > 128) errors.push('Must be 128 characters or fewer');
  if (!/[A-Z]/.test(password)) errors.push('Include at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Include at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Include at least one number');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Include at least one special character (!@#$...)');

  const lower = password.toLowerCase();

  if (COMMON_PASSWORDS.has(lower)) {
    errors.push('This password is too common');
  }

  if (context) {
    if (context.name && context.name.length >= 3 && lower.includes(context.name.toLowerCase())) {
      errors.push('Password must not contain your name');
    }
    if (context.email) {
      const localPart = context.email.split('@')[0].toLowerCase();
      if (localPart.length >= 3 && lower.includes(localPart)) {
        errors.push('Password must not contain your email');
      }
      const domain = context.email.split('@')[1]?.split('.')[0]?.toLowerCase();
      if (domain && domain.length >= 3 && lower.includes(domain)) {
        errors.push('Password must not contain your email domain');
      }
    }
  }

  return { valid: errors.length === 0, errors, strength: computeStrength(password) };
}
