import { NextResponse } from 'next/server';
import { getEmployerSession } from '@/lib/employer-auth';

export async function GET() {
  try {
    const session = await getEmployerSession();
    if (!session) {
      return NextResponse.json({ authenticated: false });
    }
    return NextResponse.json({
      authenticated: true,
      employer: {
        id: session.id,
        companyName: session.companyName,
        slug: session.slug,
        email: session.email,
        plan: session.plan,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
