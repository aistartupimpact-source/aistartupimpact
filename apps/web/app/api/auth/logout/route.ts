import { NextResponse } from "next/server";
import { destroyUnifiedSession } from "@/lib/unified-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  await destroyUnifiedSession();
  return NextResponse.json({ success: true });
}
