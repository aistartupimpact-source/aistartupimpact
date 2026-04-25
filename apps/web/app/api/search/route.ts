import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = `%${query.trim()}%`;

    // Search across articles (news & stories), tools, and startups
    const [articles, tools, startups] = await Promise.all([
      // Search articles
      sql`
        SELECT 
          id,
          title,
          slug,
          excerpt,
          type,
          (SELECT name FROM "Category" WHERE id = "Article"."categoryId") as category
        FROM "Article"
        WHERE 
          status = 'PUBLISHED'
          AND (
            title ILIKE ${searchTerm}
            OR excerpt ILIKE ${searchTerm}
            OR content ILIKE ${searchTerm}
          )
        ORDER BY "publishedAt" DESC
        LIMIT 5
      `,
      
      // Search tools
      sql`
        SELECT 
          id,
          name as title,
          slug,
          tagline as excerpt,
          "logoUrl",
          (SELECT name FROM "Category" WHERE id = "AiTool"."categoryId") as category
        FROM "AiTool"
        WHERE 
          status = 'APPROVED'
          AND (
            name ILIKE ${searchTerm}
            OR tagline ILIKE ${searchTerm}
            OR description ILIKE ${searchTerm}
          )
        ORDER BY "createdAt" DESC
        LIMIT 5
      `,
      
      // Search startups
      sql`
        SELECT 
          id,
          name as title,
          slug,
          tagline as excerpt,
          "logoUrl",
          (SELECT name FROM "Category" WHERE id = "Startup"."categoryId") as category
        FROM "Startup"
        WHERE 
          status = 'APPROVED'
          AND (
            name ILIKE ${searchTerm}
            OR tagline ILIKE ${searchTerm}
            OR description ILIKE ${searchTerm}
          )
        ORDER BY "createdAt" DESC
        LIMIT 5
      `
    ]);

    // Format results
    const results = [
      ...articles.map((a: any) => ({
        id: a.id,
        type: a.type.toLowerCase(),
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        category: a.category,
      })),
      ...tools.map((t: any) => ({
        id: t.id,
        type: 'tool',
        title: t.title,
        slug: t.slug,
        excerpt: t.excerpt,
        category: t.category,
        logoUrl: t.logoUrl,
      })),
      ...startups.map((s: any) => ({
        id: s.id,
        type: 'startup',
        title: s.title,
        slug: s.slug,
        excerpt: s.excerpt,
        category: s.category,
        logoUrl: s.logoUrl,
      })),
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ results: [], error: 'Search failed' }, { status: 500 });
  }
}
