import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

function isAllowedUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' ||
        hostname === '0.0.0.0' || hostname.endsWith('.local') || hostname.endsWith('.internal') ||
        /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const parsedUrl = isAllowedUrl(url);
    if (!parsedUrl) return NextResponse.json({ error: 'Invalid or disallowed URL' }, { status: 400 });

    const response = await fetch(parsedUrl.href, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIStartupImpactBot/1.0)' },
      redirect: 'error',
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch the URL' }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const logo = $('meta[property="og:image"]').attr('content') || $('link[rel="icon"]').attr('href') || $('link[rel="shortcut icon"]').attr('href') || '';

    let finalLogo = logo;
    if (logo && !logo.startsWith('http')) {
      const urlObj = parsedUrl;
      finalLogo = `${urlObj.protocol}//${urlObj.host}${logo.startsWith('/') ? '' : '/'}${logo}`;
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      logo: finalLogo
    });
  } catch (error) {
    console.error('OG Fetch Auto-fill error:', error);
    return NextResponse.json({ error: 'Failed to extract metadata' }, { status: 500 });
  }
}
