import { redirect } from 'next/navigation';
import { getFounderSession } from '@/lib/founder-auth';
import { getUnifiedSession } from '@/lib/unified-auth';

export default async function SubmitStartupPage() {
  // Try unified session first
  const unifiedSession = await getUnifiedSession();
  if (unifiedSession?.founderId) {
    redirect('/founder/startups/new');
  }

  // Fallback: legacy founder session
  const session = await getFounderSession();
  if (session) {
    redirect('/founder/startups/new');
  }
  
  // Not authenticated — redirect to signup with returnTo parameter
  redirect('/auth/signup?returnTo=/founder/startups/new');
}
