import { NextResponse } from "next/server";
import { getUnifiedSession } from "@/lib/unified-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getUnifiedSession();

    if (!session) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        emailVerified: session.emailVerified,
        lastWorkspace: session.lastWorkspace,
        founderId: session.founderId,
        organizerId: session.organizerId,
        twoFactorEnabled: session.twoFactorEnabled,
        twoFactorInherited: session.twoFactorInherited,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
