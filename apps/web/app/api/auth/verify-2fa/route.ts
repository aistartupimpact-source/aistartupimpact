import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@aistartupimpact/database";
import { createUnifiedSession } from "@/lib/unified-auth";
import { verifyTOTPToken, decryptSecret, verifyBackupCode } from "@/lib/two-factor";
import { checkRateLimit, getClientIdentifier, authRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const { success } = await checkRateLimit(authRateLimit, identifier);
  if (!success) return NextResponse.json({ success: false, error: "Too many attempts." }, { status: 429 });

  const { userId, token, isBackupCode } = await request.json();
  if (!userId || !token) {
    return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
  }

  const user = await prisma.unifiedUser.findUnique({ where: { id: userId } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
  }

  let isValid = false;

  if (isBackupCode) {
    const backupCodes = user.twoFactorBackupCodes || [];
    if (backupCodes.length === 0) {
      return NextResponse.json({ success: false, error: "No backup codes available." }, { status: 400 });
    }
    const codeIndex = await verifyBackupCode(token, backupCodes);
    if (codeIndex >= 0) {
      isValid = true;
      const updatedCodes = [...backupCodes];
      updatedCodes.splice(codeIndex, 1);
      await prisma.unifiedUser.update({
        where: { id: userId },
        data: { twoFactorBackupCodes: updatedCodes },
      });
    }
  } else {
    const secret = decryptSecret(user.twoFactorSecret);
    isValid = verifyTOTPToken(token, secret);
  }

  if (!isValid) {
    return NextResponse.json({ success: false, error: "Invalid verification code." }, { status: 401 });
  }

  await createUnifiedSession(user.id, "direct_2fa");

  return NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
