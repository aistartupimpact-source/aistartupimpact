# SEO Engine Enhancement Plan
## Upgrading Existing Individual Pages with 4-Layer SEO Architecture

---

## ✅ Current State Assessment

### What Already Exists:
- ✅ **URL Layer**: Individual pages at `/startups/[slug]` and `/tools/[slug]`
- ✅ **Basic Meta Tags**: Title and description in `generateMetadata()`
- ✅ **Canonical URLs**: Already set in metadata
- ✅ **Content Structure**: H1/H2 hierarchy exists
- ✅ **Breadcrumbs**: Visual breadcrumbs in UI

### What's Missing (Critical for 2026 SEO):
- ❌ **JSON-LD Schema Markup** (Organization, SoftwareApplication, BreadcrumbList)
- ❌ **Enhanced Meta Tags** (OG images, Twitter cards, keywords)
- ❌ **FAQ Schema** (for rich snippets)
- ❌ **Structured Data Validation**
- ❌ **Sitemap Generation**
- ❌ **AI-Optimized Content** (for Gemini, Perplexity, ChatGPT citations)

---

## 🎯 Enhancement Strategy

### Phase 1: Schema Layer (CRITICAL - Week 1)
**Why First**: Google's 2026 experiment showed pages without schema don't get indexed

#### 1.1 Create Schema Components

**File**: `apps/web/components/seo/StartupSchema.tsx`
```typescript
interface StartupSchemaProps {
  startup: {
    name: string;
    description: string;
    logoUrl?: string;
    websiteUrl?: string;
    foundedYear?: number;
    headquartersCity?: string;
    founders?: string[];
    employeeCount?: number;
    linkedinUrl?: string;
    twitterUrl?: string;
  };
}

export function StartupSchema({ startup }: StartupSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": startup.name,
    "description": startup.description,
    "url": startup.websiteUrl,
    "logo": startup.logoUrl,
    "foundingDate": startup.foundedYear?.toString(),
    "foundingLocation": startup.headquartersCity ? {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": startup.headquartersCity,
        "addressCountry": "IN"
      }
    } : undefined,
    "founder": startup.founders?.map(name => ({
      "@type": "Person",
      "name": name
    })),
    "numberOfEmployees": startup.employeeCount ? {
      "@type": "QuantitativeValue",
      "value": startup.employeeCount
    } : undefined,
    "sameAs": [
      startup.linkedinUrl,
      startup.twitterUrl
    ].filter(Boolean)
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**File**: `apps/web/components/seo/ToolSchema.tsx`
```typescript
interface ToolSchemaProps {
  tool: {
    name: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    logoUrl?: string;
    pricingModel: string;
    startingPrice?: number;
    avgRating?: number;
    reviewCount?: number;
    categoryId: string;
  };
}

