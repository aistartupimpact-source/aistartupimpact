// app/api/consent-log/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { sql } from '@/lib/db';
import { ConsentLogPayload } from '@/types/consent';

const IP_HASH_SALT = process.env.IP_HASH_SALT || 'default-salt-change-in-production';

function hashIp(ip: string): string {
  return createHash('sha256')
    .update(ip + IP_HASH_SALT)
    .digest('hex');
}

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const payload: ConsentLogPayload = await request.json();

    // Validate payload
    if (!payload.consentId || !payload.timestamp || !payload.categories) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // Get and hash IP
    const clientIp = getClientIp(request);
    const ipHash = clientIp ? hashIp(clientIp) : null;

    // Log to database
    await sql`
      INSERT INTO consent_logs 
      (consent_id, timestamp, categories, method, policy_version, schema_version, ip_hash, user_agent, country)
      VALUES (${payload.consentId}, ${payload.timestamp}, ${JSON.stringify(payload.categories)}, ${payload.method}, ${payload.policyVersion}, ${payload.schemaVersion}, ${ipHash}, ${payload.userAgent || null}, ${payload.country || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log consent:', error);
    return NextResponse.json(
      { error: 'Failed to log consent' },
      { status: 500 }
    );
  }
}
