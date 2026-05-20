/**
 * Tool JSON-LD Schema Component
 * Generates structured data with @graph containing WebPage, SoftwareApplication, and BreadcrumbList
 * Issue #1 Fixed: Single @graph with entity linking
 * Issue #2 Fixed: aggregateRating only when reviews truly exist (not 0)
 * Issue #6 Fixed: WebPage schema added for entity relationship
 */

interface ToolSchemaProps {
  tool: {
    name: string;
    slug: string;
    tagline: string;
    description: string;
    websiteUrl: string;
    logoUrl?: string;
    pricingModel: string;
    startingPrice?: number;
    avgRating?: number | null;  // Can be null
    reviewCount?: number;
    category?: string;
    categoryName?: string;
    hasApi?: boolean;
    hasMobileApp?: boolean;
  };
}

export function ToolSchema({ tool }: ToolSchemaProps) {
  const pageUrl = `https://aistartupimpact.com/tools/${tool.slug}`;
  const softwareId = `${pageUrl}#software`;
  
  // CRITICAL: Only add rating if BOTH exist AND rating is not 0
  const hasRealReviews = tool.avgRating && tool.avgRating > 0 && tool.reviewCount && tool.reviewCount > 0;
  
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      // WebPage
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        "url": pageUrl,
        "name": `${tool.name} - ${tool.tagline}`,
        "isPartOf": {
          "@id": "https://aistartupimpact.com/#website"
        },
        "about": {
          "@id": softwareId
        },
        "primaryImageOfPage": tool.logoUrl ? {
          "@id": `${pageUrl}#primaryimage`
        } : undefined,
        "breadcrumb": {
          "@id": `${pageUrl}#breadcrumb`
        },
        "inLanguage": "en-IN"
      },
      // SoftwareApplication
      {
        "@type": "SoftwareApplication",
        "@id": softwareId,
        "name": tool.name,
        "applicationCategory": "AI Tool",
        "applicationSubCategory": tool.categoryName || tool.category || "Artificial Intelligence",
        "description": tool.description,
        "url": tool.websiteUrl,
        "screenshot": tool.logoUrl ? {
          "@type": "ImageObject",
          "@id": `${pageUrl}#primaryimage`,
          "url": tool.logoUrl,
          "caption": `${tool.name} interface`
        } : undefined,
        "operatingSystem": tool.hasMobileApp ? "Web, iOS, Android" : "Web",
        "offers": tool.startingPrice ? {
          "@type": "Offer",
          "price": (tool.startingPrice / 8300).toFixed(2),
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        } : {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        // ONLY add if real reviews exist
        "aggregateRating": hasRealReviews ? {
          "@type": "AggregateRating",
          "ratingValue": tool.avgRating,
          "reviewCount": tool.reviewCount,
          "bestRating": 5,
          "worstRating": 1
        } : undefined,
        "featureList": tool.hasApi ? "API Access, Web Interface" : "Web Interface"
      },
      // BreadcrumbList
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://aistartupimpact.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "AI Tools",
            "item": "https://aistartupimpact.com/tools"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": tool.name,
            "item": pageUrl
          }
        ]
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
