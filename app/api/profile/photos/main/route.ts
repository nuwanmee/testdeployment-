// app/api/profile/photos/main/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized - No session found' }, 
      { status: 401 }
    );
  }

  try {
    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    const { photoId } = await req.json();

    if (!photoId || isNaN(parseInt(photoId))) {
      return NextResponse.json(
        { error: 'Valid photo ID is required' },
        { status: 400 }
      );
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Check if the photo belongs to the user
    const photo = profile.photos.find(p => p.id === parseInt(photoId));
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found or does not belong to you' },
        { status: 404 }
      );
    }

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Remove main status from all photos
      await tx.photo.updateMany({
        where: { profileId: profile.id },
        data: { isMain: false }
      });

      // Set the selected photo as main
      await tx.photo.update({
        where: { id: parseInt(photoId) },
        data: { isMain: true }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Main photo updated successfully'
    });

  } catch (error) {
    console.error('Error setting main photo:', error);
    return NextResponse.json(
      { 
        error: 'Failed to set main photo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}