import { redirect } from 'next/navigation';
import { getFounderSession } from '@/lib/founder-auth';
import { getUnifiedSession } from '@/lib/unified-auth';

export default async function SubmitToolPage() {
  // Try unified session first
  const unifiedSession = await getUnifiedSession();
  if (unifiedSession?.founderId) {
    redirect('/founder/tools/new');
  }

  // Fallback: legacy founder session
  const session = await getFounderSession();
  if (session) {
    redirect('/founder/tools/new');
  }
  
  // Not authenticated — redirect to signup with returnTo parameter
  redirect('/auth/signup?returnTo=/founder/tools/new');
}
