// app/api/auth/login/route.ts
import { verifyToken } from '@/lib/totp';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const { email, password, totpToken } = await request.json();

  // 1. First verify email/password (your existing logic)
  const user = await prisma.user.findUnique({
    where: { email },
    include: { backupCodes: true }
  });

  // 2. If TOTP is enabled, verify the token or backup code
  if (user?.totpEnabled) {
    if (!totpToken) {
      return NextResponse.json(
        { error: 'TOTP token required', requiresTOTP: true },
        { status: 400 }
      );
    }

    // Check if it's a valid backup code
    const backupCode = user.backupCodes.find(
      code => code.code === totpToken && !code.used
    );

    if (backupCode) {
      // Mark the backup code as used
      await prisma.backupCode.update({
        where: { id: backupCode.id },
        data: { used: true }
      });
    } 
    // Check if it's a valid TOTP code
    else if (!verifyToken(totpToken, user.totpSecret)) {
      return NextResponse.json(
        { error: 'Invalid authentication code', requiresTOTP: true },
        { status: 400 }
      );
    }
  }

  // 3. Proceed with login if all checks pass
  // ... your existing login logic
}