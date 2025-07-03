// app/browse/page.tsx
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileList from '@/components/ProfileList';
import { calculateAge, calculatePreferenceMatchScore, sortProfilesByMatchScore } from '@/utils/profileScoring';
import { UserPreferences } from '@/types/preferences';
import { Suspense } from 'react';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { convertPreferenceFromDB } from '@/utils/PreferenceConverter';
import SidebarLayout from '@/components/layout/SidebarLayout';
import Navbar from '@/components/layout/Navbar';

interface SearchParams {
  page?: string;
  perPage?: string;
}

async function fetchUserPreferences(userId: number): Promise<UserPreferences | null> {
  try {
    const dbPreferences = await prisma.preference.findUnique({
      where: { userId }
    });
    
    if (!dbPreferences) return null;
    return convertPreferenceFromDB(dbPreferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return null;
  }
}

async function fetchMasterData() {
  const [districts, religions, castes, educations] = await Promise.all([
    prisma.profile.findMany({
      select: { district: true },
      where: { district: { not: null } },
      distinct: ['district']
    }),
    prisma.user.findMany({
      select: { religion: true },
      where: { religion: { not: null } },
      distinct: ['religion']
    }),
    prisma.user.findMany({
      select: { caste: true },
      where: { caste: { not: null } },
      distinct: ['caste']
    }),
    prisma.user.findMany({
      select: { education: true },
      where: { education: { not: null } },
      distinct: ['education']
    })
  ]);

  return {
    districts: districts.map(d => d.district as string).filter(Boolean),
    religions: religions.map(r => r.religion as string).filter(Boolean),
    castes: castes.map(c => c.caste as string).filter(Boolean),
    educations: educations.map(e => e.education as string).filter(Boolean)
  };
}

export default async function BrowseProfilesPage({ searchParams }: { searchParams: SearchParams }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/browse');
  }

  const currentUserId = parseInt(session.user.id);
  const page = parseInt(searchParams.page || '1');
  const perPage = parseInt(searchParams.perPage || '12');
  
  const userPreferences = await fetchUserPreferences(currentUserId);
  
  const allProfiles = await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      isProfileComplete: true,
      status: 'active', // Only active users
      profile: {
        status: 'approved' // Only approved profiles
      }
    },
    include: {
      profile: {
        include: {
          photos: true
        }
      },
      receivedProposals: {
        where: {
          senderId: currentUserId,
        },
        select: {
          id: true,
          status: true
        }
      },
      sentProposals: {
        where: {
          receiverId: currentUserId,
        },
        select: {
          id: true,
          status: true
        }
      }
    }
  });

  // Calculate age and score for each profile
  let profilesWithScores = allProfiles.map(profile => {
    const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : undefined;
    const profileWithAge = { ...profile, age };
    
    const matchScore = userPreferences 
      ? calculatePreferenceMatchScore(userPreferences, profileWithAge)
      : 0;
    
    return {
      ...profileWithAge,
      matchScore
    };
  });

  // Sort profiles by match score if preferences exist
  if (userPreferences) {
    profilesWithScores = sortProfilesByMatchScore(profilesWithScores);
  }

  // Apply pagination
  const skip = (page - 1) * perPage;
  const paginatedProfiles = profilesWithScores.slice(skip, skip + perPage);
  const totalProfiles = profilesWithScores.length;

  const masterData = await fetchMasterData();

  return (
    <SidebarLayout>
      <Navbar />
      <Suspense fallback={<LoadingSkeleton />}>
        <ProfileList 
          initialProfiles={paginatedProfiles}
          totalProfiles={totalProfiles}
          page={page}
          perPage={perPage}
          currentUserId={currentUserId}
        />
      </Suspense>
    </SidebarLayout>
  );
}


// // app/browse/page.tsx
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import  prisma  from '@/lib/prisma';
// import { redirect } from 'next/navigation';
// import BrowseProfilesClient from './BrowseProfilesClient';
// import { ProfileWithDetails, calculateAge, calculatePreferenceMatchScore, sortProfilesByMatchScore } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';
// import { Suspense } from 'react';
// import LoadingSkeleton from '@/components/LoadingSkeleton';
// import { convertPreferenceFromDB } from '@/utils/PreferenceConverter';
// import SidebarLayout from '@/components/layout/SidebarLayout';
// import Navbar from '@/components/layout/Navbar';

// interface SearchParams {
//   page?: string;
//   perPage?: string;
// }

// async function fetchUserPreferences(userId: number): Promise<UserPreferences | null> {
//   try {
//     const dbPreferences = await prisma.preference.findUnique({
//       where: { userId }
//     });
    
