import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const receiverId = searchParams.get('receiverId');

  if (!receiverId) {
    return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
  }

  try {
    const proposal = await prisma.proposal.findFirst({
      where: {
        OR: [
          { senderId: parseInt(session.user.id), receiverId: parseInt(receiverId) },
          { senderId: parseInt(receiverId), receiverId: parseInt(session.user.id) },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    });

    return NextResponse.json({ status: proposal?.status || null });
  } catch (error) {
    console.error('Error checking proposal status:', error);
    return NextResponse.json({ error: 'Failed to check proposal status' }, { status: 500 });
  }
}