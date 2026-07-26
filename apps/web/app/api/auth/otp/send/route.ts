import { NextRequest, NextResponse } from "next/server";
import { createOtp } from "@/lib/otp";
import { checkRateLimit, getClientIdentifier, authRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // IP-level rate limit
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

  // Send OTP via Resend
  try {
    const { Resend } = await import("resend");
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      console.error("RESEND_API_KEY not set");
      return NextResponse.json({ success: false, error: "Email service unavailable." }, { status: 500 });
    }

    const resend = new Resend(resendKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "no-reply@aistartupimpact.com";
    const fromName = process.env.RESEND_FROM_NAME || "AI Startup Impact";

    await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: email.toLowerCase(),
      subject: `${otp} is your verification code`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <img src="https://aistartupimpact.com/logo.png" width="140" alt="AI Startup Impact" style="margin-bottom: 24px;" />
          <h2 style="color: #1a1a2e; font-size: 20px; font-weight: 600; margin-bottom: 8px;">Verify your email</h2>
          <p style="color: #6b7280; font-size: 15px; line-height: 1.5; margin-bottom: 24px;">Enter this code to continue. It expires in 10 minutes.</p>
          <div style="background: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #1a1a2e;">${otp}</span>
          </div>
          <p style="color: #9ca3af; font-size: 13px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Code sent." });
  } catch (err) {
    console.error("OTP email send error:", err);
    return NextResponse.json({ success: false, error: "Failed to send email." }, { status: 500 });
  }
}
