// app/api/totp/verify/route.ts
import { verifyToken, generateBackupCodes } from '@/lib/totp';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession();
  const { token } = await request.json();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user || !user.totpSecret) {
    return NextResponse.json({ error: 'User not found or TOTP not set up' }, { status: 404 });
  }

  const isValid = verifyToken(token, user.totpSecret);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  }

  const backupCodes = generateBackupCodes();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { 
        totpEnabled: true,
      },
    }),
    prisma.backupCode.createMany({
      data: backupCodes.map(code => ({
        code,
        used: false,
        userId: user.id
      }))
    })
  ]);

  return NextResponse.json({ 
    success: true,
    backupCodes
  });
}