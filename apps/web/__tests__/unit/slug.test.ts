import { describe, it, expect } from 'vitest';

// The validation regex used across our APIs
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe('Slug Regex Validation Rules', () => {
  it('allows valid slugs', () => {
    expect(slugRegex.test('sarvam-ai')).toBe(true);
    expect(slugRegex.test('chatgpt')).toBe(true);
    expect(slugRegex.test('midjourney-v6')).toBe(true);
    expect(slugRegex.test('123-abc-456')).toBe(true);
  });

  it('rejects uppercase letters', () => {
    expect(slugRegex.test('Sarvam-ai')).toBe(false);
    expect(slugRegex.test('CHATGPT')).toBe(false);
    expect(slugRegex.test('Midjourney-V6')).toBe(false);
  });

  it('rejects double hyphens', () => {
    expect(slugRegex.test('sarvam--ai')).toBe(false);
    expect(slugRegex.test('chat--gpt')).toBe(false);
  });

  it('rejects leading or trailing hyphens', () => {
    expect(slugRegex.test('-sarvam-ai')).toBe(false);
    expect(slugRegex.test('sarvam-ai-')).toBe(false);
    expect(slugRegex.test('-chatgpt-')).toBe(false);
  });

  it('rejects spaces and special characters', () => {
    expect(slugRegex.test('sarvam ai')).toBe(false);
    expect(slugRegex.test('sarvam_ai')).toBe(false);
    expect(slugRegex.test('sarvam.ai')).toBe(false);
    expect(slugRegex.test('sarvam/ai')).toBe(false);
    expect(slugRegex.test('sarvam$ai')).toBe(false);
  });
});
