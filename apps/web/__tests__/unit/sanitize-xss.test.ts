import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@/lib/sanitize';
import { sanitizeText } from '@/lib/validation';

describe('OWASP XSS vectors — sanitizeHtml', () => {
  describe('script injection variants', () => {
    it('strips script with src attribute', () => {
      const result = sanitizeHtml('<script src="https://evil.com/xss.js"></script>');
      expect(result).not.toContain('<script');
      expect(result).not.toContain('evil.com');
    });

    it('strips script with type=text/javascript', () => {
      const result = sanitizeHtml('<script type="text/javascript">document.cookie</script>');
      expect(result).not.toContain('<script');
      expect(result).not.toContain('document.cookie');
    });

    it('strips script with mixed case', () => {
      const result = sanitizeHtml('<ScRiPt>alert(1)</ScRiPt>');
      expect(result).not.toContain('alert');
    });

    it('strips script with null bytes (tag broken, text safe)', () => {
      const result = sanitizeHtml('<scr\x00ipt>alert(1)</script>');
      expect(result).not.toContain('<script');
    });

    it('strips script with extra whitespace', () => {
      const result = sanitizeHtml('<script   >alert(1)</script  >');
      expect(result).not.toContain('alert');
    });
  });

  describe('event handler injection', () => {
    it('strips onmouseover', () => {
      const result = sanitizeHtml('<a href="#" onmouseover="alert(1)">hover</a>');
      expect(result).not.toContain('onmouseover');
    });

    it('strips onfocus with autofocus', () => {
      const result = sanitizeHtml('<input onfocus="alert(1)" autofocus>');
      expect(result).not.toContain('onfocus');
      expect(result).not.toContain('autofocus');
    });

    it('strips onblur', () => {
      const result = sanitizeHtml('<div onblur="alert(1)" tabindex="0">text</div>');
      expect(result).not.toContain('onblur');
    });

    it('strips onanimationend', () => {
      const result = sanitizeHtml('<div onanimationend="alert(1)">text</div>');
      expect(result).not.toContain('onanimationend');
    });

    it('strips ontoggle on details', () => {
      const result = sanitizeHtml('<details ontoggle="alert(1)" open><summary>X</summary></details>');
      expect(result).not.toContain('ontoggle');
    });
  });

  describe('javascript: URI vectors', () => {
    it('strips javascript: in href', () => {
      const result = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
      expect(result).not.toContain('javascript:');
    });

    it('strips javascript: with entity encoding', () => {
      const result = sanitizeHtml('<a href="&#106;avascript:alert(1)">click</a>');
      expect(result).not.toContain('javascript');
      expect(result).not.toContain('alert');
    });

    it('strips javascript: with tab characters', () => {
      const result = sanitizeHtml('<a href="java\tscript:alert(1)">click</a>');
      expect(result).not.toContain('alert');
    });

    it('strips javascript: with newline', () => {
      const result = sanitizeHtml('<a href="java\nscript:alert(1)">click</a>');
      expect(result).not.toContain('alert');
    });

    it('strips vbscript: URI', () => {
      const result = sanitizeHtml('<a href="vbscript:MsgBox(1)">click</a>');
      expect(result).not.toContain('vbscript');
    });
  });

  describe('data: URI vectors', () => {
    it('strips data: URI in img src', () => {
      const result = sanitizeHtml('<img src="data:image/svg+xml,<svg onload=alert(1)>">');
      expect(result).not.toContain('data:');
      expect(result).not.toContain('alert');
    });

    it('strips data: URI in link href', () => {
      const result = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">click</a>');
      expect(result).not.toContain('data:');
    });

    it('strips data: URI with base64', () => {
      const result = sanitizeHtml('<img src="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">');
      expect(result).not.toContain('data:');
    });
  });

  describe('encoding bypass attempts', () => {
    it('handles HTML entity encoded event handler', () => {
      const result = sanitizeHtml('<p &#111;nclick="alert(1)">text</p>');
      expect(result).not.toContain('onclick');
      expect(result).not.toContain('alert');
    });

    it('handles double-encoded payloads', () => {
      const result = sanitizeHtml('<p>%253Cscript%253Ealert(1)%253C/script%253E</p>');
      expect(result).not.toContain('<script');
    });

    it('handles unicode escapes in event handlers', () => {
      const result = sanitizeHtml('<div onclick="alert(1)">text</div>');
      expect(result).not.toContain('onclick');
    });

    it('handles hex-encoded characters', () => {
      const result = sanitizeHtml('<a href="&#x6A;&#x61;&#x76;&#x61;&#x73;&#x63;&#x72;&#x69;&#x70;&#x74;&#x3A;alert(1)">click</a>');
      expect(result).not.toContain('javascript');
    });
  });

  describe('tag injection bypass attempts', () => {
    it('strips meta refresh redirect', () => {
      const result = sanitizeHtml('<meta http-equiv="refresh" content="0;url=https://evil.com">');
      expect(result).not.toContain('<meta');
      expect(result).not.toContain('evil.com');
    });

    it('strips base tag hijack', () => {
      const result = sanitizeHtml('<base href="https://evil.com/">');
      expect(result).not.toContain('<base');
    });

    it('strips link tag with stylesheet', () => {
      const result = sanitizeHtml('<link rel="stylesheet" href="https://evil.com/xss.css">');
      expect(result).not.toContain('<link');
    });

    it('strips style tag with expression', () => {
      const result = sanitizeHtml('<style>body{background:url("javascript:alert(1)")}</style>');
      expect(result).not.toContain('<style');
    });

    it('strips math/maction tags', () => {
      const result = sanitizeHtml('<math><maction actiontype="statusline#" xlink:href="javascript:alert(1)">click</maction></math>');
      expect(result).not.toContain('javascript');
      expect(result).not.toContain('maction');
    });
  });

  describe('attribute injection', () => {
    it('strips style attribute with expression', () => {
      const result = sanitizeHtml('<p style="background:url(javascript:alert(1))">text</p>');
      expect(result).not.toContain('style=');
      expect(result).not.toContain('javascript');
    });

    it('strips formaction attribute', () => {
      const result = sanitizeHtml('<button formaction="javascript:alert(1)">click</button>');
      expect(result).not.toContain('formaction');
    });

    it('strips srcdoc on iframe', () => {
      const result = sanitizeHtml('<iframe srcdoc="<script>alert(1)</script>"></iframe>');
      expect(result).not.toContain('srcdoc');
      expect(result).not.toContain('<iframe');
    });

    it('strips xlink:href', () => {
      const result = sanitizeHtml('<svg><use xlink:href="data:image/svg+xml,<svg onload=alert(1)>"></use></svg>');
      expect(result).not.toContain('xlink');
      expect(result).not.toContain('alert');
    });
  });
});

describe('OWASP XSS vectors — sanitizeText', () => {
  it('strips all HTML tags', () => {
    const result = sanitizeText('<script>alert(1)</script>Hello');
    expect(result).not.toContain('<script');
    expect(result).toContain('Hello');
  });

  it('strips event handler attributes', () => {
    const result = sanitizeText('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('onerror');
  });

  it('strips SVG payloads', () => {
    const result = sanitizeText('<svg/onload=alert(1)>');
    expect(result).not.toContain('svg');
    expect(result).not.toContain('onload');
  });

  it('strips nested tags', () => {
    const result = sanitizeText('<<script>script>alert(1)<</script>/script>');
    expect(result).not.toContain('<script');
  });

  it('plain text javascript: URI is kept (no HTML context)', () => {
    const result = sanitizeText('javascript:alert(document.cookie)');
    expect(result).toBe('javascript:alert(document.cookie)');
  });

  it('preserves plain text content', () => {
    const result = sanitizeText('Hello, this is normal text with numbers 123');
    expect(result).toBe('Hello, this is normal text with numbers 123');
  });
});
