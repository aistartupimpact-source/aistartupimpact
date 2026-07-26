import { NextResponse } from "next/server";
import { destroyOrganizerSession } from "@/lib/organizer-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await destroyOrganizerSession();
  return NextResponse.json({ success: true });
}
