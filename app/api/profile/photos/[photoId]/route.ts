// app/api/profile/photos/[photoId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  req: Request,
  { params }: { params: { photoId: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized - No session found' }, 
      { status: 401 }
    );
  }

  try {
    const userId = parseInt(session.user.id);
    const photoId = parseInt(params.photoId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    if (isNaN(photoId)) {
      return NextResponse.json(
        { error: 'Invalid photo ID format' },
        { status: 400 }
      );
    }

    // Get user's profile and verify photo ownership
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

    const photo = profile.photos.find(p => p.id === photoId);
    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found or does not belong to you' },
        { status: 404 }
      );
    }

    const wasMainPhoto = photo.isMain;

    // Delete photo from database first
    await prisma.photo.delete({
      where: { id: photoId }
    });

    // Try to delete physical file (don't fail if this doesn't work)
    try {
      const filePath = join(process.cwd(), 'public', photo.url);
      await unlink(filePath);
    } catch (fileError) {
      console.warn('Could not delete physical file:', fileError);
      // Continue execution - database record is deleted
    }

    // If deleted photo was main photo, set another photo as main
    if (wasMainPhoto) {
      const remainingPhotos = await prisma.photo.findMany({
        where: { profileId: profile.id },
        orderBy: { createdAt: 'asc' }
      });

      if (remainingPhotos.length > 0) {
        await prisma.photo.update({
          where: { id: remainingPhotos[0].id },
          data: { isMain: true }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting photo:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete photo',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}