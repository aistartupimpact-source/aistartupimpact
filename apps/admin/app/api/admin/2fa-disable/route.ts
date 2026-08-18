import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@aistartupimpact/database";
import { verifyTOTPToken, decryptSecret } from "@/lib/two-factor";

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireApiAuth(["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER", "AD_MANAGER", "CONTRIBUTOR", "EVENT_ORGANIZER"]);
    if (error) return error;

    const { token } = await request.json();
    if (!token || token.length !== 6) {
      return NextResponse.json({ success: false, error: "Enter your current 6-digit code to disable 2FA" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true },
    });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: "2FA is not enabled" }, { status: 400 });
    }

    const secret = decryptSecret(user.twoFactorSecret);
    if (!verifyTOTPToken(token, secret)) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json({ success: false, error: "Failed to disable 2FA" }, { status: 500 });
  }
}
