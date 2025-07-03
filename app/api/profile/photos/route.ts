// app/api/profile/photos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configure upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'profiles');

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  try {
    // Ensure upload directory exists
    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Process uploads
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        try {
          // Validate file
          if (!file.type.startsWith('image/')) {
            console.error(`Invalid file type: ${file.type}`);
            return null;
          }
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
            console.error(`File too large: ${file.name}`);
            return null;
          }

          // Read file buffer
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Generate unique filename
          const ext = path.extname(file.name) || '.jpg';
          const filename = `${uuidv4()}${ext}`;
          const filePath = path.join(UPLOAD_DIR, filename);

          // Save file
          await fs.writeFile(filePath, buffer);

          return {
            url: `/uploads/profiles/${filename}`,
            publicId: filename,
            isMain: false,
            isApproved: session.user.role === 'ADMIN',
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return null;
        }
      })
    );

    // Filter out failed uploads
    const successfulUploads = uploadResults.filter(Boolean);
    if (successfulUploads.length === 0) {
      return NextResponse.json(
        { error: 'All file uploads failed' },
        { status: 400 }
      );
    }

    // Check existing photos count
    const existingPhotoCount = await prisma.photo.count({
      where: { userId: parseInt(session.user.id) }
    });

    // Save to database
    const createdPhotos = await prisma.$transaction(
      successfulUploads.map((photo, index) => {
        return prisma.photo.create({
          data: {
            url: photo.url,
            publicId: photo.publicId,
            isMain: index === 0 && existingPhotoCount === 0,
            isApproved: photo.isApproved,
            user: { connect: { id: parseInt(session.user.id) } },
          },
        });
      })
    );

    return NextResponse.json({ photos: createdPhotos });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}