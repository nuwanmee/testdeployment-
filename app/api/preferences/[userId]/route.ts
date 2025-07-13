
// app/api/preferences/[userId]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth/next'
import { userPreferencesSchema } from '@/types/preferences'

export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ userId: string }> }
) {
  // Await the params
  const resolvedParams = await params
  
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id || session.user.id !== resolvedParams.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const preferences = body.preferences

    // Validate against schema
    const validation = userPreferencesSchema.safeParse(preferences)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid preferences data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const validatedData = validation.data

    const updated = await prisma.preference.upsert({
      where: { userId: parseInt(resolvedParams.userId) },
      update: {
        // Age
        ageMin: validatedData.ageRange.min,
        ageMax: validatedData.ageRange.max,
        ageWeight: validatedData.ageRange.weight.weight,
        ageEnabled: validatedData.ageRange.weight.enabled,
        
        // Height
        heightMin: validatedData.heightRange.min,
        heightMax: validatedData.heightRange.max,
        heightWeight: validatedData.heightRange.weight.weight,
        heightEnabled: validatedData.heightRange.weight.enabled,
        
        // Locations - convert array to JSON string
        locations: JSON.stringify(validatedData.locations.districts),
        locationsWeight: validatedData.locations.weight.weight,
        locationsEnabled: validatedData.locations.weight.enabled,
        
        // Religion
        religion: validatedData.religion.value,
        religionWeight: validatedData.religion.weight.weight,
        religionEnabled: validatedData.religion.weight.enabled,
        
        // Caste
        caste: validatedData.caste.value,
        casteWeight: validatedData.caste.weight.weight,
        casteEnabled: validatedData.caste.weight.enabled,
        
        // Education
        education: validatedData.education.value,
        educationWeight: validatedData.education.weight.weight,
        educationEnabled: validatedData.education.weight.enabled,
      },
      create: {
        userId: parseInt(resolvedParams.userId),
        // Age
        ageMin: validatedData.ageRange.min,
        ageMax: validatedData.ageRange.max,
        ageWeight: validatedData.ageRange.weight.weight,
        ageEnabled: validatedData.ageRange.weight.enabled,
        
        // Height
        heightMin: validatedData.heightRange.min,
        heightMax: validatedData.heightRange.max,
        heightWeight: validatedData.heightRange.weight.weight,
        heightEnabled: validatedData.heightRange.weight.enabled,
        
        // Locations - convert array to JSON string
        locations: JSON.stringify(validatedData.locations.districts),
        locationsWeight: validatedData.locations.weight.weight,
        locationsEnabled: validatedData.locations.weight.enabled,
        
        // Religion
        religion: validatedData.religion.value,
        religionWeight: validatedData.religion.weight.weight,
        religionEnabled: validatedData.religion.weight.enabled,
        
        // Caste
        caste: validatedData.caste.value,
        casteWeight: validatedData.caste.weight.weight,
        casteEnabled: validatedData.caste.weight.enabled,
        
        // Education
        education: validatedData.education.value,
        educationWeight: validatedData.education.weight.weight,
        educationEnabled: validatedData.education.weight.enabled,
      }
    })

    return NextResponse.json({ success: true, preferences: updated })

  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


// // app/api/preferences/[userId]/route.ts
// import { NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'
// import { authOptions } from '@/lib/auth'
// import { getServerSession } from 'next-auth/next'
// import { userPreferencesSchema } from '@/types/preferences'

// export async function PUT(request: Request, { params }: { params: { userId: string } }) {
//   const session = await getServerSession(authOptions)
  
//   if (!session?.user?.id || session.user.id !== params.userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   try {
//     const body = await request.json()
//     const preferences = body.preferences

//     // Validate against schema
//     const validation = userPreferencesSchema.safeParse(preferences)
//     if (!validation.success) {
//       return NextResponse.json(
//         { error: 'Invalid preferences data', details: validation.error.flatten() },
//         { status: 400 }
//       )
//     }

//     const validatedData = validation.data

//     const updated = await prisma.preference.upsert({
//       where: { userId: parseInt(params.userId) },
//       update: {
//         // Age
//         ageMin: validatedData.ageRange.min,
//         ageMax: validatedData.ageRange.max,
//         ageWeight: validatedData.ageRange.weight.weight,
//         ageEnabled: validatedData.ageRange.weight.enabled,
        
//         // Height
//         heightMin: validatedData.heightRange.min,
//         heightMax: validatedData.heightRange.max,
//         heightWeight: validatedData.heightRange.weight.weight,
//         heightEnabled: validatedData.heightRange.weight.enabled,
        
//         // Locations - convert array to JSON string
//         locations: JSON.stringify(validatedData.locations.districts),
//         locationsWeight: validatedData.locations.weight.weight,
//         locationsEnabled: validatedData.locations.weight.enabled,
        
//         // Religion
//         religion: validatedData.religion.value,
//         religionWeight: validatedData.religion.weight.weight,
//         religionEnabled: validatedData.religion.weight.enabled,
        
//         // Caste
//         caste: validatedData.caste.value,
//         casteWeight: validatedData.caste.weight.weight,
//         casteEnabled: validatedData.caste.weight.enabled,
        
//         // Education
//         education: validatedData.education.value,
//         educationWeight: validatedData.education.weight.weight,
//         educationEnabled: validatedData.education.weight.enabled,
//       },
//       create: {
//         userId: parseInt(params.userId),
//         // Age
//         ageMin: validatedData.ageRange.min,
//         ageMax: validatedData.ageRange.max,
//         ageWeight: validatedData.ageRange.weight.weight,
//         ageEnabled: validatedData.ageRange.weight.enabled,
        
//         // Height
//         heightMin: validatedData.heightRange.min,
//         heightMax: validatedData.heightRange.max,
//         heightWeight: validatedData.heightRange.weight.weight,
//         heightEnabled: validatedData.heightRange.weight.enabled,
        
//         // Locations - convert array to JSON string
//         locations: JSON.stringify(validatedData.locations.districts),
//         locationsWeight: validatedData.locations.weight.weight,
//         locationsEnabled: validatedData.locations.weight.enabled,
        
//         // Religion
//         religion: validatedData.religion.value,
//         religionWeight: validatedData.religion.weight.weight,
//         religionEnabled: validatedData.religion.weight.enabled,
        
//         // Caste
//         caste: validatedData.caste.value,
//         casteWeight: validatedData.caste.weight.weight,
//         casteEnabled: validatedData.caste.weight.enabled,
        
//         // Education
//         education: validatedData.education.value,
//         educationWeight: validatedData.education.weight.weight,
//         educationEnabled: validatedData.education.weight.enabled,
//       }
//     })

//     return NextResponse.json({ success: true, preferences: updated })

//   } catch (error) {
//     console.error('Error saving preferences:', error)
//     return NextResponse.json(
//       { 
//         error: 'Failed to save preferences',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     )
//   }
// }


// // app/api/preferences/[userId]/route.ts
// import { NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import { getServerSession } from 'next-auth/next'
// import { userPreferencesSchema } from '@/types/preferences'

// export async function PUT(request: Request, { params }: { params: { userId: string } }) {
//   const session = await getServerSession(authOptions)
  
//   // Verify session and permissions
//   if (!session?.user?.id || session.user.id !== params.userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
//   }

//   try {
//     const body = await request.json()
//     const preferences = body.preferences

//     // Simple validation
//     if (!preferences) {
//       return NextResponse.json({ error: 'Preferences data is required' }, { status: 400 })
//     }

//     // Remove transaction if causing issues - use direct upsert
//     const updated = await prisma.preference.upsert({
//       where: { userId: parseInt(params.userId) },
//       update: {
//         ageMin: preferences.ageRange.min,
//         ageMax: preferences.ageRange.max,
//         ageWeight: preferences.ageRange.weight.weight,
//         ageEnabled: preferences.ageRange.weight.enabled,
//         // Include all other fields...
//       },
//       create: {
//         userId: parseInt(params.userId),
//         ageMin: preferences.ageRange.min,
//         ageMax: preferences.ageRange.max,
//         ageWeight: preferences.ageRange.weight.weight,
//         ageEnabled: preferences.ageRange.weight.enabled,
//         // Include all other fields...
//       }
//     })

//     return NextResponse.json({ success: true, preferences: updated })

//   } catch (error) {
//     console.error('Error saving preferences:', error)
//     return NextResponse.json(
//       { 
//         error: 'Failed to save preferences',
//         details: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     )
//   }
// }

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { getServerSession } from 'next-auth/next';
// import { UserPreferences } from '@/types/preferences';

// export async function GET(request: Request, { params }: { params: { userId: string } }) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id || session.user.id !== params.userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const dbPreference = await prisma.preference.findUnique({
//     where: { userId: parseInt(params.userId) }
//   });

//   if (!dbPreference) {
//     return NextResponse.json({ preferences: null });
//   }

//   const preferences: UserPreferences = {
//     ageRange: {
//       min: dbPreference.ageMin || 18,
//       max: dbPreference.ageMax || 50,
//       weight: {
//         weight: dbPreference.ageWeight || 70,
//         enabled: dbPreference.ageEnabled ?? true
//       }
//     },
//     heightRange: {
//       min: dbPreference.heightMin || 150,
//       max: dbPreference.heightMax || 190,
//       weight: {
//         weight: dbPreference.heightWeight || 50,
//         enabled: dbPreference.heightEnabled ?? true
//       }
//     },
//     locations: {
//       districts: dbPreference.locations ? JSON.parse(dbPreference.locations) : [],
//       weight: {
//         weight: dbPreference.locationsWeight || 80,
//         enabled: dbPreference.locationsEnabled ?? true
//       }
//     },
//     religion: {
//       value: dbPreference.religion || null,
//       weight: {
//         weight: dbPreference.religionWeight || 60,
//         enabled: dbPreference.religionEnabled ?? false
//       }
//     },
//     caste: {
//       value: dbPreference.caste || null,
//       weight: {
//         weight: dbPreference.casteWeight || 40,
//         enabled: dbPreference.casteEnabled ?? false
//       }
//     },
//     education: {
//       value: dbPreference.education || null,
//       weight: {
//         weight: dbPreference.educationWeight || 50,
//         enabled: dbPreference.educationEnabled ?? false
//       }
//     }
//   };

//   return NextResponse.json({ preferences });
// }

// export async function PUT(request: Request, { params }: { params: { userId: string } }) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id || session.user.id !== params.userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const { preferences }: { preferences: UserPreferences } = await request.json();

//   const updated = await prisma.preference.upsert({
//     where: { userId: parseInt(params.userId) },
//     update: {
//       ageMin: preferences.ageRange.min,
//       ageMax: preferences.ageRange.max,
//       ageWeight: preferences.ageRange.weight.weight,
//       ageEnabled: preferences.ageRange.weight.enabled,
//       heightMin: preferences.heightRange.min,
//       heightMax: preferences.heightRange.max,
//       heightWeight: preferences.heightRange.weight.weight,
//       heightEnabled: preferences.heightRange.weight.enabled,
//       locations: JSON.stringify(preferences.locations.districts),
//       locationsWeight: preferences.locations.weight.weight,
//       locationsEnabled: preferences.locations.weight.enabled,
//       religion: preferences.religion.value,
//       religionWeight: preferences.religion.weight.weight,
//       religionEnabled: preferences.religion.weight.enabled,
//       caste: preferences.caste.value,
//       casteWeight: preferences.caste.weight.weight,
//       casteEnabled: preferences.caste.weight.enabled,
//       education: preferences.education.value,
//       educationWeight: preferences.education.weight.weight,
//       educationEnabled: preferences.education.weight.enabled
//     },
//     create: {
//       userId: parseInt(params.userId),
//       ageMin: preferences.ageRange.min,
//       ageMax: preferences.ageRange.max,
//       ageWeight: preferences.ageRange.weight.weight,
//       ageEnabled: preferences.ageRange.weight.enabled,
//       heightMin: preferences.heightRange.min,
//       heightMax: preferences.heightRange.max,
//       heightWeight: preferences.heightRange.weight.weight,
//       heightEnabled: preferences.heightRange.weight.enabled,
//       locations: JSON.stringify(preferences.locations.districts),
//       locationsWeight: preferences.locations.weight.weight,
//       locationsEnabled: preferences.locations.weight.enabled,
//       religion: preferences.religion.value,
//       religionWeight: preferences.religion.weight.weight,
//       religionEnabled: preferences.religion.weight.enabled,
//       caste: preferences.caste.value,
//       casteWeight: preferences.caste.weight.weight,
//       casteEnabled: preferences.caste.weight.enabled,
//       education: preferences.education.value,
//       educationWeight: preferences.education.weight.weight,
//       educationEnabled: preferences.education.weight.enabled
//     }
//   });

//   return NextResponse.json({ preferences: updated });
// }


// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { getServerSession } from 'next-auth/next';

// export async function GET(request: Request, { params }: { params: { userId: string } }) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id || session.user.id !== params.userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const preferences = await prisma.preference.findUnique({
//     where: { userId: parseInt(params.userId) }
//   });

//   return NextResponse.json({ preferences });
// }

// export async function PUT(request: Request, { params }: { params: { userId: string } }) {
//   const session = await getServerSession(authOptions);
//   if (!session?.user?.id || session.user.id !== params.userId) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   const body = await request.json();
//   const { preferences } = body;

//   const updated = await prisma.preference.upsert({
//     where: { userId: parseInt(params.userId) },
//     update: {
//       ageMin: preferences.ageRange.min,
//       ageMax: preferences.ageRange.max,
//       ageWeight: preferences.ageRange.weight.weight,
//       ageEnabled: preferences.ageRange.weight.enabled,
//       heightMin: preferences.heightRange.min,
//       heightMax: preferences.heightRange.max,
//       heightWeight: preferences.heightRange.weight.weight,
//       heightEnabled: preferences.heightRange.weight.enabled,
//       locations: JSON.stringify(preferences.locations.districts),
//       locationsWeight: preferences.locations.weight.weight,
//       locationsEnabled: preferences.locations.weight.enabled,
//       religion: preferences.religion.value,
//       religionWeight: preferences.religion.weight.weight,
//       religionEnabled: preferences.religion.weight.enabled,
//       caste: preferences.caste.value,
//       casteWeight: preferences.caste.weight.weight,
//       casteEnabled: preferences.caste.weight.enabled,
//       education: preferences.education.value,
//       educationWeight: preferences.education.weight.weight,
//       educationEnabled: preferences.education.weight.enabled
//     },
//     create: {
//       userId: parseInt(params.userId),
//       // ... same fields as update
//     }
//   });

//   return NextResponse.json({ preferences: updated });
// }



// // api/preferences/[userId]/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { convertPreferenceFromDB } from '@/utils/PreferenceConverter';

// export async function GET(
//   request: Request,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const userId = parseInt(params.userId);
    
//     // Check authorization
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id || parseInt(session.user.id) !== userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
    
//     const preference = await prisma.preference.findUnique({
//       where: { userId }
//     });
    
//     return NextResponse.json({ preferences: preference });
//   } catch (error) {
//     console.error('Error getting preferences:', error);
//     return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 });
//   }
// }

// export async function PUT(
//   request: Request,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const userId = parseInt(params.userId);
    
//     // Check authorization
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.id || parseInt(session.user.id) !== userId) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }
    
