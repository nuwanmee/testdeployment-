// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'
import {prisma} from '@/lib/prisma';

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

    const rawData = await req.json();
    console.log('Received profile data:', rawData);

    // VALIDATION: Check required fields
    if (!rawData.sex || !rawData.birthday || !rawData.district) {
      const missingFields = [];
      if (!rawData.sex) missingFields.push('sex');
      if (!rawData.birthday) missingFields.push('birthday');
      if (!rawData.district) missingFields.push('district');
      
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          details: `Required fields missing: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // VALIDATION: Check birthday format and convert to Date
    let birthdayDate: Date | null = null;
    if (rawData.birthday) {
      birthdayDate = new Date(rawData.birthday);
      if (isNaN(birthdayDate.getTime())) {
        return NextResponse.json(
          { 
            error: 'Invalid birthday format', 
            details: 'Birthday must be a valid date' 
          },
          { status: 400 }
        );
      }
      
      // Check if birthday is not in the future
      if (birthdayDate > new Date()) {
        return NextResponse.json(
          { 
            error: 'Invalid birthday', 
            details: 'Birthday cannot be in the future' 
          },
          { status: 400 }
        );
      }
    }

    // VALIDATION: Height validation
    let heightValue: number | null = null;
    if (rawData.height) {
      heightValue = parseFloat(rawData.height);
      if (isNaN(heightValue) || heightValue < 50 || heightValue > 300) {
        return NextResponse.json(
          { 
            error: 'Invalid height', 
            details: 'Height must be between 50 and 300 cm' 
          },
          { status: 400 }
        );
      }
    }

    // Validate and transform incoming data
    const profileData = {
      familyDetails: rawData.familyDetails || null,
      hobbies: rawData.hobbies || null,
      expectations: rawData.expectations || null,
      education: rawData.education || null,
      occupation: rawData.occupation || null,
      religion: rawData.religion || null,
      caste: rawData.caste || null,
      height: heightValue,
      maritalStatus: rawData.maritalStatus || null,
      motherTongue: rawData.motherTongue || null,
      annualIncome: rawData.annualIncome || null,
      aboutMe: rawData.aboutMe || null,
      sex: rawData.sex,
      birthday: birthdayDate,
      district: rawData.district
    };

    console.log('Processed profile data:', profileData);

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        photos: {
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        }
      }
    });

    let profile;
    if (existingProfile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId },
        data: profileData,
        include: {
          photos: {
            orderBy: [
              { isMain: 'desc' },
              { createdAt: 'asc' }
            ]
          }
        }
      });
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId,
          ...profileData
        },
        include: {
          photos: {
            orderBy: [
              { isMain: 'desc' },
              { createdAt: 'asc' }
            ]
          }
        }
      });
    }

    // Mark user profile as complete
    await prisma.user.update({
      where: { id: userId },
      data: { isProfileComplete: true }
    });

    console.log('Profile saved successfully:', profile.id);

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile saved successfully'
    });

  } catch (error) {
    console.error('Profile save error:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Handle Prisma-specific errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      
      switch (prismaError.code) {
        case 'P2002':
          return NextResponse.json(
            { 
              error: 'Profile already exists',
              details: 'A profile for this user already exists'
            },
            { status: 409 }
          );
        case 'P2025':
          return NextResponse.json(
            { 
              error: 'User not found',
              details: 'The user account was not found'
            },
            { status: 404 }
          );
        default:
          console.error('Prisma error code:', prismaError.code);
          console.error('Prisma error message:', prismaError.message);
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to save profile',
        details: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  // For updating existing profiles
  return POST(req);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
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

    // Get URL parameters for viewing other profiles
    const url = new URL(req.url);
    const viewProfileId = url.searchParams.get('profileId');
    const targetUserId = viewProfileId ? parseInt(viewProfileId) : userId;
    const isViewingOwnProfile = targetUserId === userId;

    let photoVisibilityWhere = {};
    
    if (!isViewingOwnProfile) {
      // Check if current user has approved proposal with target user
      const approvedProposal = await prisma.proposal.findFirst({
        where: {
          OR: [
            {
              senderId: userId,
              receiverId: targetUserId,
              status: 'ACCEPTED'
            },
            {
              senderId: targetUserId,
              receiverId: userId,
              status: 'ACCEPTED'
            }
          ]
        }
      });

      // If no approved proposal, only show approved photos
      if (!approvedProposal) {
        photoVisibilityWhere = {
          isApproved: true
        };
      }
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: targetUserId },
      include: {
        photos: {
          where: photoVisibilityWhere,
          orderBy: [
            { isMain: 'desc' },
            { createdAt: 'asc' }
          ]
        },
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...profile,
      isOwnProfile: isViewingOwnProfile
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


// // app/api/profile/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]/route';
// import {prisma} from '@/lib/prisma';

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { error: 'Unauthorized - No session found' }, 
//       { status: 401 }
//     );
//   }

//   try {
//     const userId = parseInt(session.user.id);
//     if (isNaN(userId)) {
//       return NextResponse.json(
//         { error: 'Invalid user ID format' },
//         { status: 400 }
//       );
//     }

//     const rawData = await req.json();
//     console.log('Received profile data:', rawData);

//     // VALIDATION: Check required fields
//     if (!rawData.sex || !rawData.birthday || !rawData.district) {
//       const missingFields = [];
//       if (!rawData.sex) missingFields.push('sex');
//       if (!rawData.birthday) missingFields.push('birthday');
//       if (!rawData.district) missingFields.push('district');
      
//       return NextResponse.json(
//         { 
//           error: 'Missing required fields', 
//           details: `Required fields missing: ${missingFields.join(', ')}` 
//         },
//         { status: 400 }
//       );
//     }

//     // VALIDATION: Check birthday format and convert to Date
//     let birthdayDate: Date | null = null;
//     if (rawData.birthday) {
//       birthdayDate = new Date(rawData.birthday);
//       if (isNaN(birthdayDate.getTime())) {
//         return NextResponse.json(
//           { 
//             error: 'Invalid birthday format', 
//             details: 'Birthday must be a valid date' 
//           },
//           { status: 400 }
//         );
//       }
      
//       // Check if birthday is not in the future
//       if (birthdayDate > new Date()) {
//         return NextResponse.json(
//           { 
//             error: 'Invalid birthday', 
//             details: 'Birthday cannot be in the future' 
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // VALIDATION: Height validation
//     let heightValue: number | null = null;
//     if (rawData.height) {
//       heightValue = parseFloat(rawData.height);
//       if (isNaN(heightValue) || heightValue < 50 || heightValue > 300) {
//         return NextResponse.json(
//           { 
//             error: 'Invalid height', 
//             details: 'Height must be between 50 and 300 cm' 
//           },
//           { status: 400 }
//         );
//       }
//     }

//     // Validate and transform incoming data
//     const profileData = {
//       familyDetails: rawData.familyDetails || null,
//       hobbies: rawData.hobbies || null, // Keep as string
//       expectations: rawData.expectations || null,
//       education: rawData.education || null,
//       occupation: rawData.occupation || null,
//       religion: rawData.religion || null,
//       caste: rawData.caste || null,
//       height: heightValue,
//       maritalStatus: rawData.maritalStatus || null,
//       motherTongue: rawData.motherTongue || null,
//       annualIncome: rawData.annualIncome || null,
//       aboutMe: rawData.aboutMe || null,
//       sex: rawData.sex,
//       birthday: birthdayDate,
//       district: rawData.district
//     };

//     console.log('Processed profile data:', profileData);

//     // Check if profile already exists
//     const existingProfile = await prisma.profile.findUnique({
//       where: { userId }
//     });

//     let profile;
//     if (existingProfile) {
//       // Update existing profile
//       profile = await prisma.profile.update({
//         where: { userId },
//         data: profileData,
//         include: {
//           photos: true
//         }
//       });
//     } else {
//       // Create new profile
//       profile = await prisma.profile.create({
//         data: {
//           userId,
//           ...profileData
//         },
//         include: {
//           photos: true
//         }
//       });
//     }

//     // Mark user profile as complete
//     await prisma.user.update({
//       where: { id: userId },
//       data: { isProfileComplete: true }
//     });

//     console.log('Profile saved successfully:', profile.id);

//     return NextResponse.json({
//       success: true,
//       profile,
//       message: 'Profile saved successfully'
//     });

//   } catch (error) {
//     console.error('Profile save error:', error);
    
//     // More detailed error logging
//     if (error instanceof Error) {
//       console.error('Error message:', error.message);
//       console.error('Error stack:', error.stack);
//     }

//     // Handle Prisma-specific errors
//     if (error && typeof error === 'object' && 'code' in error) {
//       const prismaError = error as any;
      
//       switch (prismaError.code) {
//         case 'P2002':
//           return NextResponse.json(
//             { 
//               error: 'Profile already exists',
//               details: 'A profile for this user already exists'
//             },
//             { status: 409 }
//           );
//         case 'P2025':
//           return NextResponse.json(
//             { 
//               error: 'User not found',
//               details: 'The user account was not found'
//             },
//             { status: 404 }
//           );
//         default:
//           console.error('Prisma error code:', prismaError.code);
//           console.error('Prisma error message:', prismaError.message);
//       }
//     }
    
//     return NextResponse.json(
//       { 
//         error: 'Failed to save profile',
//         details: error instanceof Error ? error.message : 'Unknown database error'
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: Request) {
//   // For updating existing profiles
//   return POST(req); // Reuse the same logic
// }

// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { error: 'Unauthorized' }, 
//       { status: 401 }
//     );
//   }

//   try {
//     const userId = parseInt(session.user.id);
//     if (isNaN(userId)) {
//       return NextResponse.json(
//         { error: 'Invalid user ID format' },
//         { status: 400 }
//       );
//     }

//     const profile = await prisma.profile.findUnique({
//       where: { userId },
//       include: {
//         photos: true
//       }
//     });

//     if (!profile) {
//       return NextResponse.json(
//         { error: 'Profile not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(profile);

//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     return NextResponse.json(
//       { 
//         error: 'Failed to fetch profile',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

// // app/api/profile/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]/route';
// import {prisma} from '@/lib/prisma';

// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { error: 'Unauthorized - No session found' }, 
//       { status: 401 }
//     );
//   }

//   try {
//     const userId = parseInt(session.user.id);
//     if (isNaN(userId)) {
//       return NextResponse.json(
//         { error: 'Invalid user ID format' },
//         { status: 400 }
//       );
//     }

//     const rawData = await req.json();
//     console.log('Received profile data:', rawData);

//     // Validate and transform incoming data
//     const profileData = {
//       familyDetails: rawData.familyDetails || null,
//       hobbies: rawData.hobbies || null,
//       expectations: rawData.expectations || null,
//       education: rawData.education || null,
//       occupation: rawData.occupation || null,
//       religion: rawData.religion || null,
//       caste: rawData.caste || null,
//       height: rawData.height ? parseFloat(rawData.height) : null,
//       maritalStatus: rawData.maritalStatus || null,
//       motherTongue: rawData.motherTongue || null,
//       annualIncome: rawData.annualIncome || null,
//       aboutMe: rawData.aboutMe || null,
//       sex: rawData.sex || null,
//       birthday: rawData.birthday ? new Date(rawData.birthday) : null,
//       district: rawData.district || null
//     };

//     // Upsert profile data
//     const profile = await prisma.profile.upsert({
//       where: { userId },
//       update: profileData,
//       create: {
//         userId,
//         ...profileData
//       },
//     });

//     // Mark user profile as complete
//     await prisma.user.update({
//       where: { id: userId },
//       data: { isProfileComplete: true }
//     });

//     return NextResponse.json({
//       success: true,
//       profile,
//       message: 'Profile saved successfully'
//     });

//   } catch (error) {
//     console.error('Profile save error:', error);
    
//     return NextResponse.json(
//       { 
//         error: 'Failed to save profile',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function GET() {
//   const session = await getServerSession(authOptions);

//   if (!session?.user?.id) {
//     return NextResponse.json(
//       { error: 'Unauthorized' }, 
//       { status: 401 }
//     );
//   }

//   try {
//     const userId = parseInt(session.user.id);
//     const profile = await prisma.profile.findUnique({
//       where: { userId },
//       include: {
//         photos: true
//       }
//     });

//     if (!profile) {
//       return NextResponse.json(
//         { error: 'Profile not found' },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(profile);

//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch profile' },
//       { status: 500 }
//     );
//   }
// }



// // app/api/profile/route.ts
// import { NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '../auth/[...nextauth]/route';
// import {prisma} from '@/lib/prisma';

// /*************  ✨ Windsurf Command ⭐  *************/
// /**
//  * Handles the POST request to upsert a user profile.
//  *
//  * This function first verifies the user's session and authorization. If the user ID
//  * is valid, it attempts to upsert the user's profile in the database using the
//  * provided data. If the profile upsert is successful, the user's profile completion
//  * status is updated. Returns a JSON response with the upserted profile on success,
//  * or an error message if the operation fails.
//  *
//  * @param {Request} req - The HTTP request object containing the JSON payload for the profile.
//  * @returns {Promise<NextResponse>} A promise that resolves to a JSON response with the
//  *    upserted profile data or an error message.
//  */

// /*******  75d85501-2cc5-4911-952c-16f10208c9b6  *******/
// export async function POST(req: Request) {
//   const session = await getServerSession(authOptions);
  
//   console.log('Session data:', session); // Log session info
  
//   if (!session?.user?.id) {
//     console.error('Unauthorized - No session user ID');
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const data = await req.json();
//     console.log('Incoming data:', data); // Log received data
    
//     const userId = parseInt(session.user.id);
//     if (isNaN(userId)) {
//       console.error('Invalid user ID:', session.user.id);
//       return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
//     }

//     console.log('Attempting to upsert profile for user:', userId);
    
//     const profile = await prisma.profile.upsert({
//       where: { userId },
//       update: data,
//       create: {
//         userId,
//         ...data
//       }
//     });

//     console.log('Profile upsert successful:', profile);
    
//     await prisma.user.update({
//       where: { id: userId },
//       data: { isProfileComplete: true }
//     });

//     return NextResponse.json(profile);
//   } catch (error) {
//     console.error('Detailed error:', error);
//     return NextResponse.json(
//       { 
//         error: 'Failed to save profile',
//         details: error instanceof Error ? error.message : String(error)
//       },
//       { status: 500 }
//     );
//   }
// }

// // // app/api/profile/route.ts
// // import { getServerSession } from 'next-auth/next';
// // import { authOptions } from '../auth/[...nextauth]/route';
// // import { prisma } from '@/lib/prisma';
// // import { NextResponse } from 'next/server';

// // export async function POST(req: Request) {
// //   const session = await getServerSession(authOptions);
  
// //   if (!session?.user?.id) {
// //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //   }

// //   const data = await req.json();
// //   const userId = parseInt(session.user.id);

// //   try {
// //     // Upsert profile - create if doesn't exist, update if it does
// //     const profile = await prisma.profile.upsert({
// //       where: { userId },
// //       update: data,
// //       create: {
// //         userId,
// //         ...data
// //       }
// //     });

// //     // Mark user as having completed their profile
// //     await prisma.user.update({
// //       where: { id: userId },
// //       data: { isProfileComplete: true }
// //     });

// //     return NextResponse.json(profile);
// //   } catch (error) {
// //     console.error('Error saving profile:', error);
// //     return NextResponse.json(
// //       { error: 'Failed to save profile' },
// //       { status: 500 }
// //     );
// //   }
// // }