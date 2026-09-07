import { describe, it, expect } from 'vitest';
import { slugify } from '@/lib/slug-utils';

describe('slugify', () => {
  it('converts basic name to slug', () => {
    expect(slugify('Sivi AI')).toBe('sivi-ai');
  });

  it('removes dots', () => {
    expect(slugify('Builder.ai')).toBe('builderai');
  });

  it('strips special characters', () => {
    expect(slugify('Hello $World! @2024')).toBe('hello-world-2024');
  });

  it('collapses multiple spaces to single hyphen', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello---world')).toBe('hello-world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('trims leading and trailing hyphens', () => {
    expect(slugify('-hello-world-')).toBe('hello-world');
  });

  it('lowercases everything', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });

  it('handles empty string', () => {
    expect(slugify('')).toBe('');
  });

  it('handles single character', () => {
    expect(slugify('A')).toBe('a');
  });

  it('handles already-valid slug', () => {
    expect(slugify('hello-world')).toBe('hello-world');
  });

  it('handles numbers', () => {
    expect(slugify('Product 2024')).toBe('product-2024');
  });

  it('handles mixed special chars and spaces', () => {
    expect(slugify("What's New? (v2.0)")).toBe('whats-new-v20');
  });
});
