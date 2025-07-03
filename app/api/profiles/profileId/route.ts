import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { profileId: string } }
) {
  try {
    // First try to find by profileId
    let profile = await prisma.profile.findUnique({
      where: { profileId: params.profileId },
      include: { user: true }
    });

    // Fallback to user ID if needed
    if (!profile) {
      profile = await prisma.profile.findUnique({
        where: { userId: parseInt(params.profileId) },
        include: { user: true }
      });
    }

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}