# SEO Engine - Final Implementation Plan
## 4 Critical Tasks to 10x Your Organic Traffic

---

## 🎯 The Goal

Transform your directory from **2 ranking pages** to **800+ ranking pages** by adding the 4 critical SEO elements that Google's 2026 algorithm requires.

### Why This Matters:
- **Without schema**: Google may skip indexing entirely (proven in March 2026 controlled experiment)
- **Without sitemap**: Google doesn't know your 200+ pages exist
- **Without OG images**: Founders won't share their listings (no social proof)
- **Without FAQ schema**: You miss AI Overview citations (2026's biggest CTR driver)

---

## 📋 Implementation Order (Do This Week)

### ✅ Task 1: JSON-LD Schema (TODAY - 2-3 hours)
**Priority**: CRITICAL - Without this, Google may not index your pages

#### What to Add:
1. **Organization Schema** for startups
2. **SoftwareApplication Schema** for tools
3. **BreadcrumbList Schema** for navigation
4. **FAQPage Schema** for Q&A sections

#### Implementation:

**Step 1.1: Create Schema Components**

Create: `apps/web/components/seo/StartupSchema.tsx`
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
    stage?: string;
  };
}

export function StartupSchema({ startup }: StartupSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `https://aistartupimpact.com/startups/${startup.name.toLowerCase().replace(/\s+/g, '-')}#organization`,
        "name": startup.name,
        "description": startup.description,
        "url": startup.websiteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": startup.logoUrl,
          "width": 200,
          "height": 200
        },
        "foundingDate": startup.foundedYear?.toString(),
        "foundingLocation": startup.headquartersCity ? {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": startup.headquartersCity,
            "addressRegion": "India",
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
          startup.twitterUrl,
          startup.websiteUrl
        ].filter(Boolean),
        "knowsAbout": [
          "Artificial Intelligence",
          "Machine Learning",
          "AI Technology",
          "India AI Ecosystem"
        ],
        "areaServed": {
          "@type": "Country",
          "name": "India"
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Create: `apps/web/components/seo/ToolSchema.tsx`
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
    category?: string;
    hasApi?: boolean;
    hasMobileApp?: boolean;
  };
}

