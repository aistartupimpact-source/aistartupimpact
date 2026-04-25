import { redirect } from 'next/navigation';
import { getFounderSession } from '@/lib/founder-auth';

export default async function SubmitStartupPage() {
  const session = await getFounderSession();
  
  // If user is authenticated, redirect to startup submission form
  if (session) {
    redirect('/founder/startups/new');
  }
  
  // If not authenticated, redirect to signup with returnTo parameter
  redirect('/auth/signup?returnTo=/founder/startups/new');
}
