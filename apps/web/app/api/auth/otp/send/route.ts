import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/otp";
import { checkRateLimit, getClientIdentifier, authRateLimit } from "@/lib/rate-limit";
import { otpEmailHtml } from "@aistartupimpact/utils";
import { sendEmail } from "@/lib/email/send";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(authRateLimit, identifier);
  if (!success) {
    return NextResponse.json({ success: false, error: "Too many requests. Please wait." }, { status: 429 });
  }

  const { email, purpose } = await request.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: "Valid email required." }, { status: 400 });
  }

  const validPurposes = ["signup", "login", "verify", "workspace_link"];
  const otpPurpose = validPurposes.includes(purpose) ? purpose : "signup";

  const { otp, error } = await createOtp(email, otpPurpose);
  if (!otp) {
    return NextResponse.json({ success: false, error: error || "Failed to generate code." }, { status: 429 });
  }

  const result = await sendEmail({
    to: email.toLowerCase(),
    subject: `${otp} is your verification code`,
    html: otpEmailHtml(otp),
    type: "otp",
  });

  if (!result.success) {
    return NextResponse.json({ success: false, error: "Failed to send email." }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "Code sent." });
}
