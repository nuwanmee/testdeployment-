import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  const session = await getServerSession(authOptions);
     
  if (!session?.user) {
    return NextResponse.json(
      { message: 'Not authenticated' },
      { status: 401 }
    );
  }

  if (session.user.role?.toUpperCase() !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Insufficient permissions' },
      { status: 403 }
    );
  }

  try {
    const profiles = await prisma.profile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          }
        },
        photos: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Convert to the expected frontend format
    const formattedProfiles = profiles.map(profile => ({
      ...profile,
      id: profile.id.toString(), // Convert Int ID to string
      userId: profile.userId.toString(),
      name: profile.user.name,
      email: profile.user.email,
      status: profile.status,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
      approvedAt: profile.approvedAt?.toISOString() || null,
      rejectedAt: profile.rejectedAt?.toISOString() || null,
      photos: profile.photos.map(photo => ({
        ...photo,
        id: String(photo.id),
      })),
    }));

    return NextResponse.json(formattedProfiles);
       
  } catch (error) {
    console.error('Failed to fetch profiles:', error);
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// export async function GET() {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user) {
//     return NextResponse.json(
//       { error: 'Not authenticated' },
//       { status: 401 }
//     );
//   }

//   if (session.user.role?.toUpperCase() !== 'ADMIN') {
//     return NextResponse.json(
//       { error: 'Insufficient permissions' },
//       { status: 403 }
//     );
//   }

//   try {
//     const profiles = await prisma.profile.findMany({
//       include: {
//         user: {
//           select: {
//             name: true,
//             email: true
//           }
//         }
//       },
//       orderBy: { createdAt: 'desc' },
//     });

//     // Convert to the expected frontend format
//     const formattedProfiles = profiles.map(profile => ({
//       id: profile.id.toString(), // Convert Int ID to string
//       name: profile.user.name,
//       email: profile.user.email,
//       status: profile.status,
//       createdAt: profile.createdAt.toISOString(),
//       updatedAt: profile.updatedAt.toISOString(),
//       approvedAt: profile.approvedAt?.toISOString() || null,
//       rejectedAt: profile.rejectedAt?.toISOString() || null
//     }));

//     return NextResponse.json(formattedProfiles);
    
//   } catch (error) {
//     console.error('Failed to fetch profiles:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user || session.user.role?.toUpperCase() !== 'ADMIN') {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     // Convert string ID to number for Prisma
//     const id = parseInt(params.id);
//     if (isNaN(id)) {
//       return NextResponse.json(
//         { error: 'Invalid profile ID' },
//         { status: 400 }
//       );
//     }

//     const { action } = await request.json();
//     const statusMap = {
//       approve: 'APPROVED',
//       reject: 'REJECTED'
//     };

//     const status = statusMap[action];
//     if (!status) {
//       return NextResponse.json(
//         { error: 'Invalid action' },
//         { status: 400 }
//       );
//     }

//     const updateData = {
//       status,
//       ...(action === 'approve' ? {
//         approvedAt: new Date(),
//         approvedBy: session.user.id,
//         rejectedAt: null,
//         rejectedBy: null
//       } : {
//         rejectedAt: new Date(),
//         rejectedBy: session.user.id,
//         approvedAt: null,
//         approvedBy: null
//       })
//     };

//     const updatedProfile = await prisma.profile.update({
//       where: { id },
//       include: {
//         user: {
//           select: {
//             name: true,
//             email: true
//           }
//         }
//       },
//       data: updateData
//     });

//     // Format the response
//     const responseData = {
//       id: updatedProfile.id.toString(), // Convert back to string
//       name: updatedProfile.user.name,
//       email: updatedProfile.user.email,
//       status: updatedProfile.status,
//       createdAt: updatedProfile.createdAt.toISOString(),
//       updatedAt: updatedProfile.updatedAt.toISOString(),
//       approvedAt: updatedProfile.approvedAt?.toISOString() || null,
//       rejectedAt: updatedProfile.rejectedAt?.toISOString() || null
//     };

//     return NextResponse.json(responseData);

//   } catch (error) {
//     console.error('Profile update error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


// // app/api/admin/profiles/route.ts
// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import type { ProfileStatus } from '@/types';

// export async function GET() {
//   const session = await getServerSession(authOptions);
  
//   // Debugging: Log the full session
//   console.log('Session data:', JSON.stringify(session, null, 2));

//   if (!session?.user) {
//     return NextResponse.json(
//       { error: 'Not authenticated' },
//       { status: 401 }
//     );
//   }

//   // Case-insensitive check
//   if (session.user.role?.toUpperCase() !== 'ADMIN') {
//     // Additional debug: Check the user in database directly
//     const dbUser = await prisma.user.findUnique({
//       where: { email: session.user.email },
//       select: { role: true }
//     });
//     console.log('Database role:', dbUser?.role);

//     return NextResponse.json(
//       { 
//         error: 'Insufficient permissions',
//         yourRole: session.user.role,
//         requiredRole: 'ADMIN'
//       },
//       { status: 403 }
//     );
//   }

//   try {
//     const profiles = await prisma.profile.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         status: true,
//         createdAt: true,
//         updatedAt: true,
//         approvedAt: true,
//         rejectedAt: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     return NextResponse.json(profiles);
    
//   } catch (error) {
//     console.error('Failed to fetch profiles:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user || session.user.role?.toUpperCase() !== 'ADMIN') {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
//     const { action } = await request.json();

//     // Type-safe action to status mapping
//     const statusMap: Record<string, ProfileStatus> = {
//       approve: 'APPROVED',
//       reject: 'REJECTED'
//     };

//     const status = statusMap[action];
//     if (!status) {
//       return NextResponse.json(
//         { error: 'Invalid action. Must be "approve" or "reject"' },
//         { status: 400 }
//       );
//     }

//     // Prepare update data
//     const updateData = {
//       status,
//       ...(action === 'approve' 
//         ? { 
//             approvedAt: new Date(),
//             approvedBy: session.user.id,
//             rejectedAt: null,
//             rejectedBy: null
//           }
//         : {
//             rejectedAt: new Date(),
//             rejectedBy: session.user.id,
//             approvedAt: null,
//             approvedBy: null
//           }
//       )
//     };

//     const updatedProfile = await prisma.profile.update({
//       where: { id },
//       data: updateData
//     });

//     // Convert Dates to strings
//     const serializedProfile = {
//       ...updatedProfile,
//       createdAt: updatedProfile.createdAt.toISOString(),
//       updatedAt: updatedProfile.updatedAt.toISOString(),
//       approvedAt: updatedProfile.approvedAt?.toISOString() || null,
//       rejectedAt: updatedProfile.rejectedAt?.toISOString() || null
//     };

//     return NextResponse.json(serializedProfile);

//   } catch (error) {
//     console.error('Profile update error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }


// // app/api/admin/profiles/route.ts
// import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import type { ProfileStatus } from '@/types';

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   console.log('API Session:', session);
    
//   try {
//     if (!session?.user) {
//       return NextResponse.json(
//         { error: 'Not authenticated' },
//         { status: 401 }
//       );
//     }

//     if (session.user.role !== 'ADMIN') {
//       return NextResponse.json(
//         { error: 'Insufficient permissions' },
//         { status: 403 }
//       );
//     }

//     const profiles = await prisma.profile.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         status: true,
//         createdAt: true,
//         updatedAt: true,
//         approvedAt: true,
//         rejectedAt: true,
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     return NextResponse.json(profiles);
    
//   } catch (error) {
//     console.error('Failed to fetch profiles:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user || session.user.role !== 'admin') {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const { id } = params;
//     const { action } = await request.json();

//     // Type-safe action to status mapping
//     const statusMap: Record<string, ProfileStatus> = {
//       approve: 'APPROVED',
//       reject: 'REJECTED'
//     };

//     const status = statusMap[action];
//     if (!status) {
//       return NextResponse.json(
//         { error: 'Invalid action. Must be "approve" or "reject"' },
//         { status: 400 }
//       );
//     }

//     // Prepare update data
//     const updateData = {
//       status,
//       ...(action === 'approve' 
//         ? { 
//             approvedAt: new Date(),
//             approvedBy: session.user.id,
//             rejectedAt: null,
//             rejectedBy: null
//           }
//         : {
//             rejectedAt: new Date(),
//             rejectedBy: session.user.id,
//             approvedAt: null,
//             approvedBy: null
//           }
//       )
//     };

//     const updatedProfile = await prisma.profile.update({
//       where: { id },
//       data: updateData
//     });

//     // Convert Dates to strings
//     const serializedProfile = {
//       ...updatedProfile,
//       createdAt: updatedProfile.createdAt.toISOString(),
//       updatedAt: updatedProfile.updatedAt.toISOString(),
//       approvedAt: updatedProfile.approvedAt?.toISOString() || null,
//       rejectedAt: updatedProfile.rejectedAt?.toISOString() || null
//     };

//     return NextResponse.json(serializedProfile);

//   } catch (error) {
//     console.error('Profile update error:', error);
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     );
//   }
// }