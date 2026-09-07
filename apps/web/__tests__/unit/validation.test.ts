import { describe, it, expect } from 'vitest';
import {
  signupSchema,
  loginSchema,
  emailSchema,
  reviewSchema,
  profileUpdateSchema,
  newsletterSchema,
  commentSchema,
  startupSubmissionSchema,
  toolSubmissionSchema,
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
  supportTicketSchema,
  supportMessageSchema,
  sanitizeText,
  validateInput,
} from '@/lib/validation';

describe('validation schemas', () => {
  describe('signupSchema', () => {
    it('accepts valid signup', () => {
      expect(() => signupSchema.parse({ email: 'test@example.com', password: 'Abc12345', name: 'John' })).not.toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => signupSchema.parse({ email: 'not-email', password: 'Abc12345', name: 'John' })).toThrow();
    });

    it('rejects short password', () => {
      expect(() => signupSchema.parse({ email: 'test@example.com', password: 'Ab1', name: 'John' })).toThrow();
    });

    it('rejects password without uppercase', () => {
      expect(() => signupSchema.parse({ email: 'test@example.com', password: 'abc12345', name: 'John' })).toThrow();
    });

    it('rejects password without lowercase', () => {
      expect(() => signupSchema.parse({ email: 'test@example.com', password: 'ABC12345', name: 'John' })).toThrow();
    });

    it('rejects password without number', () => {
      expect(() => signupSchema.parse({ email: 'test@example.com', password: 'Abcdefgh', name: 'John' })).toThrow();
    });

    it('rejects short name', () => {
      expect(() => signupSchema.parse({ email: 'test@example.com', password: 'Abc12345', name: 'J' })).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com', password: 'any' })).not.toThrow();
    });

    it('rejects empty password', () => {
      expect(() => loginSchema.parse({ email: 'test@example.com', password: '' })).toThrow();
    });
  });

  describe('emailSchema', () => {
    it('accepts valid email', () => {
      expect(() => emailSchema.parse({ email: 'test@example.com' })).not.toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => emailSchema.parse({ email: 'invalid' })).toThrow();
    });
  });

  describe('reviewSchema', () => {
    it('accepts valid review', () => {
      expect(() => reviewSchema.parse({ rating: 5, title: 'Great tool here', body: 'Works well' })).not.toThrow();
    });

    it('rejects rating > 5', () => {
      expect(() => reviewSchema.parse({ rating: 6, title: 'Great tool', body: 'OK' })).toThrow();
    });

    it('rejects rating < 1', () => {
      expect(() => reviewSchema.parse({ rating: 0, title: 'Great tool', body: 'OK' })).toThrow();
    });

    it('rejects short title', () => {
      expect(() => reviewSchema.parse({ rating: 5, title: 'Hi', body: 'OK' })).toThrow();
    });
  });

  describe('profileUpdateSchema', () => {
    it('accepts partial update', () => {
      expect(() => profileUpdateSchema.parse({ name: 'John' })).not.toThrow();
    });

    it('accepts empty object', () => {
      expect(() => profileUpdateSchema.parse({})).not.toThrow();
    });

    it('rejects long bio', () => {
      expect(() => profileUpdateSchema.parse({ bio: 'x'.repeat(501) })).toThrow();
    });
  });

  describe('newsletterSchema', () => {
    it('accepts valid subscription', () => {
      expect(() => newsletterSchema.parse({ email: 'test@example.com' })).not.toThrow();
    });

    it('accepts with optional name', () => {
      expect(() => newsletterSchema.parse({ email: 'test@example.com', name: 'John' })).not.toThrow();
    });
  });

  describe('commentSchema', () => {
    it('accepts valid comment', () => {
      expect(() => commentSchema.parse({ name: 'John', body: 'Great article here' })).not.toThrow();
    });

    it('rejects short body', () => {
      expect(() => commentSchema.parse({ name: 'John', body: 'Hi' })).toThrow();
    });

    it('rejects long body', () => {
      expect(() => commentSchema.parse({ name: 'John', body: 'x'.repeat(1001) })).toThrow();
    });
  });

  describe('startupSubmissionSchema', () => {
    const valid = {
      name: 'My Startup',
      tagline: 'A great startup platform',
      description: 'x'.repeat(50),
      websiteUrl: 'https://example.com',
      category: 'AI',
      stage: 'IDEA' as const,
      founderEmail: 'founder@example.com',
    };

    it('accepts valid submission', () => {
      expect(() => startupSubmissionSchema.parse(valid)).not.toThrow();
    });

    it('rejects short description', () => {
      expect(() => startupSubmissionSchema.parse({ ...valid, description: 'too short' })).toThrow();
    });

    it('rejects invalid stage', () => {
      expect(() => startupSubmissionSchema.parse({ ...valid, stage: 'INVALID' })).toThrow();
    });

    it('rejects invalid URL', () => {
      expect(() => startupSubmissionSchema.parse({ ...valid, websiteUrl: 'not-a-url' })).toThrow();
    });
  });

  describe('toolSubmissionSchema', () => {
    const valid = {
      name: 'My Tool',
      tagline: 'A great AI tool for you',
      description: 'x'.repeat(50),
      websiteUrl: 'https://example.com',
      pricingModel: 'FREE' as const,
    };

    it('accepts valid submission', () => {
      expect(() => toolSubmissionSchema.parse(valid)).not.toThrow();
    });

    it('rejects invalid pricing model', () => {
      expect(() => toolSubmissionSchema.parse({ ...valid, pricingModel: 'INVALID' })).toThrow();
    });
  });

  describe('changePasswordSchema', () => {
    it('accepts valid change', () => {
      expect(() => changePasswordSchema.parse({ currentPassword: 'old', newPassword: 'Abc12345' })).not.toThrow();
    });

    it('rejects empty current password', () => {
      expect(() => changePasswordSchema.parse({ currentPassword: '', newPassword: 'Abc12345' })).toThrow();
    });
  });

  describe('changeEmailSchema', () => {
    it('accepts valid change', () => {
      expect(() => changeEmailSchema.parse({ newEmail: 'new@example.com', password: 'pass' })).not.toThrow();
    });

    it('rejects invalid email', () => {
      expect(() => changeEmailSchema.parse({ newEmail: 'invalid', password: 'pass' })).toThrow();
    });
  });

  describe('deleteAccountSchema', () => {
    it('accepts valid deletion', () => {
      expect(() => deleteAccountSchema.parse({ password: 'mypass' })).not.toThrow();
    });

    it('rejects empty password', () => {
      expect(() => deleteAccountSchema.parse({ password: '' })).toThrow();
    });
  });

  describe('supportTicketSchema', () => {
    it('accepts valid ticket', () => {
      expect(() => supportTicketSchema.parse({ subject: 'Help me', description: 'I need help with something' })).not.toThrow();
    });

    it('rejects short subject', () => {
      expect(() => supportTicketSchema.parse({ subject: 'Hi', description: 'I need help with something' })).toThrow();
    });

    it('rejects long description', () => {
      expect(() => supportTicketSchema.parse({ subject: 'Help', description: 'x'.repeat(5001) })).toThrow();
    });
  });

  describe('supportMessageSchema', () => {
    it('accepts valid message', () => {
      expect(() => supportMessageSchema.parse({ content: 'Hello' })).not.toThrow();
    });

    it('rejects empty content', () => {
      expect(() => supportMessageSchema.parse({ content: '' })).toThrow();
    });
  });
});

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<b>bold</b>')).toBe('bold');
  });

  it('strips script tags', () => {
    expect(sanitizeText('<script>alert(1)</script>')).toBe('alert(1)');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('strips nested tags', () => {
    expect(sanitizeText('<div><p>text</p></div>')).toBe('text');
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });
});

describe('validateInput', () => {
  it('returns success for valid data', () => {
    const result = validateInput(emailSchema, { email: 'test@example.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('returns error message for invalid data', () => {
    const result = validateInput(emailSchema, { email: 'invalid' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it('returns first error for multiple violations', () => {
    const result = validateInput(signupSchema, { email: 'invalid', password: '', name: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe('string');
    }
  });

  it('returns "Invalid input" for non-Zod errors', () => {
    const result = validateInput(emailSchema, null);
    expect(result.success).toBe(false);
  });
});
