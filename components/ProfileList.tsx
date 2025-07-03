'use client';

import { useState, useEffect } from 'react';
import { User, Proposal } from '@prisma/client';
import ProfileCard from './ProfileCard';
import Pagination from '@/components/Pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface ProfileWithDetails extends User {
  profile?: {
    id: number;
    status: 'pending' | 'approved' | 'refused';
    photos?: {
      id: number;
      url: string;
      isMain: boolean;
    }[];
    sex?: string;
    birthday?: string;
    district?: string;
    maritalStatus?: string;
    religion?: string;
    caste?: string;
    height?: number;
    motherTongue?: string;
    education?: string;
    occupation?: string;
    annualIncome?: string;
    aboutMe?: string;
    familyDetails?: string | null;
    hobbies?: string | null;
    expectations?: string | null;
  } | null;
  receivedProposals: Proposal[];
  sentProposals: Proposal[];
}

interface ProfileListProps {
  initialProfiles: ProfileWithDetails[];
  totalProfiles: number;
  page: number;
  perPage: number;
  currentUserId: number;
  isAdmin?: boolean;
}

export default function ProfileList({
  initialProfiles,
  totalProfiles,
  page,
  perPage,
  currentUserId,
  isAdmin = false,
}: ProfileListProps) {
  const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApprove = async (profileId: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, [profileId]: true }));
      
      const response = await fetch(`/api/admin/profiles/${profileId}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to approve profile');
      }

      // Update the local state to reflect the change
      setProfiles(prev => prev.map(profile => {
        if (profile.profile?.id === profileId) {
          return {
            ...profile,
            profile: {
              ...profile.profile,
              status: 'approved'
            }
          };
        }
        return profile;
      }));
    } catch (error) {
      console.error('Error approving profile:', error);
      // You might want to add error toast here
    } finally {
      setLoadingStates(prev => ({ ...prev, [profileId]: false }));
    }
  };

  const handleRefuse = async (profileId: number) => {
    try {
      setLoadingStates(prev => ({ ...prev, [profileId]: true }));
      
      const response = await fetch(`/api/admin/profiles/${profileId}/refuse`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to refuse profile');
      }

      // Update the local state to reflect the change
      setProfiles(prev => prev.map(profile => {
        if (profile.profile?.id === profileId) {
          return {
            ...profile,
            profile: {
              ...profile.profile,
              status: 'refused'
            }
          };
        }
        return profile;
      }));
    } catch (error) {
      console.error('Error refusing profile:', error);
      // You might want to add error toast here
    } finally {
      setLoadingStates(prev => ({ ...prev, [profileId]: false }));
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium">No profiles match your criteria</h3>
        <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
      </div>
    );
  }

  return (
    <div>
      {isAdmin && (
        <div className="mb-4 flex gap-2">
          <button 
            onClick={() => router.push(`${pathname}?status=pending`)}
            className={`px-4 py-2 rounded ${searchParams.get('status') === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => router.push(`${pathname}?status=approved`)}
            className={`px-4 py-2 rounded ${searchParams.get('status') === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => router.push(`${pathname}?status=refused`)}
            className={`px-4 py-2 rounded ${searchParams.get('status') === 'refused' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Rejected
          </button>
          <button 
            onClick={() => router.push(pathname)}
            className={`px-4 py-2 rounded ${!searchParams.get('status') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => {
          // Create a proper profile ID - use the User.id as profileId
          const profileId = profile.profileId || `USER_${profile.id}`;
          
          return (
            <ProfileCard
              key={profile.id}
              profile={{
                id: profile.id,
                profileId: profileId,
                lastLogin: profile.lastLogin,
                isVerified: profile.isVerified,
                isProfileComplete: profile.isProfileComplete,
                email: profile.email,
                phone: profile.phone,
                profile: profile.profile ? {
                  id: profile.profile.id,
                  status: profile.profile.status,
                  photos: profile.profile.photos,
                  sex: profile.profile.sex,
                  birthday: profile.profile.birthday,
                  district: profile.profile.district,
                  maritalStatus: profile.profile.maritalStatus,
                  religion: profile.profile.religion,
                  caste: profile.profile.caste,
                  height: profile.profile.height,
                  motherTongue: profile.profile.motherTongue,
                  education: profile.profile.education,
                  occupation: profile.profile.occupation,
                  annualIncome: profile.profile.annualIncome,
                  aboutMe: profile.profile.aboutMe,
                  familyDetails: profile.profile.familyDetails,
                  hobbies: profile.profile.hobbies,
                  expectations: profile.profile.expectations,
                } : undefined,
              }}
              isCurrentUser={profile.id === currentUserId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onApprove={profile.profile?.status === 'pending' ? () => handleApprove(profile.profile!.id) : undefined}
              onRefuse={profile.profile?.status === 'pending' ? () => handleRefuse(profile.profile!.id) : undefined}
              adminLoading={loadingStates[profile.profile?.id || 0] || false}
            />
          );
        })}
      </div>

      {totalProfiles > perPage && (
        <div className="mt-8">
          <Pagination
            totalItems={totalProfiles}
            itemsPerPage={perPage}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import { User, Proposal } from '@prisma/client';
// import ProfileCard from './ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// interface ProfileWithDetails extends User {
//   profile?: {
//     id: number;
//     status: 'pending' | 'approved' | 'refused';
//     familyDetails?: string | null;
//     hobbies?: string | null;
//     expectations?: string | null;
//     photos?: {
//       id: number;
//       url: string;
//       isMain: boolean;
//     }[];
//   } | null;
//   receivedProposals: Proposal[];
//   sentProposals: Proposal[];
// }

// interface ProfileListProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number;
//   isAdmin?: boolean; // Add this prop to identify admin view
// }

// export default function ProfileList({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
//   isAdmin = false, // Default to false
// }: ProfileListProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     setProfiles(initialProfiles);
//   }, [initialProfiles]);

//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handleApprove = async (profileId: number) => {
//     try {
//       setLoadingStates(prev => ({ ...prev, [profileId]: true }));
      
//       const response = await fetch(`/api/admin/profiles/${profileId}/approve`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to approve profile');
//       }

//       // Update the local state to reflect the change
//       setProfiles(prev => prev.map(profile => {
//         if (profile.profile?.id === profileId) {
//           return {
//             ...profile,
//             profile: {
//               ...profile.profile,
//               status: 'approved'
//             }
//           };
//         }
//         return profile;
//       }));
//     } catch (error) {
//       console.error('Error approving profile:', error);
//       // You might want to add error toast here
//     } finally {
//       setLoadingStates(prev => ({ ...prev, [profileId]: false }));
//     }
//   };

//   const handleRefuse = async (profileId: number) => {
//     try {
//       setLoadingStates(prev => ({ ...prev, [profileId]: true }));
      
//       const response = await fetch(`/api/admin/profiles/${profileId}/refuse`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to refuse profile');
//       }

//       // Update the local state to reflect the change
//       setProfiles(prev => prev.map(profile => {
//         if (profile.profile?.id === profileId) {
//           return {
//             ...profile,
//             profile: {
//               ...profile.profile,
//               status: 'refused'
//             }
//           };
//         }
//         return profile;
//       }));
//     } catch (error) {
//       console.error('Error refusing profile:', error);
//       // You might want to add error toast here
//     } finally {
//       setLoadingStates(prev => ({ ...prev, [profileId]: false }));
//     }
//   };

//   if (profiles.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h3 className="text-xl font-medium">No profiles match your criteria</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {isAdmin && (
//         <div className="mb-4 flex gap-2">
//           <button 
//             onClick={() => router.push(`${pathname}?status=pending`)}
//             className={`px-4 py-2 rounded ${searchParams.get('status') === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//           >
//             Pending
//           </button>
//           <button 
//             onClick={() => router.push(`${pathname}?status=approved`)}
//             className={`px-4 py-2 rounded ${searchParams.get('status') === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//           >
//             Approved
//           </button>
//           <button 
//             onClick={() => router.push(`${pathname}?status=refused`)}
//             className={`px-4 py-2 rounded ${searchParams.get('status') === 'refused' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//           >
//             Rejected
//           </button>
//           <button 
//             onClick={() => router.push(pathname)}
//             className={`px-4 py-2 rounded ${!searchParams.get('status') ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
//           >
//             All
//           </button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {profiles.map((profile) => (
//           <ProfileCard
//             key={profile.id}
//             profile={{
//               id: profile.id,
//               profileId: profile.profile?.id,
//               ...profile,
//               profile: {
//                 id: profile.profile?.id!,
//                 ...profile.profile,
//               },
//             }}
//             currentUserId={currentUserId}
//             isAdmin={isAdmin}
//             onApprove={profile.profile?.status === 'pending' ? () => handleApprove(profile.profile!.id) : undefined}
//             onRefuse={profile.profile?.status === 'pending' ? () => handleRefuse(profile.profile!.id) : undefined}
//             loading={loadingStates[profile.profile?.id || 0] || false}
//           />
//         ))}
//       </div>

//       {totalProfiles > perPage && (
//         <div className="mt-8">
//           <Pagination
//             totalItems={totalProfiles}
//             itemsPerPage={perPage}
//             currentPage={page}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       )}
//     </div>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import { User, Proposal } from '@prisma/client';
// import ProfileCard from './ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// interface ProfileWithDetails extends User {
//   profile?: {
//     id: number; // PROFILE ID
//     familyDetails?: string | null;
//     hobbies?: string | null;
//     expectations?: string | null;
//     photos?: {
//       id: number;
//       url: string;
//       isMain: boolean;
//     }[];
//   } | null;
//   receivedProposals: Proposal[];
//   sentProposals: Proposal[];
// }

// interface ProfileListProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number;
// }


// export default function ProfileList({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
// }: ProfileListProps) {
//   // ... (existing code remains the same until the return statement)
//   {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Update profiles when initial data changes
//   useEffect(() => {
//     setProfiles(initialProfiles);
//   }, [initialProfiles]);

//   // Handle pagination
//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   if (profiles.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h3 className="text-xl font-medium">No profiles match your criteria</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {profiles.map((profile) => (
//           <ProfileCard
//             key={profile.id}
//             profile={{
//               id: profile.id, // User ID
//               profileId: profile.profileId, // Public ID
//               ...profile,
//               profile: {
//                 id: profile.profile?.id!, // ✅ Explicitly pass Profile ID
//                 ...profile.profile,
//               },
//             }}
//             currentUserId={currentUserId}
//           />
//         ))}
//       </div>

      
//        {totalProfiles > perPage && (
//         <div className="mt-8">
//           <Pagination
//             totalItems={totalProfiles}
//             itemsPerPage={perPage}
//             currentPage={page}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       )}
// </div>
        
      

    
          
//   );
// }
// }

// // app/profiles/ProfileList.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { User, Proposal } from '@prisma/client';
// import ProfileCard from './ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// interface ProfileWithDetails extends User {
//   profile?: {
//     id: number;
//     familyDetails?: string | null;
//     hobbies?: string | null;
//     expectations?: string | null;
//     photos?: {
//       id: number;
//       url: string;
//       isMain: boolean;
//     }[];
//   } | null;
//   receivedProposals: Proposal[];
//   sentProposals: Proposal[];
// }

// interface ProfileListProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number | null;
// }

// export default function ProfileList({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
// }: ProfileListProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Update profiles when initial data changes
//   useEffect(() => {
//     setProfiles(initialProfiles);
//   }, [initialProfiles]);

//   // Handle pagination
//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   if (profiles.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h3 className="text-xl font-medium">No profiles match your criteria</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Updated grid layout with max 3 cards per row */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {profiles.map((profile) => (
//           <ProfileCard key={profile.id} profile={{ id: profile.id, ...profile }} currentUserId={currentUserId} />
//         ))}
//       </div>

//       {totalProfiles > perPage && (
//         <div className="mt-8">
//           <Pagination
//             totalItems={totalProfiles}
//             itemsPerPage={perPage}
//             currentPage={page}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       )}
//     </div>
//   );
// }




// // app/profiles/ProfileList.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { User, Proposal } from '@prisma/client';
// import ProfileCard from '@/components/ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// interface ProfileWithDetails extends User {
//   profile?: {
//     id: number;
//     familyDetails?: string | null;
//     hobbies?: string | null;
//     expectations?: string | null;
//     photos?: {
//       id: number;
//       url: string;
//       isMain: boolean;
//     }[];
//   } | null;
//   receivedProposals: Proposal[];
//   sentProposals: Proposal[];
// }

// interface ProfileListProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number | null;
// }

// export default function ProfileList({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
// }: ProfileListProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Update profiles when initial data changes
//   useEffect(() => {
//     setProfiles(initialProfiles);
//   }, [initialProfiles]);

//   // Handle pagination
//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   if (profiles.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h3 className="text-xl font-medium">No profiles match your criteria</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//         {profiles.map((profile) => (
//           <ProfileCard key={profile.id} profile={profile} currentUserId={currentUserId} />
//         ))}
//       </div>

//       {totalProfiles > perPage && (
//         <div className="mt-8">
//           <Pagination
//             totalItems={totalProfiles}
//             itemsPerPage={perPage}
//             currentPage={page}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       )}
//     </div>
//   );
// }