export function ToolSchema({ tool }: ToolSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "applicationCategory": "AI Tool",
    "description": tool.description,
    "url": tool.websiteUrl,
    "screenshot": tool.logoUrl,
    "offers": tool.startingPrice ? {
      "@type": "Offer",
      "price": tool.startingPrice,
      "priceCurrency": "USD"
    } : undefined,
    "aggregateRating": tool.avgRating ? {
      "@type": "AggregateRating",
      "ratingValue": tool.avgRating,
      "reviewCount": tool.reviewCount || 0
    } : undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**File**: `apps/web/components/seo/BreadcrumbSchema.tsx`
```typescript
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

**File**: `apps/web/components/seo/FAQSchema.tsx`
```typescript
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

#### 1.2 Integrate Schema into Existing Pages

**Update**: `apps/web/app/(public)/startups/[slug]/page.tsx`

Add imports:
```typescript
import { StartupSchema } from '@/components/seo/StartupSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { FAQSchema } from '@/components/seo/FAQSchema';
```

Add schemas before the main content:
```typescript
export default async function StartupDetailPage({ params }: { params: { slug: string } }) {
  const startup = await getStartup(params.slug);
  
  if (!startup) return <NotFound />;

  // Auto-generate FAQs
  const faqs = [
    {
      question: `What does ${startup.name} do?`,
      answer: startup.description
    },
    {
      question: `Where is ${startup.name} based?`,
      answer: `${startup.name} is headquartered in ${startup.headquartersCity || 'India'}.`
    },
    {
      question: `When was ${startup.name} founded?`,
      answer: `${startup.name} was founded in ${startup.foundedYear || 'recent years'}.`
    },
    {
      question: `How much funding has ${startup.name} raised?`,
      answer: `${startup.name} has raised ${formatUsd(totalRaised) || 'undisclosed funding'}.`
    }
  ];

  return (
    <>
      {/* Schema Markup */}
      <StartupSchema startup={startup} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://aistartupimpact.com' },
        { name: 'Startups', url: 'https://aistartupimpact.com/startups' },
        { name: startup.name, url: `https://aistartupimpact.com/startups/${startup.slug}` }
      ]} />
      <FAQSchema faqs={faqs} />

      {/* Existing content */}
      <div className="max-w-5xl mx-auto...">
        {/* ... */}
      </div>
    </>
  );
}
```

---

### Phase 2: Enhanced Meta Layer (Week 1)

#### 2.1 Upgrade generateMetadata()

**Current**:
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getStartup(params.slug);
  if (!s) return { title: 'Startup Not Found' };
  return {
    title: `${s.name} — ${s.tagline}`,
    description: (s.description || s.tagline || '').slice(0, 160),
    alternates: { canonical: `https://aistartupimpact.com/startups/${s.slug}` },
  };
}
```

**Enhanced**:
```typescript
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const s = await getStartup(params.slug);
  if (!s) return { title: 'Startup Not Found' };
  
  const title = `${s.name} - ${s.tagline} | AI Startup Impact`;
  const description = s.description?.slice(0, 155) || s.tagline;
  const url = `https://aistartupimpact.com/startups/${s.slug}`;
  const image = s.logoUrl || 'https://aistartupimpact.com/og-default-startup.png';

  return {
    title,
    description,
    keywords: [
      s.name,
      s.tagline,
      'AI startup',
      'India AI',
      s.headquartersCity,
      s.stage,
      'artificial intelligence',
      'machine learning'
    ].filter(Boolean).join(', '),
    authors: s.founders?.map(name => ({ name })),
    creator: s.name,
    publisher: 'AI Startup Impact',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'AI Startup Impact',
      images: [{
        url: image,
        width: 1200,
        height: 630,
        alt: `${s.name} logo`
      }],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@aistartupimpact',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
```

---

### Phase 3: FAQ Section (Week 2)

#### 3.1 Add FAQ Component to Pages

**File**: `apps/web/components/FAQSection.tsx`
```typescript
interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <div className="card p-6 mt-8">
      <h2 className="section-title mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <details key={index} className="group">
            <summary className="flex items-center justify-between cursor-pointer p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <h3 className="font-sora font-semibold text-sm text-navy dark:text-white pr-4">
                {faq.question}
              </h3>
              <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div className="p-4 pt-2">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
```

#### 3.2 Auto-Generate FAQs

**Add to startup page**:
```typescript
// Auto-generate FAQs based on startup data
function generateStartupFAQs(startup: any, totalRaised: number) {
  const faqs = [];

  // Always include these
  faqs.push({
    question: `What does ${startup.name} do?`,
    answer: startup.description
  });

  if (startup.headquartersCity) {
    faqs.push({
      question: `Where is ${startup.name} located?`,
      answer: `${startup.name} is headquartered in ${startup.headquartersCity}, India.`
    });
  }

  if (startup.foundedYear) {
    faqs.push({
      question: `When was ${startup.name} founded?`,
      answer: `${startup.name} was founded in ${startup.foundedYear}.`
    });
  }

  if (totalRaised > 0) {
    faqs.push({
      question: `How much funding has ${startup.name} raised?`,
      answer: `${startup.name} has raised a total of ${formatUsd(totalRaised)} across ${startup.fundingRounds.length} funding round${startup.fundingRounds.length > 1 ? 's' : ''}.`
    });
  }

  if (startup.founders && startup.founders.length > 0) {
    faqs.push({
      question: `Who founded ${startup.name}?`,
      answer: `${startup.name} was founded by ${startup.founders.join(', ')}.`
    });
  }

  if (startup.employeeCount) {
    faqs.push({
      question: `How many employees does ${startup.name} have?`,
      answer: `${startup.name} currently has ${startup.employeeCount}+ employees.`
    });
  }

  faqs.push({
    question: `Is ${startup.name} hiring?`,
    answer: `Visit ${startup.name}'s website or LinkedIn page to check for current job openings and career opportunities.`
  });

  return faqs;
}
```

---

### Phase 4: Sitemap Generation (Week 2)

#### 4.1 Create Startup Sitemap

**File**: `apps/web/app/(public)/startups/sitemap.ts`
```typescript
import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const startups = await sql`
    SELECT slug, "updatedAt"
    FROM "Startup"
    WHERE "deletedAt" IS NULL
    ORDER BY "updatedAt" DESC
  `;

  return startups.map((startup: any) => ({
    url: `https://aistartupimpact.com/startups/${startup.slug}`,
    lastModified: new Date(startup.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

#### 4.2 Create Tool Sitemap

**File**: `apps/web/app/(public)/tools/sitemap.ts`
```typescript
import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tools = await sql`
    SELECT slug, "updatedAt"
    FROM "AiTool"
    WHERE "deletedAt" IS NULL AND status = 'APPROVED'
    ORDER BY "updatedAt" DESC
  `;

  return tools.map((tool: any) => ({
    url: `https://aistartupimpact.com/tools/${tool.slug}`,
    lastModified: new Date(tool.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
}
```

---

### Phase 5: Dynamic OG Images (Week 3)

#### 5.1 Create OG Image Generator

**File**: `apps/web/app/(public)/startups/[slug]/opengraph-image.tsx`
```typescript
import { ImageResponse } from 'next/og';
import { sql } from '@/lib/db';

export const runtime = 'edge';
export const alt = 'Startup Profile';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const startup = await sql`
    SELECT name, tagline, "logoUrl", "headquartersCity", stage
    FROM "Startup"
    WHERE slug = ${params.slug}
    LIMIT 1
  `;

  if (!startup.length) {
    return new ImageResponse(<div>Not Found</div>);
  }

  const s = startup[0];

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {s.logoUrl && (
          <img
            src={s.logoUrl}
            alt={s.name}
            width={120}
            height={120}
            style={{ borderRadius: '24px', marginBottom: '32px' }}
          />
        )}
        <div style={{ fontSize: 64, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>
          {s.name}
        </div>
        <div style={{ fontSize: 32, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: '16px' }}>
          {s.tagline}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
          {s.headquartersCity && (
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
              📍 {s.headquartersCity}
            </div>
          )}
          {s.stage && (
            <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px' }}>
              {s.stage.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
```

---

## 📊 Implementation Checklist

### Week 1: Schema & Meta (CRITICAL)
- [ ] Create `StartupSchema.tsx` component
- [ ] Create `ToolSchema.tsx` component
- [ ] Create `BreadcrumbSchema.tsx` component
- [ ] Create `FAQSchema.tsx` component
- [ ] Integrate schemas into startup page
- [ ] Integrate schemas into tool page
- [ ] Enhance `generateMetadata()` for startups
- [ ] Enhance `generateMetadata()` for tools
- [ ] Test with Google Rich Results Test
- [ ] Validate all schema with Schema.org validator

### Week 2: Content & Sitemaps
- [ ] Create `FAQSection.tsx` component
- [ ] Add auto-generated FAQs to startup pages
- [ ] Add auto-generated FAQs to tool pages
- [ ] Create startup sitemap
- [ ] Create tool sitemap
- [ ] Submit sitemaps to Google Search Console
- [ ] Monitor indexing status

### Week 3: OG Images & Polish
- [ ] Create dynamic OG image for startups
- [ ] Create dynamic OG image for tools
- [ ] Test OG images with Meta Debugger
- [ ] Add structured data testing to CI/CD
- [ ] Set up Google Analytics events
- [ ] Create SEO monitoring dashboard

---

## 🧪 Testing & Validation

### Schema Validation Tools:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Monitor indexing and errors

### Meta Tag Testing:
1. **Meta Tags Debugger**: https://metatags.io/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/

### Performance Testing:
1. **PageSpeed Insights**: https://pagespeed.web.dev/
2. **Lighthouse**: Built into Chrome DevTools
3. **WebPageTest**: https://www.webpagetest.org/

---

## 📈 Success Metrics (Track Monthly)

### Technical Metrics:
- [ ] 100% of pages have valid JSON-LD schema
- [ ] 0 schema validation errors in Search Console
- [ ] 100% of pages indexed by Google
- [ ] Page load time < 2 seconds
- [ ] Core Web Vitals: All green

### SEO Metrics:
- [ ] Number of pages in Google index
- [ ] Number of pages ranking in top 10
- [ ] Number of featured snippets captured
- [ ] Number of AI Overview appearances
- [ ] Organic traffic growth %

### Business Metrics:
- [ ] Click-through rate from search
- [ ] Average time on page
- [ ] Bounce rate
- [ ] Conversion rate (external clicks, signups)

---

## 🚀 Quick Start

### 1. Create Schema Components
```bash
mkdir -p apps/web/components/seo
touch apps/web/components/seo/StartupSchema.tsx
touch apps/web/components/seo/ToolSchema.tsx
touch apps/web/components/seo/BreadcrumbSchema.tsx
touch apps/web/components/seo/FAQSchema.tsx
```

### 2. Test Locally
```bash
npm run dev
# Visit: http://localhost:3000/startups/sarvam-ai
# View source and check for <script type="application/ld+json">
```

### 3. Validate Schema
```bash
# Copy the JSON-LD from page source
# Paste into: https://validator.schema.org/
```

### 4. Deploy & Monitor
```bash
git add .
git commit -m "Add JSON-LD schema markup for SEO"
git push
# Monitor in Google Search Console
```

---

## 🎯 Priority Order

### Must Have (This Week):
1. ✅ StartupSchema component
2. ✅ ToolSchema component
3. ✅ BreadcrumbSchema component
4. ✅ Enhanced generateMetadata()

### Should Have (Next Week):
5. FAQSchema component
6. Auto-generated FAQ sections
7. Sitemap generation
8. Search Console submission

### Nice to Have (Future):
9. Dynamic OG images
10. Review schema
11. Video schema
12. Event schema

---

**Ready to implement? Start with creating the schema components!**
