// app/api/saved-profiles/check/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db';

// GET: Check if a profile is saved
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ isSaved: false });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Check if profile is saved
    const savedProfile = await prisma.savedProfile.findUnique({
      where: {
        userId_profileId: {
          userId,
          profileId: parseInt(profileId),
        },
      },
    });

    return NextResponse.json({ isSaved: !!savedProfile });
  } catch (error) {
    console.error('Error checking saved profile:', error);
    return NextResponse.json({ isSaved: false });
  }
}