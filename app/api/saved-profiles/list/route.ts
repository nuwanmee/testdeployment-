// app/api/saved-profiles/list/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db';

// GET: Get all saved profiles for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await prisma.savedProfile.count({
      where: { userId },
    });

    // Get saved profiles with full profile data
    const savedProfiles = await prisma.savedProfile.findMany({
      where: { userId },
      include: {
        profile: {
          include: {
            photos: true,
            user: {
              select: {
                id: true,
                email: true,
                profileId: true,
                phone: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json({
      profiles: savedProfiles,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error('Error getting saved profiles:', error);
    return NextResponse.json({ error: 'Failed to get saved profiles' }, { status: 500 });
  }
}