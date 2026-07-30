import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildFilterHash, CK } from '../../lib/cache';

describe('buildFilterHash', () => {
  it('returns "default" for empty params', () => {
    expect(buildFilterHash({})).toBe('default');
  });

  it('returns "default" when all values are undefined', () => {
    expect(buildFilterHash({ category: undefined, sort: undefined })).toBe('default');
  });

  it('returns "default" when all values are "all"', () => {
    expect(buildFilterHash({ category: 'all', pricing: 'all' })).toBe('default');
  });

  it('returns null for more than 2 active filters (no cache)', () => {
    expect(buildFilterHash({ category: 'ai', sort: 'name', pricing: 'free' })).toBeNull();
  });

  it('returns parameterized hash for single filter', () => {
    expect(buildFilterHash({ category: 'healthcare' })).toBe('category=healthcare');
  });

  it('returns parameterized hash for two filters', () => {
    expect(buildFilterHash({ category: 'ai', sort: 'upvotes' })).toBe('category=ai&sort=upvotes');
  });

  it('sorts params alphabetically for consistent keys', () => {
    const hash1 = buildFilterHash({ sort: 'name', category: 'ai' });
    const hash2 = buildFilterHash({ category: 'ai', sort: 'name' });
    expect(hash1).toBe(hash2);
    expect(hash1).toBe('category=ai&sort=name');
  });

  it('ignores "all" values in active filter count', () => {
    expect(buildFilterHash({ category: 'all', sort: 'name' })).toBe('sort=name');
  });

  it('ignores undefined values', () => {
    expect(buildFilterHash({ category: 'ai', sort: undefined })).toBe('category=ai');
  });
});

describe('CK (Cache Key constants)', () => {
  it('has correct static keys', () => {
    expect(CK.TOOL_CATEGORIES).toBe('tool:categories');
    expect(CK.TAG_GROUPS).toBe('tool:tag-groups');
    expect(CK.TOOL_TAG_MAP).toBe('tool:tag-map');
    expect(CK.TRENDING).toBe('tool:trending');
    expect(CK.UPVOTED_MONTH).toBe('tool:upvoted-month');
    expect(CK.RECENT_TOOLS).toBe('tool:recent');
    expect(CK.EDITORS_PICKS).toBe('tool:editors-picks');
    expect(CK.HOMEPAGE_STATS).toBe('homepage:stats');
  });

  it('generates parameterized tool page keys', () => {
    expect(CK.toolsPage('default', 1)).toBe('tools:default:p1');
    expect(CK.toolsPage('category=ai', 3)).toBe('tools:category=ai:p3');
  });

  it('generates parameterized tools count keys', () => {
    expect(CK.toolsCount('default')).toBe('tools:default:count');
  });
});