//     const { preferences } = await request.json();
    
//     // Convert app format to DB format
//     const dbPreferences = convertPreferenceFromDB(preferences);
    
//     // Update or create preferences
//     const updatedPreference = await prisma.preference.upsert({
//       where: { userId },
//       update: dbPreferences,
//       create: {
//         userId,
//         ...dbPreferences
//       }
//     });
    
//     console.log('Preferences updated successfully:', updatedPreference); // Add logging
    
//     return NextResponse.json({ success: true, preferences: updatedPreference });
//   } catch (error) {
//     console.error('Error updating preferences:', error);
//     return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
//   }
// }

// import { NextRequest, NextResponse } from 'next/server';
// import { UserPreferences } from '@/types/preferences';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// function mapPreferencesToDbModel(preferences: UserPreferences) {
//   return {
//     ageRangeMin: preferences.ageRange.min,
//     ageRangeMax: preferences.ageRange.max,
//     heightRangeMin: preferences.heightRange.min,
//     heightRangeMax: preferences.heightRange.max,
//     preferredLocation: preferences.locations.districts.join(','), // Join districts with comma
//     preferredReligion: preferences.religion.value,
//     preferredCaste: preferences.caste.value,
//     preferredEducation: preferences.education.value,
//     // Store weight preferences as JSON string in otherPreferences
//     otherPreferences: JSON.stringify({
//       weights: {
//         ageRange: preferences.ageRange.weight,
//         heightRange: preferences.heightRange.weight,
//         locations: preferences.locations.weight,
//         religion: preferences.religion.weight,
//         caste: preferences.caste.weight,
//         education: preferences.education.weight
//       }
//     })
//   };
// }

