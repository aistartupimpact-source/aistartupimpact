import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/analytics';

// Simple in-memory rate limiting (for development)
// In production, use Redis-based rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Clean every minute

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    // Rate limiting: 100 requests per minute per IP
    if (!rateLimit(ip, 100, 60000)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' }, 
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { pathname } = body;
    
    // Validate pathname
    if (!pathname || typeof pathname !== 'string') {
      return NextResponse.json(
        { error: 'Pathname required and must be a string' }, 
        { status: 400 }
      );
    }
    
    // Validate pathname format (prevent XSS and injection)
    if (pathname.length > 500) {
      return NextResponse.json(
        { error: 'Pathname too long (max 500 characters)' }, 
        { status: 400 }
      );
    }
    
    // Basic pathname validation (must start with /)
    if (!pathname.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid pathname format' }, 
        { status: 400 }
      );
    }
    
    // Sanitize pathname (remove any potential XSS)
    const sanitizedPathname = pathname
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
    
    // Track the page view
    await trackPageView(sanitizedPathname);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track API error:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'Tracking failed' }, 
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
