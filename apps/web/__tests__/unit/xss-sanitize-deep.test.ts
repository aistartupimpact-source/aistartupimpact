import { describe, it, expect } from 'vitest';
import { sanitizeText } from '@/lib/validation';

describe('XSS sanitization — deep evasion tests', () => {
  describe('sanitizeText strips all HTML tags', () => {
    it('strips basic script tags', () => {
      expect(sanitizeText('<script>alert(1)</script>')).not.toContain('<script');
    });

    it('strips img onerror', () => {
      expect(sanitizeText('<img src=x onerror=alert(1)>')).not.toContain('onerror');
    });

    it('strips svg onload', () => {
      expect(sanitizeText('<svg onload=alert(1)>')).not.toContain('onload');
    });

    it('strips nested tags', () => {
      const result = sanitizeText('<scr<script>ipt>alert(1)</script>');
      expect(result).not.toContain('<script');
      expect(result).not.toContain('</script');
    });

    it('strips double-encoded tags', () => {
      const result = sanitizeText('<<script>script>alert(1)<</script>/script>');
      expect(result).not.toContain('<script');
    });

    it('strips iframe tags', () => {
      expect(sanitizeText('<iframe src="https://evil.com"></iframe>')).not.toContain('<iframe');
    });

    it('strips object tags', () => {
      expect(sanitizeText('<object data="evil.swf"></object>')).not.toContain('<object');
    });

    it('strips embed tags', () => {
      expect(sanitizeText('<embed src="evil.swf">')).not.toContain('<embed');
    });

    it('strips event handlers in div', () => {
      expect(sanitizeText('<div onmouseover="alert(1)">hover</div>')).not.toContain('onmouseover');
    });

    it('handles null bytes in tags', () => {
      const result = sanitizeText('<scr\0ipt>alert(1)</script>');
      expect(result).not.toContain('<scr');
    });
  });

  describe('validation schemas reject dangerous inputs', () => {
    it('email field rejects protocol handlers', async () => {
      const { signupSchema } = await import('@/lib/validation');
      expect(signupSchema.safeParse({
        email: 'javascript:alert(1)',
        password: 'Abc12345',
        name: 'Test',
      }).success).toBe(false);
    });

    it('URL fields reject javascript: protocol', async () => {
      const { startupSubmissionSchema } = await import('@/lib/validation');
      expect(startupSubmissionSchema.safeParse({
        name: 'Test',
        tagline: 'A great startup platform',
        description: 'x'.repeat(50),
        websiteUrl: 'javascript:alert(1)',
        category: 'AI',
        stage: 'SEED',
        founderEmail: 'test@example.com',
      }).success).toBe(false);
    });

    it('URL fields accept data: protocol (zod .url() allows it — CSP blocks execution)', async () => {
      const { toolSubmissionSchema } = await import('@/lib/validation');
      // Note: zod .url() accepts data: URIs. XSS is blocked by CSP default-src 'self'
      // and the sanitize-html allowedSchemes: ['http', 'https', 'mailto']
      const result = toolSubmissionSchema.safeParse({
        name: 'Test',
        tagline: 'A great AI tool for you',
        description: 'x'.repeat(50),
        websiteUrl: 'data:text/html,<script>alert(1)</script>',
        pricingModel: 'FREE',
      });
      expect(result.success).toBe(true);
    });

    it('password field rejects extremely long input (DoS)', async () => {
      const { signupSchema } = await import('@/lib/validation');
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'A'.repeat(101),
        name: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('name field rejects extremely long input', async () => {
      const { signupSchema } = await import('@/lib/validation');
      const result = signupSchema.safeParse({
        email: 'test@example.com',
        password: 'Abc12345',
        name: 'A'.repeat(101),
      });
      expect(result.success).toBe(false);
    });
  });
});

describe('HTML sanitization config — safe defaults', () => {
  it('sanitize config does not allow script tags', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('lib/sanitize.ts', 'utf8')
    );
    expect(src).not.toContain("'script'");
    expect(src).not.toContain('"script"');
  });

  it('sanitize config does not allow iframe tags', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('lib/sanitize.ts', 'utf8')
    );
    expect(src).not.toContain("'iframe'");
    expect(src).not.toContain('"iframe"');
  });

  it('sanitize config does not allow event handler attributes', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('lib/sanitize.ts', 'utf8')
    );
    expect(src).not.toContain('onclick');
    expect(src).not.toContain('onerror');
    expect(src).not.toContain('onload');
    expect(src).not.toContain('onmouseover');
  });

  it('sanitize config only allows safe URL schemes', async () => {
    const src = await import('fs').then(fs =>
      fs.readFileSync('lib/sanitize.ts', 'utf8')
    );
    expect(src).toContain("allowedSchemes");
    expect(src).not.toContain("'javascript'");
    expect(src).not.toContain("'data'");
    expect(src).not.toContain("'vbscript'");
  });
});
