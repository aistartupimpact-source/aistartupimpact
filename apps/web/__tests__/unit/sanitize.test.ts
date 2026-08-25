import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';

describe('sanitizeHtml', () => {
  describe('allowed tags', () => {
    it('preserves paragraphs', () => {
      expect(sanitizeHtml('<p>Hello</p>')).toBe('<p>Hello</p>');
    });

    it('preserves headings', () => {
      expect(sanitizeHtml('<h1>Title</h1>')).toContain('<h1>Title</h1>');
    });

    it('preserves lists', () => {
      const html = '<ul><li>Item</li></ul>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    it('preserves links with href', () => {
      expect(sanitizeHtml('<a href="https://example.com">link</a>')).toBe('<a href="https://example.com">link</a>');
    });

    it('preserves images with src and alt', () => {
      const html = '<img src="https://example.com/img.png" alt="test" />';
      const result = sanitizeHtml(html);
      expect(result).toContain('src="https://example.com/img.png"');
      expect(result).toContain('alt="test"');
    });

    it('preserves tables', () => {
      const html = '<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>D</td></tr></tbody></table>';
      expect(sanitizeHtml(html)).toBe(html);
    });

    it('preserves class attributes on any element', () => {
      expect(sanitizeHtml('<p class="my-class">text</p>')).toBe('<p class="my-class">text</p>');
    });
  });

  describe('disallowed tags', () => {
    it('strips script tags', () => {
      expect(sanitizeHtml('<script>alert(1)</script>')).toBe('');
    });

    it('strips iframe tags', () => {
      expect(sanitizeHtml('<iframe src="https://evil.com"></iframe>')).toBe('');
    });

    it('strips form tags', () => {
      expect(sanitizeHtml('<form action="/steal"><input type="text"></form>')).toBe('');
    });

    it('strips object tags', () => {
      expect(sanitizeHtml('<object data="evil.swf"></object>')).toBe('');
    });

    it('strips embed tags', () => {
      expect(sanitizeHtml('<embed src="evil.swf">')).toBe('');
    });
  });

  describe('disallowed attributes', () => {
    it('strips onclick', () => {
      const result = sanitizeHtml('<p onclick="alert(1)">text</p>');
      expect(result).not.toContain('onclick');
      expect(result).toContain('text');
    });

    it('strips onerror on img', () => {
      const result = sanitizeHtml('<img src="x" onerror="alert(1)" />');
      expect(result).not.toContain('onerror');
    });

    it('strips onload', () => {
      const result = sanitizeHtml('<div onload="alert(1)">text</div>');
      expect(result).not.toContain('onload');
    });
  });

  describe('URL schemes', () => {
    it('allows http links', () => {
      const result = sanitizeHtml('<a href="http://example.com">link</a>');
      expect(result).toContain('href="http://example.com"');
    });

    it('allows https links', () => {
      const result = sanitizeHtml('<a href="https://example.com">link</a>');
      expect(result).toContain('href="https://example.com"');
    });

    it('allows mailto links', () => {
      const result = sanitizeHtml('<a href="mailto:test@example.com">email</a>');
      expect(result).toContain('href="mailto:test@example.com"');
    });

    it('strips javascript: scheme', () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
      expect(result).not.toContain('javascript:');
    });

    it('strips data: scheme in img src', () => {
      const result = sanitizeHtml('<img src="data:text/html,<script>alert(1)</script>" />');
      expect(result).not.toContain('data:');
    });
  });

  describe('XSS payloads', () => {
    it('strips svg with onload', () => {
      const result = sanitizeHtml('<svg onload="alert(1)">test</svg>');
      expect(result).not.toContain('onload');
      expect(result).not.toContain('svg');
    });

    it('strips nested script tags', () => {
      const result = sanitizeHtml('<scr<script>ipt>alert(1)</scr</script>ipt>');
      expect(result).not.toContain('<script');
    });

    it('strips event handlers on allowed tags', () => {
      const result = sanitizeHtml('<p onclick="alert(1)" onmouseover="alert(2)">text</p>');
      expect(result).toBe('<p>text</p>');
    });

    it('strips img with onerror payload', () => {
      const result = sanitizeHtml('<img src=x onerror=alert(1)>');
      expect(result).not.toContain('onerror');
    });
  });
});
