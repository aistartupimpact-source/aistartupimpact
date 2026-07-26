import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { checkRateLimit, getClientIdentifier, authRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(authRateLimit, identifier);
  if (!success) {
    return NextResponse.json({ success: false, error: "Too many requests." }, { status: 429 });
  }

  const { email, code, purpose } = await request.json();
  if (!email || !code) {
    return NextResponse.json({ success: false, error: "Email and code required." }, { status: 400 });
  }

  // Sanitize code: digits only, exactly 6
  const cleanCode = code.replace(/\D/g, "");
  if (cleanCode.length !== 6) {
    return NextResponse.json({ success: false, error: "Code must be 6 digits." }, { status: 400 });
  }

  const result = await verifyOtp(email, cleanCode, purpose || "signup");

  if (!result.valid) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, verified: true });
}
