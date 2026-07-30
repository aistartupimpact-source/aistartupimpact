import { describe, it, expect } from 'vitest';
import { formatUsd, getCityContext } from '../../lib/seo-utils';

describe('formatUsd', () => {
  it('returns null for zero', () => {
    expect(formatUsd(0)).toBeNull();
  });

  it('returns null for null input', () => {
    expect(formatUsd(null)).toBeNull();
  });

  it('formats billions correctly', () => {
    expect(formatUsd(150000000000)).toBe('$1.5B'); // $1.5B in cents
  });

  it('formats millions correctly', () => {
    expect(formatUsd(4100000000)).toBe('$41M'); // $41M in cents
  });

  it('formats thousands correctly', () => {
    expect(formatUsd(50000000)).toBe('$500K'); // $500K in cents
  });

  it('formats small amounts', () => {
    expect(formatUsd(1000000)).toBe('$10K'); // $10K in cents
  });
});

describe('getCityContext', () => {
  it('returns context for Bengaluru', () => {
    const context = getCityContext('Bengaluru');
    expect(context).toContain('Silicon Valley');
  });

  it('returns context for Hyderabad', () => {
    const context = getCityContext('Hyderabad');
    expect(context).toContain('tech hub');
  });

  it('returns context for Mumbai', () => {
    const context = getCityContext('Mumbai');
    expect(context).toContain('financial capital');
  });

  it('returns default context for unknown city', () => {
    const context = getCityContext('UnknownCity');
    expect(context).toContain('India'); // fallback mentions India
  });
});
