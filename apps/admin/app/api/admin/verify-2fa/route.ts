import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@aistartupimpact/database";
import { verifyTOTPToken, decryptSecret, verifyBackupCode } from "@/lib/two-factor";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { token, backupCode } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorEnabled: true, twoFactorSecret: true, twoFactorBackupCodes: true },
    });

    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ success: false, error: "2FA not enabled" }, { status: 400 });
    }

    if (backupCode) {
      const idx = await verifyBackupCode(backupCode, user.twoFactorBackupCodes);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Invalid backup code" }, { status: 400 });
      }
      const updatedCodes = [...user.twoFactorBackupCodes];
      updatedCodes.splice(idx, 1);
      await prisma.user.update({
        where: { id: session.user.id },
        data: { twoFactorBackupCodes: updatedCodes },
      });
      return NextResponse.json({ success: true, remainingBackupCodes: updatedCodes.length });
    }

    if (!token || token.length !== 6) {
      return NextResponse.json({ success: false, error: "Enter a 6-digit code" }, { status: 400 });
    }

    const secret = decryptSecret(user.twoFactorSecret);
    if (!verifyTOTPToken(token, secret)) {
      return NextResponse.json({ success: false, error: "Invalid verification code" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA verify error:", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
