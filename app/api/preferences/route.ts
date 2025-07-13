// app/api/preferences/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserPreferences } from '@/types/preferences';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const preferences: UserPreferences = await request.json();

  try {
    const weightSettings = {
      weights: {
        age: preferences.ageRange.weight,
        height: preferences.heightRange.weight,
        location: preferences.locations.weight,
        religion: preferences.religion.weight,
        caste: preferences.caste.weight,
        education: preferences.education.weight
      }
    };

    const savedPreferences = await prisma.preference.upsert({
      where: { userId },
      update: {
        ageRangeMin: preferences.ageRange.min,
        ageRangeMax: preferences.ageRange.max,
        heightRangeMin: preferences.heightRange.min,
        heightRangeMax: preferences.heightRange.max,
        preferredLocation: preferences.locations.districts.join(','),
        preferredReligion: preferences.religion.value || null,
        preferredCaste: preferences.caste.value || null,
        preferredEducation: preferences.education.value || null,
        otherPreferences: JSON.stringify(weightSettings)
      },
      create: {
        userId,
        ageRangeMin: preferences.ageRange.min,
        ageRangeMax: preferences.ageRange.max,
        heightRangeMin: preferences.heightRange.min,
        heightRangeMax: preferences.heightRange.max,
        preferredLocation: preferences.locations.districts.join(','),
        preferredReligion: preferences.religion.value || null,
        preferredCaste: preferences.caste.value || null,
        preferredEducation: preferences.education.value || null,
        otherPreferences: JSON.stringify(weightSettings)
      }
    });

    return NextResponse.json(savedPreferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 }
    );
  }
}

// // app/api/preferences/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// export async function PUT(request: NextRequest) {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }
  
//   try {
//     const { userId, preferences } = await request.json();
    
//     // Verify the user is updating their own preferences
//     if (parseInt(session.user.id) !== userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
//     }
    
//     // Convert from app preferences format to DB format
//     const dbPreferences = {
//       ageRangeMin: preferences.ageRange.min,
//       ageRangeMax: preferences.ageRange.max,
//       heightRangeMin: preferences.heightRange.min,
//       heightRangeMax: preferences.heightRange.max,
//       preferredLocation: preferences.locations.districts.join(','),
//       preferredReligion: preferences.religion.value,
//       preferredCaste: preferences.caste.value,
//       preferredEducation: preferences.education.value,
//       otherPreferences: JSON.stringify({
//         weights: {
//           age: {
//             enabled: preferences.ageRange.weight.enabled,
//             weight: preferences.ageRange.weight.weight
//           },
//           height: {
//             enabled: preferences.heightRange.weight.enabled,
//             weight: preferences.heightRange.weight.weight
//           },
//           location: {
//             enabled: preferences.locations.weight.enabled,
//             weight: preferences.locations.weight.weight
//           },
//           religion: {
//             enabled: preferences.religion.weight.enabled,
//             weight: preferences.religion.weight.weight
//           },
//           caste: {
//             enabled: preferences.caste.weight.enabled,
//             weight: preferences.caste.weight.weight
//           },
//           education: {
//             enabled: preferences.education.weight.enabled,
//             weight: preferences.education.weight.weight
//           }
//         }
//       })
//     };
    
//     // Update or create preference record
//     const updatedPreferences = await prisma.preference.upsert({
//       where: { userId },
//       update: dbPreferences,
//       create: {
//         userId,
//         ...dbPreferences
//       }
//     });
    
//     return NextResponse.json({ success: true, preferences: updatedPreferences });
//   } catch (error) {
//     console.error('Error updating preferences:', error);
//     return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
//   }
// }

// // // app/api/preferences/[userId]/route.ts
// // import { NextRequest, NextResponse } from 'next/server';
// // import { prisma } from '@/lib/prisma';
// // import { getServerSession } from 'next-auth/next';
// // import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// // import { convertPreferenceFromDB } from '@/utils/preferenceConverter';

// // export async function GET(
// //   request: NextRequest,
// //   { params }: { params: { userId: string } }
// // ) {
// //   const session = await getServerSession(authOptions);
  
// //   if (!session?.user?.id) {
// //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //   }
  
// //   try {
// //     const userId = parseInt(params.userId);
    
// //     // Verify the user is fetching their own preferences
// //     if (parseInt(session.user.id) !== userId) {
// //       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
// //     }
    
// //     // Get user preferences
// //     const dbPreferences = await prisma.preference.findUnique({
// //       where: { userId }
// //     });
    
// //     if (!dbPreferences) {
// //       return NextResponse.json({ preferences: null });
// //     }
    
// //     // Convert from DB format to app format
// //     const preferences = convertPreferenceFromDB(dbPreferences);
    
// //     return NextResponse.json({ preferences });
// //   } catch (error) {
// //     console.error('Error fetching preferences:', error);
// //     return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
// //   }
// // }