//     if (!dbPreferences) return null;
//     return convertPreferenceFromDB(dbPreferences);
//   } catch (error) {
//     console.error('Error fetching user preferences:', error);
//     return null;
//   }
// }

// async function fetchMasterData() {
//   const [districts, religions, castes, educations] = await Promise.all([
//     prisma.profile.findMany({
//       select: { district: true },
//       where: { district: { not: null } },
//       distinct: ['district']
//     }),
//     prisma.user.findMany({
//       select: { religion: true },
//       where: { religion: { not: null } },
//       distinct: ['religion']
//     }),
//     prisma.user.findMany({
//       select: { caste: true },
//       where: { caste: { not: null } },
//       distinct: ['caste']
//     }),
//     prisma.user.findMany({
//       select: { education: true },
//       where: { education: { not: null } },
//       distinct: ['education']
//     })
//   ]);

//   return {
//     districts: districts.map(d => d.district as string).filter(Boolean),
//     religions: religions.map(r => r.religion as string).filter(Boolean),
//     castes: castes.map(c => c.caste as string).filter(Boolean),
//     educations: educations.map(e => e.education as string).filter(Boolean)
//   };
// }

// export default async function BrowseProfilesPage({ searchParams }: { searchParams: SearchParams }) {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     redirect('/login?callbackUrl=/browse');
//   }

//   const currentUserId = parseInt(session.user.id);
//   const page = parseInt(searchParams.page || '1');
//   const perPage = parseInt(searchParams.perPage || '12');
  
//   // Fetch user preferences first
//   const userPreferences = await fetchUserPreferences(currentUserId);
  
//   // Fetch ALL profiles first (we'll do pagination after scoring)
//   const allProfiles = await prisma.user.findMany({
//     where: {
//       id: { not: currentUserId },
//       isProfileComplete: true,
//     },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       dateOfBirth: true,
//       education: true,
//       occupation: true,
//       religion: true,
//       caste: true,
//       profilePicture: true,
//       profile: {
//         select: {
//           district: true,
//           aboutMe: true,
//           height: true,
//           photos: {
//             select: {
//               url: true,
//               isMain: true
//             }
//           }
//         }
//       },
//       receivedProposals: {
//         where: {
//           senderId: currentUserId,
//         },
//         select: {
//           senderId: true,
//           receiverId: true,
//           status: true
//         }
//       },
//       sentProposals: {
//         where: {
//           receiverId: currentUserId,
//         },
//         select: {
//           senderId: true,
//           receiverId: true,
//           status: true
//         }
//       }
//     }
//   });

//   // Calculate age and score for each profile
//   let profilesWithScores = allProfiles.map(profile => {
//     const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : undefined;
//     const profileWithAge = { ...profile, age };
    
//     // Calculate match score if preferences exist
//     const matchScore = userPreferences 
//       ? calculatePreferenceMatchScore(userPreferences, profileWithAge)
//       : 0;
    
//     return {
//       ...profileWithAge,
//       matchScore
//     };
//   });

//   // Sort profiles by match score
//   if (userPreferences) {
//     profilesWithScores = sortProfilesByMatchScore(profilesWithScores);
//   }

//   // Apply pagination AFTER sorting
//   const skip = (page - 1) * perPage;
//   const paginatedProfiles = profilesWithScores.slice(skip, skip + perPage);
//   const totalProfiles = profilesWithScores.length;

//   const masterData = await fetchMasterData();

//   console.log('Server-side scoring complete:', {
//     totalProfiles: profilesWithScores.length,
//     currentPage: page,
//     profilesOnPage: paginatedProfiles.length,
//     hasPreferences: !!userPreferences,
//     sampleScores: paginatedProfiles.slice(0, 3).map(p => ({
//       name: `${p.firstName} ${p.lastName}`,
//       score: p.matchScore
//     }))
//   });

//   return (
//     <SidebarLayout>
//       <Navbar />
//       <Suspense fallback={<LoadingSkeleton />}>
//         <BrowseProfilesClient 
//           initialProfiles={paginatedProfiles as unknown as ProfileWithDetails[]}
//           totalProfiles={totalProfiles}
//           page={page}
//           perPage={perPage}
//           currentUserId={currentUserId}
//           availableDistricts={masterData.districts}
//           availableReligions={masterData.religions}
//           availableCastes={masterData.castes}
//           availableEducations={masterData.educations}
//           initialPreferences={userPreferences || undefined}
//         />
//       </Suspense>
//     </SidebarLayout>
//   );
// }


