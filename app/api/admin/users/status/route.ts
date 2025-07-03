import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  
  // Verify admin role
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { userId, status } = await request.json();

  try {
    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: Number(userId) },
      data: { status },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user status' },
      { status: 500 }
    );
  }
}