// export async function PUT(
//   request: NextRequest,
//   { params }: { params: { userId: string } }
// ) {
//   try {
//     const userId = params.userId;
    
//     if (!userId || isNaN(parseInt(userId))) {
//       return NextResponse.json(
//         { message: 'Valid user ID is required' },
//         { status: 400 }
//       );
//     }
    
//     const body = await request.json();
//     const { preferences } = body;
    
//     if (!preferences) {
//       return NextResponse.json(
//         { message: 'Preferences data is required' },
//         { status: 400 }
//       );
//     }
    
//     // Map the preferences to the database model
//     const dbPreferences = mapPreferencesToDbModel(preferences);
    
//     // Update preferences in the database
//     await prisma.preference.upsert({
//       where: { userId: parseInt(userId) },
//       update: dbPreferences,
//       create: {
//         userId: parseInt(userId),
//         ...dbPreferences
//       }
//     });
    
//     return NextResponse.json({ message: 'Preferences updated successfully' });
//   } catch (error) {
//     console.error('Error updating preferences:', error);
//     return NextResponse.json(
//       { message: 'Failed to update preferences' },
//       { status: 500 }
//     );
//   } finally {
//     await prisma.$disconnect();
//   }
// }


// // import { NextRequest, NextResponse } from 'next/server';

