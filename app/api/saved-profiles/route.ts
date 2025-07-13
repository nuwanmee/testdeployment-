import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/db';

// POST: Save a profile
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // ✅ Verify the profile exists first
    const profileExists = await prisma.profile.findUnique({
      where: { id: profileId },
    });
    if (!profileExists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.savedProfile.findUnique({
      where: {
        userId_profileId: {
          userId,
          profileId,
        },
      },
    });

    if (existingSave) {
      return NextResponse.json({ error: 'Profile already saved' }, { status: 409 });
    }

    // Save the profile
    const savedProfile = await prisma.savedProfile.create({
      data: {
        userId,
        profileId,
      },
    });

    return NextResponse.json(savedProfile);
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

// DELETE: Unsave a profile (similar validation added)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { profileId } = await request.json();

    if (!profileId) {
      return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
    }

    // Delete the saved profile
    await prisma.savedProfile.delete({
      where: {
        userId_profileId: {
          userId,
          profileId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsaving profile:', error);
    return NextResponse.json({ error: 'Failed to unsave profile' }, { status: 500 });
  }
}



// // app/api/saved-profiles/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import prisma from '@/lib/db';

// // POST: Save a profile
// export async function POST(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const userId = parseInt(session.user.id);
//     const { profileId } = await request.json();

//     if (!profileId) {
//       return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
//     }

//     // Check if already saved
//     const existingSave = await prisma.savedProfile.findUnique({
//       where: {
//         userId_profileId: {
//           userId,
//           profileId: parseInt(profileId.toString()),
//         },
//       },
//     });

//     if (existingSave) {
//       return NextResponse.json({ error: 'Profile already saved' }, { status: 409 });
//     }

//     // Save the profile
//     const savedProfile = await prisma.savedProfile.create({
//       data: {
//         userId,
//         profileId: parseInt(profileId.toString()),
//       },
//     });

//     return NextResponse.json(savedProfile);
//   } catch (error) {
//     console.error('Error saving profile:', error);
//     return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
//   }
// }

// // DELETE: Unsave a profile
// export async function DELETE(request: Request) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const userId = parseInt(session.user.id);
//     const { profileId } = await request.json();

//     if (!profileId) {
//       return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
//     }

//     // Delete the saved profile
//     await prisma.savedProfile.delete({
//       where: {
//         userId_profileId: {
//           userId,
//           profileId: parseInt(profileId.toString()),
//         },
//       },
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Error unsaving profile:', error);
//     return NextResponse.json({ error: 'Failed to unsave profile' }, { status: 500 });
//   }
// }