// // app/browse/page.tsx
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { prisma } from '@/lib/prisma';
// import { redirect } from 'next/navigation';
// import BrowseProfilesClient from './BrowseProfilesClient';
// import { ProfileWithDetails } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';
// import { Suspense } from 'react';
// import LoadingSkeleton from '@/components/LoadingSkeleton';
// import { convertPreferenceFromDB } from '@/utils/PreferenceConverter';
// import SidebarLayout from '@/components/layout/SidebarLayout';
// import { calculateAge } from '@/utils/profileScoring';
// import Navbar from '@/components/layout/Navbar';

// interface SearchParams {
//   page?: string;
//   perPage?: string;
// }

// async function fetchUserPreferences(userId: number): Promise<UserPreferences | null> {
//   try {
//     const dbPreferences = await prisma.preference.findUnique({
//       where: { userId }
//     });
    
//     if (!dbPreferences) return null;
//     return convertPreferenceFromDB(dbPreferences);
//   } catch (error) {
//     console.error('Error fetching user preferences:', error);
//     return null;
//   }
// }

// async function fetchMasterData() {
//   const [districts, religions, castes, educations] = await Promise.all([
//     prisma.profile.findMany({
//       select: { district: true },
//       where: { district: { not: null } },
//       distinct: ['district']
//     }),
//     prisma.user.findMany({
//       select: { religion: true },
//       where: { religion: { not: null } },
//       distinct: ['religion']
//     }),
//     prisma.user.findMany({
//       select: { caste: true },
//       where: { caste: { not: null } },
//       distinct: ['caste']
//     }),
//     prisma.user.findMany({
//       select: { education: true },
//       where: { education: { not: null } },
//       distinct: ['education']
//     })
//   ]);

//   return {
//     districts: districts.map(d => d.district as string).filter(Boolean),
//     religions: religions.map(r => r.religion as string).filter(Boolean),
//     castes: castes.map(c => c.caste as string).filter(Boolean),
//     educations: educations.map(e => e.education as string).filter(Boolean)
//   };
// }

// export default async function BrowseProfilesPage({ searchParams }: { searchParams: SearchParams }) {
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     redirect('/login?callbackUrl=/browse');
//   }

//   const currentUserId = parseInt(session.user.id);
//   const page = parseInt(searchParams.page || '1');
//   const perPage = parseInt(searchParams.perPage || '12');
//   const skip = (page - 1) * perPage;

//   // Fetch profiles with all necessary fields for scoring - using SELECT only
//   const profiles = await prisma.user.findMany({
//     where: {
//       id: { not: currentUserId },
//       isProfileComplete: true,
//     },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       dateOfBirth: true,
//       education: true,
//       occupation: true,
//       religion: true,
//       caste: true,
//       profilePicture: true,
//       profile: {
//         select: {
//           district: true,
//           aboutMe: true,
//           height: true,
//           photos: {
//             select: {
//               url: true,
//               isMain: true
//             }
//           }
//         }
//       },
//       receivedProposals: {
//         where: {
//           senderId: currentUserId,
//         },
//         select: {
//           senderId: true,
//           receiverId: true,
//           status: true
//         }
//       },
//       sentProposals: {
//         where: {
//           receiverId: currentUserId,
//         },
//         select: {
//           senderId: true,
//           receiverId: true,
//           status: true
//         }
//       }
//     },
//     skip,
//     take: perPage,
//   });

//   // Calculate age for each profile and add to the object
//   const profilesWithAge = profiles.map(profile => ({
//     ...profile,
//     age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : undefined
//   }));

//   const totalProfiles = await prisma.user.count({
//     where: {
//       id: { not: currentUserId },
//       isProfileComplete: true,
//     }
//   });

//   const userPreferences = await fetchUserPreferences(currentUserId);
//   const masterData = await fetchMasterData();

//   return (
//     <SidebarLayout>
//        <Navbar />
//       <Suspense fallback={<LoadingSkeleton />}>
//         <BrowseProfilesClient 
//           initialProfiles={profilesWithAge as unknown as ProfileWithDetails[]}
//           totalProfiles={totalProfiles}
//           page={page}
//           perPage={perPage}
//           currentUserId={currentUserId}
//           availableDistricts={masterData.districts}
//           availableReligions={masterData.religions}
//           availableCastes={masterData.castes}
//           availableEducations={masterData.educations}
//           initialPreferences={userPreferences || undefined}
//         />
//       </Suspense>
//     </SidebarLayout>
//   );
// }


