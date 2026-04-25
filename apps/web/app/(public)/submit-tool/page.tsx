import { redirect } from 'next/navigation';
import { getFounderSession } from '@/lib/founder-auth';

export default async function SubmitToolPage() {
  const session = await getFounderSession();
  
  // If user is authenticated, redirect to tool submission form
  if (session) {
    redirect('/founder/tools/new');
  }
  
  // If not authenticated, redirect to signup with returnTo parameter
  redirect('/auth/signup?returnTo=/founder/tools/new');
}
