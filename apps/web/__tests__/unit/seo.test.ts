import { describe, it, expect } from 'vitest';
import { generateWebSiteSchema, generateOrganizationSchema, generateBreadcrumbSchema } from '../../lib/seo';

describe('generateWebSiteSchema', () => {
  it('returns valid WebSite schema', () => {
    const schema = generateWebSiteSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('AIStartupImpact');
    expect(schema.url).toBe('https://aistartupimpact.com');
  });

  it('includes SearchAction', () => {
    const schema = generateWebSiteSchema();
    expect(schema.potentialAction['@type']).toBe('SearchAction');
    expect(schema.potentialAction.target).toContain('search?q=');
  });
});

describe('generateOrganizationSchema', () => {
  it('returns valid Organization schema', () => {
    const schema = generateOrganizationSchema();
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('Organization');
    expect(schema.name).toBe('AIStartupImpact');
    expect(schema.url).toBe('https://aistartupimpact.com');
  });

  it('includes social profiles', () => {
    const schema = generateOrganizationSchema();
    expect(schema.sameAs).toBeInstanceOf(Array);
    expect(schema.sameAs.length).toBeGreaterThan(0);
  });

  it('includes contact point', () => {
    const schema = generateOrganizationSchema();
    expect(schema.contactPoint['@type']).toBe('ContactPoint');
    expect(schema.contactPoint.email).toContain('@aistartupimpact.com');
  });
});

describe('generateBreadcrumbSchema', () => {
  it('returns valid BreadcrumbList schema', () => {
    const crumbs = [
      { name: 'Home', url: 'https://aistartupimpact.com' },
      { name: 'Tools', url: 'https://aistartupimpact.com/tools' },
    ];
    const schema = generateBreadcrumbSchema(crumbs);
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema['@type']).toBe('BreadcrumbList');
  });

  it('generates correct position numbers', () => {
    const crumbs = [
      { name: 'Home', url: 'https://aistartupimpact.com' },
      { name: 'Tools', url: 'https://aistartupimpact.com/tools' },
      { name: 'ChatGPT', url: 'https://aistartupimpact.com/tools/chatgpt' },
    ];
    const schema = generateBreadcrumbSchema(crumbs);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[2].position).toBe(3);
  });

  it('includes item names and URLs', () => {
    const crumbs = [{ name: 'Tools', url: 'https://aistartupimpact.com/tools' }];
    const schema = generateBreadcrumbSchema(crumbs);
    expect(schema.itemListElement[0].name).toBe('Tools');
    expect(schema.itemListElement[0].item).toBe('https://aistartupimpact.com/tools');
  });
});
