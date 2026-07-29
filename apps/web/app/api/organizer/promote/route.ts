import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { getOrganizerSession } from "@/lib/organizer-auth";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

let resend: Resend | null = null;
function getResend() {
  if (!resend && process.env.RESEND_API_KEY) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
const FROM_NAME = process.env.RESEND_FROM_NAME || "AI Startup Impact";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://aistartupimpact.com";

/**
 * GET /api/organizer/promote — Get attendee stats (city + occupation breakdown)
 * LOCKED: Premium feature — returns 403 until payment is enabled.
 */
export async function GET() {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false }, { status: 401 });

  return NextResponse.json(
    { success: false, error: "Promote is a premium feature. Coming soon." },
    { status: 403 }
  );
}

/**
 * POST /api/organizer/promote — Send bulk email to filtered audience
 * LOCKED: Premium feature — returns 403 until payment is enabled.
 */
export async function POST(request: NextRequest) {
  const session = await getOrganizerSession();
  if (!session) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

  return NextResponse.json(
    { success: false, error: "Promote is a premium feature. Upgrade to Pro to send promotional emails." },
    { status: 403 }
  );
}