export function ToolSchema({ tool }: ToolSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `https://aistartupimpact.com/tools/${tool.name.toLowerCase().replace(/\s+/g, '-')}#software`,
        "name": tool.name,
        "applicationCategory": "AI Tool",
        "applicationSubCategory": tool.category || "Artificial Intelligence",
        "description": tool.description,
        "url": tool.websiteUrl,
        "screenshot": tool.logoUrl,
        "operatingSystem": tool.hasMobileApp ? "Web, iOS, Android" : "Web",
        "offers": tool.startingPrice ? {
          "@type": "Offer",
          "price": tool.startingPrice,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        } : {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": tool.avgRating && tool.reviewCount ? {
          "@type": "AggregateRating",
          "ratingValue": tool.avgRating,
          "reviewCount": tool.reviewCount,
          "bestRating": 5,
          "worstRating": 1
        } : undefined,
        "featureList": tool.hasApi ? "API Access, Web Interface" : "Web Interface",
        "softwareHelp": {
          "@type": "CreativeWork",
          "url": `${tool.websiteUrl}/help`
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Create: `apps/web/components/seo/BreadcrumbSchema.tsx`
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

**Step 1.2: Integrate into Startup Page**

Update: `apps/web/app/(public)/startups/[slug]/page.tsx`

Add imports at the top:
```typescript
import { StartupSchema } from '@/components/seo/StartupSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
```

Add schemas in the component (before the main content div):
```typescript
export default async function StartupDetailPage({ params }: { params: { slug: string } }) {
  const startup = await getStartup(params.slug);
  
  if (!startup) return <NotFound />;

  return (
    <>
      {/* JSON-LD Schema Markup */}
      <StartupSchema startup={startup} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://aistartupimpact.com' },
        { name: 'Startups', url: 'https://aistartupimpact.com/startups' },
        { name: startup.name, url: `https://aistartupimpact.com/startups/${startup.slug}` }
      ]} />

      {/* Existing content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* ... rest of the page ... */}
      </div>
    </>
  );
}
```

**Step 1.3: Integrate into Tool Page**

Similar integration for `apps/web/app/(public)/tools/[slug]/page.tsx`

**Step 1.4: Validate**
- Visit: https://search.google.com/test/rich-results
- Paste your page URL
- Ensure 0 errors

---

### ✅ Task 2: Sitemap.xml (TODAY - 30 minutes)
**Priority**: CRITICAL - Google doesn't know your pages exist without this

#### Implementation:

**Step 2.1: Create Startup Sitemap**

Create: `apps/web/app/(public)/startups/sitemap.ts`
```typescript
import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const startups = await sql`
      SELECT slug, "updatedAt"
      FROM "Startup"
      WHERE "deletedAt" IS NULL
      ORDER BY "updatedAt" DESC
    `;

    return startups.map((startup: any) => ({
      url: `https://aistartupimpact.com/startups/${startup.slug}`,
      lastModified: new Date(startup.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating startup sitemap:', error);
    return [];
  }
}
```

**Step 2.2: Create Tool Sitemap**

Create: `apps/web/app/(public)/tools/sitemap.ts`
```typescript
import { MetadataRoute } from 'next';
import { sql } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const tools = await sql`
      SELECT slug, "updatedAt"
      FROM "AiTool"
      WHERE "deletedAt" IS NULL AND status = 'APPROVED'
      ORDER BY "updatedAt" DESC
    `;

    return tools.map((tool: any) => ({
      url: `https://aistartupimpact.com/tools/${tool.slug}`,
      lastModified: new Date(tool.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error generating tool sitemap:', error);
    return [];
  }
}
```

**Step 2.3: Update Root Sitemap**

Update: `apps/web/app/sitemap.ts` (if it exists, or create it)
```typescript
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://aistartupimpact.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://aistartupimpact.com/startups',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://aistartupimpact.com/tools',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://aistartupimpact.com/news',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
}
```

**Step 2.4: Submit to Google Search Console**
1. Go to: https://search.google.com/search-console
2. Add property: `aistartupimpact.com`
3. Go to Sitemaps section
4. Submit: `https://aistartupimpact.com/sitemap.xml`
5. Submit: `https://aistartupimpact.com/startups/sitemap.xml`
6. Submit: `https://aistartupimpact.com/tools/sitemap.xml`

---

### ✅ Task 3: FAQ Section + Schema (THIS WEEK - 3 hours)
**Priority**: HIGH - Gets you cited in AI Overviews (2026's biggest CTR driver)

#### The IndiaAI Differentiator:
Your biggest competitive advantage is answering: **"Is this startup eligible for India AI Mission funding?"**

No competitor has this. When founders ask AI search engines about government funding eligibility, YOUR page will be cited if you have this FAQ schema.

#### Implementation:

**Step 3.1: Create FAQ Schema Component**

Create: `apps/web/components/seo/FAQSchema.tsx`
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

**Step 3.2: Create FAQ UI Component**

Create: `apps/web/components/FAQSection.tsx`
```typescript
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
}

export function FAQSection({ faqs }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="card p-6 mt-8">
      <h2 className="section-title mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <h3 className="font-sora font-semibold text-sm text-navy dark:text-white pr-4">
                {faq.question}
              </h3>
              <ChevronDown 
                className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 pt-2">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-jakarta leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 3.3: Auto-Generate FAQs for Startups**

Add to `apps/web/app/(public)/startups/[slug]/page.tsx`:

```typescript
import { FAQSection } from '@/components/FAQSection';
import { FAQSchema } from '@/components/seo/FAQSchema';

// Add this function before the component
function generateStartupFAQs(startup: any, totalRaised: number) {
  const faqs = [];

  // Core question
  faqs.push({
    question: `What does ${startup.name} do?`,
    answer: startup.description
  });

  // IndiaAI eligibility - YOUR COMPETITIVE ADVANTAGE
  faqs.push({
    question: `Is ${startup.name} eligible for India AI Mission funding?`,
    answer: `${startup.name} is an AI startup based in ${startup.headquartersCity || 'India'} working on ${startup.tagline}. Indian AI startups in the ${startup.stage} stage may be eligible for government funding through the India AI Mission, National AI Portal, and state-level schemes. Eligibility depends on factors like incorporation status, technology focus, and alignment with national AI priorities. Visit the National AI Portal or contact your local startup cell for specific eligibility criteria.`
  });

  // Location
  if (startup.headquartersCity) {
    faqs.push({
      question: `Where is ${startup.name} located?`,
      answer: `${startup.name} is headquartered in ${startup.headquartersCity}, India.`
    });
  }

  // Founding
  if (startup.foundedYear) {
    faqs.push({
      question: `When was ${startup.name} founded?`,
      answer: `${startup.name} was founded in ${startup.foundedYear}.`
    });
  }

  // Funding
  if (totalRaised > 0) {
    faqs.push({
      question: `How much funding has ${startup.name} raised?`,
      answer: `${startup.name} has raised a total of ${formatUsd(totalRaised)} across ${startup.fundingRounds.length} funding round${startup.fundingRounds.length > 1 ? 's' : ''}.`
    });
  }

  // Founders
  if (startup.founders && startup.founders.length > 0) {
    faqs.push({
      question: `Who founded ${startup.name}?`,
      answer: `${startup.name} was founded by ${startup.founders.join(', ')}.`
    });
  }

  // Team size
  if (startup.employeeCount) {
    faqs.push({
      question: `How many employees does ${startup.name} have?`,
      answer: `${startup.name} currently has ${startup.employeeCount}+ employees.`
    });
  }

  // Hiring
  faqs.push({
    question: `Is ${startup.name} hiring?`,
    answer: `Visit ${startup.name}'s careers page or LinkedIn to check for current job openings. Many AI startups in India are actively hiring for roles in machine learning, data science, and engineering.`
  });

  return faqs;
}

// In the component, add:
export default async function StartupDetailPage({ params }: { params: { slug: string } }) {
  const startup = await getStartup(params.slug);
  if (!startup) return <NotFound />;

  const totalRaised = startup.fundingRounds.reduce((sum: number, r: any) => sum + Number(r.amountUsd || 0), 0);
  const faqs = generateStartupFAQs(startup, totalRaised);

  return (
    <>
      {/* Existing schemas */}
      <StartupSchema startup={startup} />
      <BreadcrumbSchema items={[...]} />
      
      {/* Add FAQ Schema */}
      <FAQSchema faqs={faqs} />

      <div className="max-w-5xl mx-auto...">
        {/* Existing content */}
        
        {/* Add FAQ Section before "Similar Startups" */}
        <FAQSection faqs={faqs} />
        
        {/* Similar Startups Section */}
      </div>
    </>
  );
}
```

**Step 3.4: Auto-Generate FAQs for Tools**

Similar implementation for tools with questions like:
- "What is [tool name] used for?"
- "Is [tool name] free?"
- "Does [tool name] work in India?"
- "What are the best alternatives to [tool name]?"

---

### ✅ Task 4: OG Images + Twitter Cards (THIS WEEK - 2 hours)
**Priority**: MEDIUM - Drives social sharing and click-through

#### Why This Matters:
When founders share their listing on LinkedIn/Twitter, it should show a rich card with your branding. This drives clicks back to your site.

#### Implementation:

**Step 4.1: Enhance generateMetadata()**

Update `apps/web/app/(public)/startups/[slug]/page.tsx`:

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
      'AI startup India',
      s.headquartersCity,
      s.stage,
      'artificial intelligence',
      'machine learning',
      'India AI Mission',
      'startup funding'
    ].filter(Boolean).join(', '),
    authors: s.founders?.map((name: string) => ({ name })),
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
        alt: `${s.name} - ${s.tagline}`
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
      site: '@aistartupimpact',
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

**Step 4.2: Create Dynamic OG Images (Optional - Advanced)**

If you want auto-generated branded OG images:

Create: `apps/web/app/(public)/startups/[slug]/opengraph-image.tsx`
```typescript
import { ImageResponse } from 'next/og';
import { sql } from '@/lib/db';

export const runtime = 'edge';
export const alt = 'AI Startup Profile';
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
          fontFamily: 'system-ui',
        }}
      >
        <div style={{ 
          fontSize: 72, 
          fontWeight: 'bold', 
          color: 'white', 
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          {s.name}
        </div>
        <div style={{ 
          fontSize: 36, 
          color: 'rgba(255,255,255,0.9)', 
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          {s.tagline}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {s.headquartersCity && (
            <div style={{ 
              fontSize: 24, 
              color: 'rgba(255,255,255,0.8)', 
              background: 'rgba(255,255,255,0.2)', 
              padding: '12px 24px', 
              borderRadius: '12px' 
            }}>
              📍 {s.headquartersCity}
            </div>
          )}
          {s.stage && (
            <div style={{ 
              fontSize: 24, 
              color: 'rgba(255,255,255,0.8)', 
              background: 'rgba(255,255,255,0.2)', 
              padding: '12px 24px', 
              borderRadius: '12px' 
            }}>
              {s.stage.replace('_', ' ')}
            </div>
          )}
        </div>
        <div style={{
          position: 'absolute',
          bottom: '40px',
          fontSize: 20,
          color: 'rgba(255,255,255,0.7)'
        }}>
          aistartupimpact.com
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

## ⚠️ What NOT to Do

### Google's March 2026 Core Update Warning:
**Don't add schema to pages where the content doesn't match.**

Google specifically penalized:
- FAQ schema on pages without real FAQs
- Review schema on pages without real reviews
- Organization schema with fake/misleading data

### Rule: Add schema ONLY where real content exists
- ✅ Add FAQ schema if you have real FAQ section
- ✅ Add Review schema if you have real user reviews
- ✅ Add Organization schema with accurate data from your DB
- ❌ Don't add FAQ schema without FAQ content
- ❌ Don't add fake reviews for schema
- ❌ Don't exaggerate data in schema

---

## 📊 Testing & Validation

### After Each Task:

**Schema Validation:**
1. Visit: https://search.google.com/test/rich-results
2. Enter your page URL
3. Ensure 0 errors, 0 warnings

**Meta Tag Testing:**
1. Visit: https://metatags.io/
2. Enter your page URL
3. Check OG image preview

**Sitemap Testing:**
1. Visit: `https://aistartupimpact.com/sitemap.xml`
2. Verify all URLs are present
3. Check in Google Search Console

---

## 🎯 Success Metrics (Track Weekly)

### Week 1:
- [ ] All startup pages have valid JSON-LD schema
- [ ] All tool pages have valid JSON-LD schema
- [ ] Sitemap submitted to Google Search Console
- [ ] 0 schema validation errors

### Week 2:
- [ ] FAQ sections live on all pages
- [ ] FAQ schema validated
- [ ] OG images showing correctly on social media
- [ ] First pages appearing in Google index

### Month 1:
- [ ] 50%+ of pages indexed by Google
- [ ] First AI Overview citations
- [ ] Organic traffic increase visible
- [ ] Social shares increasing

---

## 🚀 Quick Start Commands

```bash
# Create schema components
mkdir -p apps/web/components/seo
touch apps/web/components/seo/StartupSchema.tsx
touch apps/web/components/seo/ToolSchema.tsx
touch apps/web/components/seo/BreadcrumbSchema.tsx
touch apps/web/components/seo/FAQSchema.tsx

# Create FAQ component
touch apps/web/components/FAQSection.tsx

# Create sitemaps
touch apps/web/app/(public)/startups/sitemap.ts
touch apps/web/app/(public)/tools/sitemap.ts

# Test locally
npm run dev
# Visit: http://localhost:3000/startups/sarvam-ai
# View source and verify JSON-LD is present

# Deploy
git add .
git commit -m "Add JSON-LD schema, sitemaps, and FAQ sections for SEO"
git push
```

---

## 📅 Timeline

### Today (2-3 hours):
- ✅ Task 1: JSON-LD Schema
- ✅ Task 2: Sitemap.xml

### This Week (5 hours total):
- ✅ Task 3: FAQ Section + Schema
- ✅ Task 4: OG Images + Twitter Cards

### Next Week:
- Monitor Google Search Console
- Track indexing progress
- Measure organic traffic increase

---

## 💡 Pro Tips

1. **Schema First**: Don't skip this. Google's 2026 algorithm requires it for indexing.

2. **IndiaAI FAQ**: This is your competitive advantage. No other directory answers government funding eligibility questions.

3. **Test Everything**: Use Google Rich Results Test after every change.

4. **Monitor Daily**: Check Google Search Console daily for the first week to catch any issues early.

5. **Social Proof**: Encourage founders to share their listings on LinkedIn - the OG images will drive traffic back.

---

**Ready to start? Begin with Task 1 (Schema) - it's the most critical and takes 2-3 hours.**