// // import { UserPreferences } from '@/types/preferences';
// // import { PrismaClient } from '@prisma/client';


// // const prisma = new PrismaClient();

// // function mapPreferencesToDbModel(preferences: UserPreferences) {
// //     return {
// //       ageRangeMin: preferences.ageRange.min,
// //       ageRangeMax: preferences.ageRange.max,
// //       heightRangeMin: preferences.heightRange.min,
// //       heightRangeMax: preferences.heightRange.max,
// //       preferredLocation: preferences.locations.districts.join(','), // Join districts with comma
// //       preferredReligion: preferences.religion.value,
// //       preferredCaste: preferences.caste.value,
// //       preferredEducation: preferences.education.value,
// //       // Store weight preferences as JSON string in otherPreferences
// //       otherPreferences: JSON.stringify({
// //         weights: {
// //           ageRange: preferences.ageRange.weight,
// //           heightRange: preferences.heightRange.weight,
// //           locations: preferences.locations.weight,
// //           religion: preferences.religion.weight,
// //           caste: preferences.caste.weight,
// //           education: preferences.education.weight
// //         }
// //       })
// //     };
// //   }
  


// // // For App Router
// // export async function PUT(
// //   request: NextRequest,
// //   { params }: { params: { userId: string } }
// // ) {
// //   try {
// //     const userId = params.userId;
    
