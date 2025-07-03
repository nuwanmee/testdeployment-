// app/api/admin/profiles/[id]/refuse/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await the params to avoid dynamic route warnings
    const { id } = params;
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate profile ID
    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { message: 'Invalid profile ID' },
        { status: 400 }
      );
    }

    // Update profile in database
    const updatedProfile = await prisma.profile.update({
      where: { id: Number(id) },
      data: {
        status: 'refused',
        rejectedAt: new Date(),
        // Remove rejectedBy if it doesn't exist in your schema
        // rejectedBy: session.user.email || 'Admin',
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
    console.error('Error refusing profile:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
// // pages/api/admin/profiles/[id]/refuse.ts
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { prisma } from '@/lib/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'PUT') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const session = await getServerSession(req, res, authOptions);
//   if (!session || session.user.role !== 'ADMIN') {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   const { id } = req.query;

//   try {
//     const updatedProfile = await prisma.profile.update({
//       where: { id: Number(id) },
//       data: {
//         status: 'refused',
//         rejectedAt: new Date(),
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

//     // You might want to send a notification email here

//     res.status(200).json({
//       ...updatedProfile,
//       id: String(updatedProfile.id),
//       userId: String(updatedProfile.userId),
//     });
//   } catch (error) {
//     console.error('Error refusing profile:', error);
//     res.status(500).json({ message: 'Error refusing profile' });
//   }
// }