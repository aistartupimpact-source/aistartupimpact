import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { neon } from '@neondatabase/serverless';

const JWT_SECRET = new TextEncoder().encode(
  process.env.FOUNDER_JWT_SECRET || 'founder-secret-change-in-production'
);

let _sql: ReturnType<typeof neon> | undefined;
function getSql() {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!);
  return _sql;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Redirect checks for startups and tools on old slugs (301)
  const isStartupPath = pathname.startsWith('/startups/');
  const isToolPath = pathname.startsWith('/tools/');

  if (isStartupPath || isToolPath) {
    const parts = pathname.split('/');
    if (parts.length === 3) {
      const slug = parts[2];
      const ignoredSlugs = ['submit', 'category', 'compare', 'alternatives', 'sitemap.xml', 'robots.txt'];
      if (slug && !ignoredSlugs.includes(slug) && !slug.includes('.')) {
        try {
          if (isStartupPath) {
            const redirectCheck = await getSql()`
              SELECT slug, (slug = ${slug}) as "isCurrent" FROM "Startup"
              WHERE (slug = ${slug} OR ${slug} = ANY("previousSlugs")) AND "deletedAt" IS NULL
              LIMIT 1
            ` as any[];
            if (redirectCheck.length > 0) {
              const row = redirectCheck[0];
              if (!row.isCurrent) {
                return NextResponse.redirect(new URL(`/startups/${row.slug}`, request.url), 301);
              }
            }
          } else {
            const redirectCheck = await getSql()`
              SELECT slug, (slug = ${slug}) as "isCurrent" FROM "AiTool"
              WHERE (slug = ${slug} OR ${slug} = ANY("previousSlugs")) AND "deletedAt" IS NULL
              LIMIT 1
            ` as any[];
            if (redirectCheck.length > 0) {
              const row = redirectCheck[0];
              if (!row.isCurrent) {
                return NextResponse.redirect(new URL(`/tools/${row.slug}`, request.url), 301);
              }
            }
          }
        } catch (error) {
          console.error('[Middleware Dynamic Redirect Check Error]', error);
        }
      }
    }
  }

  // 2. Onboarding enforcement for founders only
  if (pathname.startsWith('/founder') && !pathname.startsWith('/founder/onboarding') && !pathname.startsWith('/founder/profile')) {
    const token = request.cookies.get('founder-token')?.value;
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        if (payload.onboardingCompleted === false) {
          const onboardingUrl = new URL('/founder/onboarding', request.url);
          onboardingUrl.searchParams.set('returnTo', pathname);
          return NextResponse.redirect(onboardingUrl);
        }
      } catch {
        // Let page layouts handle auth
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/founder/:path*',
    '/startups/:slug',
    '/tools/:slug',
  ],
};

