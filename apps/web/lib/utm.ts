export function appendUtmParams(
  url: string,
  campaign: 'ai_tools_directory' | 'ai_startups_directory',
  slug?: string,
): string {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('utm_source')) {
      parsed.searchParams.set('utm_source', 'udyaibase');
    }
    if (!parsed.searchParams.has('utm_medium')) {
      parsed.searchParams.set('utm_medium', 'referral');
    }
    if (!parsed.searchParams.has('utm_campaign')) {
      parsed.searchParams.set('utm_campaign', campaign);
    }
    if (slug && !parsed.searchParams.has('utm_content')) {
      parsed.searchParams.set('utm_content', slug);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
