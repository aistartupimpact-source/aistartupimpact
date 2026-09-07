import { describe, it, expect } from 'vitest';
import { buildFilterHash, CK } from '@/lib/cache';

describe('cache helpers', () => {
  describe('buildFilterHash', () => {
    it('returns "default" for empty params', () => {
      expect(buildFilterHash({})).toBe('default');
    });

    it('returns "default" when all params are "all"', () => {
      expect(buildFilterHash({ category: 'all', sort: 'all' })).toBe('default');
    });

    it('returns null for more than 2 active filters', () => {
      expect(buildFilterHash({
        category: 'ai',
        pricing: 'free',
        sort: 'newest',
      })).toBeNull();
    });

    it('returns deterministic hash for single filter', () => {
      const hash = buildFilterHash({ category: 'ai' });
      expect(hash).toBe('category=ai');
    });

    it('returns sorted key=value pairs for two filters', () => {
      const hash = buildFilterHash({ sort: 'newest', category: 'ai' });
      expect(hash).toBe('category=ai&sort=newest');
    });

    it('ignores undefined values', () => {
      const hash = buildFilterHash({ category: 'ai', sort: undefined });
      expect(hash).toBe('category=ai');
    });

    it('ignores "all" values', () => {
      const hash = buildFilterHash({ category: 'ai', pricing: 'all' });
      expect(hash).toBe('category=ai');
    });

    it('handles two active filters correctly', () => {
      const hash = buildFilterHash({ category: 'ai', pricing: 'free' });
      expect(hash).toBe('category=ai&pricing=free');
    });

    it('produces same hash regardless of input order', () => {
      const hash1 = buildFilterHash({ pricing: 'free', category: 'ai' });
      const hash2 = buildFilterHash({ category: 'ai', pricing: 'free' });
      expect(hash1).toBe(hash2);
    });
  });

  describe('CK cache key constants', () => {
    it('has static string keys', () => {
      expect(CK.TOOL_CATEGORIES).toBe('tool:categories');
      expect(CK.HOMEPAGE_STATS).toBe('homepage:stats');
      expect(CK.TRENDING).toBe('tool:trending');
      expect(CK.SEARCH_SUGGESTIONS).toBe('search:suggestions');
    });

    it('generates parameterized tool detail keys', () => {
      expect(CK.tool('my-tool')).toBe('tool:detail:my-tool');
    });

    it('generates parameterized tool similar keys', () => {
      expect(CK.toolSimilar('cat-1', 'my-tool')).toBe('tool:similar:cat-1:my-tool');
    });

    it('generates parameterized tool tags keys', () => {
      expect(CK.toolTags('tool-123')).toBe('tool:tags:tool-123');
    });

    it('generates parameterized tool alternatives keys', () => {
      expect(CK.toolAlternatives('tool-123')).toBe('tool:alts:tool-123');
    });

    it('generates tool directory keys with default', () => {
      expect(CK.toolDirectory('')).toBe('tool:directory:all');
      expect(CK.toolDirectory('ai-writing')).toBe('tool:directory:ai-writing');
    });

    it('generates opinion keys', () => {
      expect(CK.opinionLatest('tech', 1)).toBe('opinion:latest:tech:p1');
      expect(CK.opinionLatest('', 2)).toBe('opinion:latest:all:p2');
      expect(CK.opinionFeatured()).toBe('opinion:featured');
      expect(CK.opinionTrending()).toBe('opinion:trending');
    });

    it('generates author keys', () => {
      expect(CK.author('john-doe')).toBe('author:john-doe');
    });

    it('generates paginated tools keys', () => {
      expect(CK.toolsPage('abc', 1)).toBe('tools:abc:p1');
      expect(CK.toolsCount('abc')).toBe('tools:abc:count');
    });

    it('generates paginated startups keys', () => {
      expect(CK.startupsPage('xyz', 3)).toBe('startups:xyz:p3');
    });
  });
});
