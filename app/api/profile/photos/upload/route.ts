// app/api/profile/photos/upload/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_PHOTOS = 10;

export async function POST(req: Request) {
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

    // Check if user has a profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: true
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found. Please create a profile first.' },
        { status: 404 }
      );
    }

    // Check photo limit
    if (profile.photos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos allowed` },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Check if adding these files would exceed the limit
    if (profile.photos.length + files.length > MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Cannot upload ${files.length} files. Maximum ${MAX_PHOTOS} photos allowed. You have ${profile.photos.length} photos already.` },
        { status: 400 }
      );
    }

    const uploadedPhotos = [];
    const errors = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles', userId.toString());
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating upload directory:', error);
    }

    for (const file of files) {
      try {
        // Validate file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          errors.push(`${file.name}: Invalid file type. Only JPEG, PNG, and WebP allowed.`);
          continue;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name}: File too large. Maximum size is 5MB.`);
          continue;
        }

        // Generate unique filename
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = join(uploadsDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        // Create database record
        const isFirstPhoto = profile.photos.length === 0 && uploadedPhotos.length === 0;
        const photoUrl = `/uploads/profiles/${userId}/${fileName}`;

        const photo = await prisma.photo.create({
          data: {
            profileId: profile.id,
            url: photoUrl,
            isMain: isFirstPhoto, // First photo becomes main photo
            isApproved: false, // Photos need approval by default
            originalName: file.name,
            fileSize: file.size,
            mimeType: file.type
          }
        });

        uploadedPhotos.push({
          id: photo.id,
          url: photo.url,
          isMain: photo.isMain,
          isApproved: photo.isApproved,
          originalName: photo.originalName
        });

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push(`${file.name}: Failed to upload - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // If no photos were uploaded successfully
    if (uploadedPhotos.length === 0) {
      return NextResponse.json(
        { 
          error: 'No photos uploaded successfully',
          details: errors
        },
        { status: 400 }
      );
    }

    // Return success response with any errors
    const response: any = {
      success: true,
      photos: uploadedPhotos,
      message: `${uploadedPhotos.length} photo(s) uploaded successfully`
    };

    if (errors.length > 0) {
      response.warnings = errors;
      response.message += `. ${errors.length} file(s) failed to upload.`;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}



// // app/api/profile/photos/upload/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/auth';
// import { prisma } from '@/lib/prisma';
// import fs from 'fs/promises';
// import path from 'path';
// import { v4 as uuidv4 } from 'uuid';

// const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'profiles');

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { error: 'Unauthorized - Please log in' },
//       { status: 401 }
//     );
//   }

//   try {
//     // Ensure upload directory exists
//     await fs.mkdir(UPLOAD_DIR, { recursive: true });

//     const formData = await req.formData();
//     const files = formData.getAll('files');

//     if (!files || files.length === 0) {
//       return NextResponse.json(
//         { error: 'No files provided' },
//         { status: 400 }
//       );
//     }

//     // First find the user's profile
//     const profile = await prisma.profile.findUnique({
//       where: { userId: parseInt(session.user.id) }
//     });

//     if (!profile) {
//       return NextResponse.json(
//         { error: 'Profile not found' },
//         { status: 404 }
//       );
//     }

//     // Count existing photos for this profile
//     const existingPhotoCount = await prisma.photo.count({
//       where: { profileId: profile.id }
//     });

//     // Process uploads
//     const uploadResults = await Promise.all(
//       files.map(async (file) => {
//         if (!(file instanceof Blob)) {
//           return { error: 'Invalid file format' };
//         }

//         try {
//           // Convert to File for type checking
//           const uploadFile = file as unknown as File;
          
//           // Validate file
//           if (!uploadFile.type.startsWith('image/')) {
//             return { error: `Invalid file type: ${uploadFile.name}` };
//           }

//           if (uploadFile.size > 5 * 1024 * 1024) {
//             return { error: `File too large: ${uploadFile.name}` };
//           }

//           // Read file buffer
//           const bytes = await uploadFile.arrayBuffer();
//           const buffer = Buffer.from(bytes);

//           // Generate unique filename
//           const ext = path.extname(uploadFile.name) || '.jpg';
//           const filename = `${uuidv4()}${ext}`;
//           const filePath = path.join(UPLOAD_DIR, filename);

//           // Save file
//           await fs.writeFile(filePath, buffer);

//           return {
//             url: `/uploads/profiles/${filename}`,
//             publicId: filename,
//             isMain: false,
//             isApproved: session.user.role === 'ADMIN',
//           };
//         } catch (error) {
//           console.error('Error processing file:', error);
//           return { error: 'Failed to process file' };
//         }
//       })
//     );

//     // Check for errors
//     const errors = uploadResults.filter(result => result?.error);
//     if (errors.length > 0) {
//       return NextResponse.json(
//         { 
//           error: 'Some files failed to upload',
//           details: errors.map(e => e.error) 
//         },
//         { status: 400 }
//       );
//     }

//     const successfulUploads = uploadResults.filter(
//       (result): result is Exclude<typeof result, { error: any }> => !result?.error
//     );

//     // Save to database using profileId
//     const createdPhotos = await prisma.$transaction(
//       successfulUploads.map((photo, index) => {
//         return prisma.photo.create({
//           data: {
//             url: photo.url,
//             publicId: photo.publicId,
//             isMain: index === 0 && existingPhotoCount === 0, // First uploaded photo becomes main if no existing photos
//             isApproved: photo.isApproved,
//             profile: { connect: { id: profile.id } }, // Connect to profile instead of user
//           },
//           select: {
//             id: true,
//             url: true,
//             isMain: true,
//             isApproved: true
//           }
//         });
//       })
//     );

//     return NextResponse.json({ photos: createdPhotos });
//   } catch (error: any) {
//     console.error('Server error:', error);
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         details: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }