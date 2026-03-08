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
  date: string; // ISO 8601 string or any parsable date
  updatedAt?: string;
  url: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
  publisherName?: string;
  publisherLogoUrl?: string;
}

/**
 * Generates JSON-LD schema for Articles and News.
 * This ensures that standard search engines (Google) and LLM crawlers
 * can perfectly parse and understand the content.
 */
export function generateArticleSchema(data: ArticleData) {
  const publishedDate = new Date(data.date).toISOString();
  const modifiedDate = data.updatedAt ? new Date(data.updatedAt).toISOString() : publishedDate;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": data.url
    },
    "headline": data.title,
    "description": data.excerpt,
    "image": data.imageUrl ? [data.imageUrl] : [],
    "datePublished": publishedDate,
    "dateModified": modifiedDate,
    "author": {
      "@type": "Person",
      "name": data.author.name,
      "url": data.author.url || `https://aistartupimpact.com/author/${data.author.slug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": data.publisherName || "AIStartupImpact",
      "logo": {
        "@type": "ImageObject",
        "url": data.publisherLogoUrl || "https://aistartupimpact.com/og-default.png"
      }
    },
    "keywords": data.tags ? data.tags.join(', ') : "",
    "articleSection": data.category || "Technology"
  };
}
