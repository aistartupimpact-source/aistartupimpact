import { NextRequest, NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api-auth";
import { prisma } from "@aistartupimpact/database";
import {
  generateTOTPSecret, generateQRCode, verifyTOTPToken,
  encryptSecret, decryptSecret, generateBackupCodes, hashBackupCodes,
} from "@/lib/two-factor";

export async function POST(request: NextRequest) {
  try {
    const { session, error } = await requireApiAuth(["SUPER_ADMIN", "EDITOR_IN_CHIEF", "SENIOR_WRITER", "WRITER", "AD_MANAGER", "CONTRIBUTOR", "EVENT_ORGANIZER"]);
    if (error) return error;

    const { action, token } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, twoFactorEnabled: true, twoFactorSecret: true },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (action === "generate") {
      const { secret, otpauthUrl } = generateTOTPSecret(user.email);
      const qrCode = await generateQRCode(otpauthUrl);
      const encrypted = encryptSecret(secret);

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorSecret: encrypted },
      });

      return NextResponse.json({ success: true, qrCode, secret });
    }

    if (action === "verify") {
      if (!token || token.length !== 6) {
        return NextResponse.json({ success: false, error: "Enter a 6-digit code" }, { status: 400 });
      }
      if (!user.twoFactorSecret) {
        return NextResponse.json({ success: false, error: "No 2FA setup in progress" }, { status: 400 });
      }

      const secret = decryptSecret(user.twoFactorSecret);
      if (!verifyTOTPToken(token, secret)) {
        return NextResponse.json({ success: false, error: "Invalid code. Check your authenticator app and try again." }, { status: 400 });
      }

      const backupCodes = generateBackupCodes(10);
      const hashed = await hashBackupCodes(backupCodes);

      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true, twoFactorBackupCodes: hashed },
      });

      return NextResponse.json({ success: true, backupCodes });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json({ success: false, error: "Failed to setup 2FA" }, { status: 500 });
  }
}
