import { Metadata } from 'next';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith('http')
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : 'https://aistartupimpact.com';

const PROD_URL = 'https://aistartupimpact.com'; // always canonical production
const SITE_NAME = 'AIStartupImpact';
const SITE_LOGO = `${PROD_URL}/og-default.png`;
const TWITTER_HANDLE = '@aikitstartup';

// ─── Site-level schemas (injected once in root layout) ───────────────────────

/** WebSite schema — enables Google Sitelinks Search Box + AI engine site identity */
export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AIStartupImpact',
  url: 'https://aistartupimpact.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://aistartupimpact.com/search?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
});

/** Organization schema — publisher identity for all content */
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AIStartupImpact",
  alternateName: "AI Startup India",
  description: "The premier platform for AI startup impact, news, funding, and ecosystem insights for Startups in India.",
  url: "https://aistartupimpact.com",
  logo: "https://aistartupimpact.com/logo.png",
  sameAs: [
    "https://www.linkedin.com/company/yourpage"
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@aistartupimpact.com"
  }
});

// ─── Page-level schemas ───────────────────────────────────────────────────────

/** BreadcrumbList — helps AI engines understand page hierarchy */
export function generateBreadcrumbSchema(
  crumbs: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/** NewsArticle schema — rich structured data for news content */
export function generateArticleSchema(data: {
  title: string;
  excerpt: string;
  content?: string;
  author: { name: string; slug: string; url?: string };
  date: string;
  updatedAt?: string;
  url: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  publisherName?: string;
  publisherLogoUrl?: string;
  isStory?: boolean;
  founderData?: {
    name: string;
    slug: string;
    startupSlug?: string;
  };
}) {
  const publishedDate = new Date(data.date).toISOString();
  const modifiedDate = data.updatedAt
    ? new Date(data.updatedAt).toISOString()
    : publishedDate;

  // Speakable — tells Google/AI which parts to read aloud / extract as answers
  const speakable = {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.article-lede', '.article-content'],
  };

  return {
    '@context': 'https://schema.org',
    '@type': data.isStory ? 'Article' : 'NewsArticle',
    '@id': data.url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': data.url },
    headline: data.title,
    description: data.excerpt,
    image: data.imageUrl
      ? [{ '@type': 'ImageObject', url: data.imageUrl, width: 1200, height: 630 }]
      : [{ '@type': 'ImageObject', url: SITE_LOGO, width: 1200, height: 630 }],
    datePublished: publishedDate,
    dateModified: modifiedDate,
    author: {
      '@type': 'Person',
      name: data.author.name,
      url: data.author.url || `${PROD_URL}/author/${data.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${PROD_URL}/#organization`,
      name: data.publisherName || SITE_NAME,
      logo: {
        '@type': 'ImageObject',
        url: data.publisherLogoUrl || SITE_LOGO,
      },
    },
    keywords: data.tags ? data.tags.join(', ') : data.category || '',
    articleSection: data.category || 'Technology',
    inLanguage: 'en-IN',
    isAccessibleForFree: true,
    speakable,
    // about — helps AI engines understand the topic
    // For stories, link to the founder as the main entity
    about: data.isStory && data.founderData
      ? {
          '@type': 'Person',
          '@id': `${PROD_URL}/founder/${data.founderData.slug}#person`,
          name: data.founderData.name,
          ...(data.founderData.startupSlug ? {
            worksFor: {
              '@type': 'Organization',
              '@id': `${PROD_URL}/startups/${data.founderData.startupSlug}#organization`
            }
          } : {})
        }
      : data.category
      ? { '@type': 'Thing', name: data.category }
      : undefined,
  };
}

/** SoftwareApplication schema for tool detail pages */
export function generateToolSchema(data: {
  name: string;
  description: string;
  url: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  pricing?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: data.category || 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: data.pricing === 'Free' ? '0' : undefined,
      priceCurrency: 'USD',
      description: data.pricing || 'Freemium',
    },
    ...(data.rating && data.reviewCount
      ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: data.rating,
          reviewCount: data.reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }
      : {}),
  };
}

/** ItemList schema — for listing pages (tools, articles, digests) */
export function generateItemListSchema(data: {
  name: string;
  description: string;
  url: string;
  items: { name: string; url: string; description?: string; position: number }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.name,
    description: data.description,
    url: data.url,
    numberOfItems: data.items.length,
    itemListElement: data.items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      description: item.description,
    })),
  };
}

/** CollectionPage schema — for index/listing pages */
export function generateCollectionPageSchema(data: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: data.name,
    description: data.description,
    url: data.url,
    publisher: {
      '@type': 'Organization',
      '@id': `${PROD_URL}/#organization`,
      name: SITE_NAME,
    },
    inLanguage: 'en-IN',
  };
}

/** Person schema for author pages */
export function generatePersonSchema(data: {
  name: string;
  slug: string;
  bio?: string;
  role?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}) {
  const sameAs = [data.twitter, data.linkedin, data.website].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    description: data.bio,
    jobTitle: data.role,
    url: `${PROD_URL}/author/${data.slug}`,
    worksFor: {
      '@type': 'Organization',
      '@id': `${PROD_URL}/#organization`,
      name: SITE_NAME,
    },
    ...(sameAs.length ? { sameAs } : {}),
  };
}

/** FAQPage schema — for pages with Q&A content (AEO gold standard) */
export function generateFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

// ─── Next.js Metadata builder ─────────────────────────────────────────────────

/** Build full Next.js Metadata for article/story pages */
export function buildArticleMetadata(article: {
  title: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  author?: { name?: string | null; slug?: string | null } | null;
  category?: { name?: string | null } | null;
  slug: string;
  type?: string;
}): Metadata {
  const isStory = article.type === 'STORY';
  const path = isStory ? `/stories/${article.slug}` : `/news/${article.slug}`;
  const canonical = `${PROD_URL}${path}`;
  const description = article.excerpt || '';
  const images = article.coverImage
    ? [{ url: article.coverImage, width: 1200, height: 630, alt: article.title }]
    : [{ url: `${PROD_URL}/og-default.png`, width: 1200, height: 630 }];

  return {
    title: article.title,
    description,
    alternates: { canonical },
    authors: article.author?.name ? [{ name: article.author.name }] : undefined,
    openGraph: {
      title: article.title,
      description,
      type: 'article',
      url: canonical,
      siteName: SITE_NAME,
      locale: 'en_IN',
      images,
      ...(article.publishedAt
        ? { publishedTime: new Date(article.publishedAt).toISOString() }
        : {}),
      ...(article.category?.name ? { section: article.category.name } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: images.map((i) => i.url),
      creator: TWITTER_HANDLE,
      site: TWITTER_HANDLE,
    },
  };
}

// ─── Interfaces (kept for backward compat) ───────────────────────────────────
export interface Author {
  name: string;
  slug: string;
  bio?: string;
  url?: string;
}

export interface ArticleData {
  title: string;
  excerpt: string;
  content?: string;
  author: Author;
  date: string;
  updatedAt?: string;
  url: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  publisherName?: string;
  publisherLogoUrl?: string;
}