// // app/browse/page.tsx
// import { getServerSession } from 'next-auth/next';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { prisma } from '@/lib/prisma';
// import { redirect } from 'next/navigation';
// import BrowseProfilesClient from './BrowseProfilesClient';
// import { ProfileWithDetails } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';
// import { Suspense } from 'react';
// import LoadingSkeleton from '@/components/LoadingSkeleton';
// import { convertPreferenceFromDB } from '@/utils/PreferenceConverter';
// import Navbar from '@/components/layout/Navbar';
// import Navbar2 from '@/components/layout/Navbar2';
// import SidebarLayout from '@/components/layout/SidebarLayout';

// interface SearchParams {
//   page?: string;
//   perPage?: string;
// }

// async function fetchUserPreferences(userId: number): Promise<UserPreferences | null> {
//   try {
//     // Fetch the preferences from DB
//     const dbPreferences = await prisma.preference.findUnique({
//       where: { userId }
//     });
    
//     if (!dbPreferences) return null;
    
//     // Convert DB format to our app's UserPreferences format
//     return convertPreferenceFromDB(dbPreferences);
//   } catch (error) {
//     console.error('Error fetching user preferences:', error);
//     return null;
//   }
// }

// async function fetchMasterData() {
//   // Fetch all districts from profiles
//   const districts = await prisma.profile.findMany({
//     select: { district: true },
//     where: { district: { not: null } },
//     distinct: ['district']
//   });
  
//   // Fetch all religions from users and profiles
//   const religions = await prisma.user.findMany({
//     select: { religion: true },
//     where: { religion: { not: null } },
//     distinct: ['religion']
//   });
  
//   // Fetch all castes from users and profiles
//   const castes = await prisma.user.findMany({
//     select: { caste: true },
//     where: { caste: { not: null } },
//     distinct: ['caste']
//   });
  
//   // Fetch all education levels from users and profiles
//   const educations = await prisma.user.findMany({
//     select: { education: true },
//     where: { education: { not: null } },
//     distinct: ['education']
//   });
  
//   return {
//     districts: districts.map(d => d.district as string).filter(Boolean),
//     religions: religions.map(r => r.religion as string).filter(Boolean),
//     castes: castes.map(c => c.caste as string).filter(Boolean),
//     educations: educations.map(e => e.education as string).filter(Boolean)
//   };
// }

// export default async function BrowseProfilesPage({ searchParams }: { searchParams: SearchParams }) {
//   // Get current user session
//   const session = await getServerSession(authOptions);
  
//   if (!session?.user?.id) {
//     // Redirect to login if no session
//     redirect('/login?callbackUrl=/browse');
//   }
  
//   const currentUserId = parseInt(session.user.id);
  
//   // Get pagination parameters
//   const page = parseInt(searchParams.page || '1');
//   const perPage = parseInt(searchParams.perPage || '12');
//   const skip = (page - 1) * perPage;
  
//   // Fetch profiles with pagination
//   const profiles = await prisma.user.findMany({
//     where: {
//       id: { not: currentUserId }, // Exclude current user
//       isProfileComplete: true,    // Only completed profiles
//     },
//     include: {
//       profile: {
//         include: {
//           photos: true,
//         }
//       },
//       receivedProposals: {
//         where: {
//           senderId: currentUserId,
//         }
//       },
//       sentProposals: {
//         where: {
//           receiverId: currentUserId,
//         }
//       }
//     },
//     skip,
//     take: perPage,
//   });
  
//   // Get total profiles count for pagination
//   const totalProfiles = await prisma.user.count({
//     where: {
//       id: { not: currentUserId },
//       isProfileComplete: true,
//     }
//   });
  
//   // Fetch user preferences
//   const userPreferences = await fetchUserPreferences(currentUserId);
  
//   // Fetch master data for preference form
//   const masterData = await fetchMasterData();
  
//   return (
//     <>
//     <SidebarLayout>
//     <Navbar />
   
//     <Suspense fallback={<LoadingSkeleton />}>
//       <BrowseProfilesClient 
//         initialProfiles={profiles as unknown as ProfileWithDetails[]}
//         totalProfiles={totalProfiles}
//         page={page}
//         perPage={perPage}
//         currentUserId={currentUserId}
//         availableDistricts={masterData.districts}
//         availableReligions={masterData.religions}
//         availableCastes={masterData.castes}
//         availableEducations={masterData.educations}
//         initialPreferences={userPreferences || undefined}
//       />
//     </Suspense>
//     </SidebarLayout>
//     </>
//   );
// }