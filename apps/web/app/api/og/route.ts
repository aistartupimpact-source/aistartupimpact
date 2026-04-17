import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

    const response = await fetch(normalizedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIStartupImpactBot/1.0)' },
      // timeout handling just in case
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
      const urlObj = new URL(normalizedUrl);
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