// //     if (!userId) {
// //       return NextResponse.json(
// //         { message: 'User ID is required' },
// //         { status: 400 }
// //       );
// //     }
    
// //     const body = await request.json();
// //     const { preferences } = body;
    
// //     if (!preferences) {
// //       return NextResponse.json(
// //         { message: 'Preferences data is required' },
// //         { status: 400 }
// //       );
// //     }
    
// //     // TODO: Update preferences in your database
// //     // Example with a hypothetical database service:
// //     await prisma.preferences.update({
// //       where: { userId: parseInt(userId) },
// //       data: preferences
// //     });
    
// //     // For testing, just return success
// //     return NextResponse.json({ message: 'Preferences updated successfully' });
// //   } catch (error) {
// //     console.error('Error updating preferences:', error);
// //     return NextResponse.json(
// //       { message: 'Failed to update preferences' },
// //       { status: 500 }
// //     );
// //   }
// // }

// // If you're using Pages Router, use this instead:
// /*
// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'PUT') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }
  
//   try {
//     const userId = req.query.userId as string;
    
//     if (!userId) {
//       return res.status(400).json({ message: 'User ID is required' });
//     }
    
//     const { preferences } = req.body;
    
//     if (!preferences) {
//       return res.status(400).json({ message: 'Preferences data is required' });
//     }
    
//     // TODO: Update preferences in your database
//     // Example with a hypothetical database service:
//     // await db.userPreferences.update({
//     //   where: { userId: parseInt(userId) },
//     //   data: preferences
//     // });
    
//     // For testing, just return success
//     return res.status(200).json({ message: 'Preferences updated successfully' });
//   } catch (error) {
//     console.error('Error updating preferences:', error);
//     return res.status(500).json({ message: 'Failed to update preferences' });
//   }
// }
// */