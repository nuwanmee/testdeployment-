// app/api/totp/setup/route.ts
import { generateSecret, generateQRCode } from '@/lib/totp';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!user.totpSecret || !user.totpEnabled) {
    const secret = generateSecret();
    const qrCode = await generateQRCode(secret.otpauth_url);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        totpSecret: secret.base32,
        totpEnabled: false,
      },
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      otpauthUrl: secret.otpauth_url
    });
  }

  return NextResponse.json({ error: 'TOTP already enabled' }, { status: 400 });
}