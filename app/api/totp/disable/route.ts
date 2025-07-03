// app/api/totp/disable/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession();
  const { password } = await request.json();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  include: { backupCodes: true }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Verify password first if needed
  // ...

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { 
        totpEnabled: false,
        totpSecret: null
      },
    }),
    prisma.backupCode.deleteMany({
      where: { 
        userId: user.id
      }
    })
  ]);

  return NextResponse.json({ success: true });
}