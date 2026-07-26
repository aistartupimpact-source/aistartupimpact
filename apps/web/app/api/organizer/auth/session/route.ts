import { NextResponse } from "next/server";
import { getOrganizerSession } from "@/lib/organizer-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getOrganizerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({ authenticated: true, organizer: session });
}
