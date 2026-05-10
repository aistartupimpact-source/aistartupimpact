import dns from 'dns/promises';
import crypto from 'crypto';

/**
 * Generate a secure random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Generate DNS TXT record value
 */
export function generateDNSRecord(token: string): string {
  return `aistartupimpact-verify=${token}`;
}

/**
 * Extract clean domain from URL
 */
export function extractDomain(url: string): string {
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith('http') ? url : `https://${url}`;
    const parsed = new URL(urlWithProtocol);
    // Remove www. prefix
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    // Fallback for invalid URLs
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

/**
 * Verify DNS TXT record for domain ownership
 */
export async function verifyDNS(domain: string, expectedToken: string): Promise<{
  verified: boolean;
  error?: string;
}> {
  try {
    const cleanDomain = extractDomain(domain);
    const subdomain = `_aistartupimpact-verify.${cleanDomain}`;
    
    console.log(`Checking DNS TXT record for: ${subdomain}`);
    
    // Resolve TXT records
    const records = await dns.resolveTxt(subdomain);
    
    // Flatten array of arrays
    const allRecords = records.flat();
    const expectedRecord = `aistartupimpact-verify=${expectedToken}`;
    
    console.log('Found TXT records:', allRecords);
    console.log('Expected record:', expectedRecord);
    
    // Check if our verification record exists
    const verified = allRecords.some(record => 
      record.includes(expectedRecord) || record.includes(expectedToken)
    );
    
    if (verified) {
      return { verified: true };
    } else {
      return {
        verified: false,
        error: 'DNS TXT record not found. Please ensure the record is added and DNS has propagated (may take 5-10 minutes).'
      };
    }
  } catch (error: any) {
    console.error('DNS verification error:', error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        verified: false,
        error: 'DNS TXT record not found. Please add the record and wait for DNS propagation (5-10 minutes).'
      };
    }
    
    return {
      verified: false,
      error: `DNS lookup failed: ${error.message}`
    };
  }
}

/**
 * Validate domain format
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(extractDomain(domain));
}
