// app/api/admin/profiles/[id]/approve/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  
  // Authentication check
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Await the params Promise in Next.js 15
    const resolvedParams = await params;
    
    // Validate profile ID
    if (!resolvedParams.id || isNaN(Number(resolvedParams.id))) {
      return NextResponse.json(
        { message: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Update profile in database
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(resolvedParams.id) },
      data: {
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: session.user.email || 'Admin',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        photos: true,
      },
    });

    // Return transformed response
    return NextResponse.json({
      ...updatedProfile,
      id: String(updatedProfile.id),
      userId: String(updatedProfile.userId),
      photos: updatedProfile.photos.map(photo => ({
        ...photo,
        id: String(photo.id),
      })),
    });

  } catch (error) {
    console.error('Error approving profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}



// // app/api/admin/profiles/[id]/approve/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const session = await getServerSession(authOptions);
  
//   // Authentication check
//   if (!session || session.user.role !== 'ADMIN') {
//     return NextResponse.json(
//       { message: 'Unauthorized' },
//       { status: 401 }
//     );
//   }

//   try {
//     // Validate profile ID
//     if (!params.id || isNaN(Number(params.id))) {
//       return NextResponse.json(
//         { message: 'Invalid profile ID' },
//         { status: 400 }
//       );
//     }

//     // Update profile in database
//     const updatedProfile = await prisma.profile.update({
//       where: { id: Number(params.id) },
//       data: {
//         status: 'approved',
//         approvedAt: new Date(),
//         approvedBy: session.user.email || 'Admin',
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             profilePicture: true,
//           },
//         },
//         photos: true,
//       },
//     });

//     // Return transformed response
//     return NextResponse.json({
//       ...updatedProfile,
//       id: String(updatedProfile.id),
//       userId: String(updatedProfile.userId),
//       photos: updatedProfile.photos.map(photo => ({
//         ...photo,
//         id: String(photo.id),
//       })),
//     });

//   } catch (error) {
//     console.error('Error approving profile:', error);
//     return NextResponse.json(
//       { message: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// // Add OPTIONS handler for CORS preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, {
//     headers: {
//       'Access-Control-Allow-Origin': '*',
//       'Access-Control-Allow-Methods': 'PUT, OPTIONS',
//       'Access-Control-Allow-Headers': 'Content-Type, Authorization',
//     },
//   });
// }