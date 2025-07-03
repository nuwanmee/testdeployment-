// app/browse/BrowseProfilesClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ProfileWithDetails, UserPreferences } from '@/types/profile';
import { calculatePreferenceMatchScore, sortProfilesByMatchScore } from '@/utils/profileScoring';
import ProfileCard from '@/components/ProfileCard';
import Pagination from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import PreferenceForm from '@/components/PreferenceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface BrowseProfilesClientProps {
  initialProfiles: ProfileWithDetails[];
  totalProfiles: number;
  page: number;
  perPage: number;
  currentUserId: number;
  availableDistricts: string[];
  availableReligions: string[];
  availableCastes: string[];
  availableEducations: string[];
  initialPreferences?: UserPreferences;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  ageRange: {
    min: 18,
    max: 50,
    weight: { weight: 70, enabled: true }
  },
  heightRange: {
    min: 150,
    max: 190,
    weight: { weight: 50, enabled: true }
  },
  locations: {
    districts: [],
    weight: { weight: 80, enabled: true }
  },
  religion: {
    value: null,
    weight: { weight: 60, enabled: false }
  },
  caste: {
    value: null,
    weight: { weight: 40, enabled: false }
  },
  education: {
    value: null,
    weight: { weight: 50, enabled: false }
  }
};

export default function BrowseProfilesClient({
  initialProfiles,
  totalProfiles,
  page,
  perPage,
  currentUserId,
  availableDistricts = [],
  availableReligions = [],
  availableCastes = [],
  availableEducations = [],
  initialPreferences
}: BrowseProfilesClientProps) {
  const [allProfiles, setAllProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
  const [displayProfiles, setDisplayProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
  const [preferences, setPreferences] = useState<UserPreferences>(
    initialPreferences || DEFAULT_PREFERENCES
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize with all profiles
  useEffect(() => {
    setAllProfiles(initialProfiles);
    setDisplayProfiles(initialProfiles);
  }, [initialProfiles]);

  // Handle client-side sorting when preferences change
  useEffect(() => {
    if (allProfiles.length > 0) {
      setIsSorting(true);
      
      // Calculate scores and sort
      const scoredProfiles = allProfiles.map(profile => ({
        ...profile,
        matchScore: calculatePreferenceMatchScore(preferences, profile)
      }));
      
      const sortedProfiles = sortProfilesByMatchScore(scoredProfiles);
      setDisplayProfiles(sortedProfiles);
      
      setIsSorting(false);
    }
  }, [preferences, allProfiles]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePreferencesChange = async (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/preferences/${currentUserId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPreferences),
      });
      
      if (!response.ok) throw new Error('Failed to save preferences');
      router.refresh(); // Refresh to get server-side sorted results
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (preferences.ageRange.weight.enabled) count++;
    if (preferences.heightRange.weight.enabled) count++;
    if (preferences.locations.weight.enabled && preferences.locations.districts.length > 0) count++;
    if (preferences.religion.weight.enabled && preferences.religion.value) count++;
    if (preferences.caste.weight.enabled && preferences.caste.value) count++;
    if (preferences.education.weight.enabled && preferences.education.value) count++;
    return count;
  };

  // Get paginated results from displayProfiles
  const paginatedProfiles = displayProfiles.slice(
    (page - 1) * perPage,
    page * perPage
  );

  if (paginatedProfiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium">No profiles found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your preferences to see more results.</p>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Adjust Preferences
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Matching Preferences</DialogTitle>
            </DialogHeader>
            <PreferenceForm
              initialPreferences={preferences}
              onPreferencesChange={handlePreferencesChange}
              districts={availableDistricts}
              religions={availableReligions}
              castes={availableCastes}
              educationLevels={availableEducations}
              userId={currentUserId}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">Browse Profiles</h1>
          <Badge variant="secondary" className="flex items-center gap-1">
            <span>{getActiveFilterCount()} filters</span>
            {(isLoading || isSorting) && <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full" />}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.refresh()} size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Preferences
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Matching Preferences</DialogTitle>
              </DialogHeader>
              <PreferenceForm
                initialPreferences={preferences}
                onPreferencesChange={handlePreferencesChange}
                districts={availableDistricts}
                religions={availableReligions}
                castes={availableCastes}
                educationLevels={availableEducations}
                userId={currentUserId}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-6 text-sm text-gray-600">
        Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, displayProfiles.length)} of {displayProfiles.length} profiles
        {initialPreferences && (
          <span className="ml-2 text-blue-600 font-medium">
            (sorted by compatibility)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {paginatedProfiles.map((profile) => {
          const hasAcceptedProposal = 
            profile.receivedProposals?.some(p => p.status === 'ACCEPTED') || 
            profile.sentProposals?.some(p => p.status === 'ACCEPTED');

          return (
            <ProfileCard 
              key={profile.id} 
              profile={{
                ...profile,
                profileId: profile.id.toString(),
                isVerified: profile.isVerified,
                isProfileComplete: profile.isProfileComplete,
                profile: {
                  ...profile.profile,
                  photos: profile.profile?.photos || [],
                  sex: profile.gender,
                  birthday: profile.dateOfBirth?.toISOString()
                }
              }}
              currentUserId={currentUserId}
              isCurrentUser={profile.id === currentUserId}
              showRealPhoto={hasAcceptedProposal || profile.id === currentUserId}
            />
          );
        })}
      </div>

      {displayProfiles.length > perPage && (
        <div className="flex justify-center">
          <Pagination
            totalItems={displayProfiles.length}
            itemsPerPage={perPage}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}

// // app/browse/BrowseProfilesClient.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { ProfileWithDetails, UserPreferences } from '@/types/profile';
// import { calculatePreferenceMatchScore, sortProfilesByMatchScore } from '@/utils/profileScoring';
// import ProfileCard from '@/components/ProfileCard';
// import Pagination from '@/components/Pagination';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { SlidersHorizontal, RotateCcw } from 'lucide-react';
// import PreferenceForm from '@/components/PreferenceForm';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// interface BrowseProfilesClientProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number;
//   availableDistricts: string[];
//   availableReligions: string[];
//   availableCastes: string[];
//   availableEducations: string[];
//   initialPreferences?: UserPreferences;
// }

// const DEFAULT_PREFERENCES: UserPreferences = {
//   ageRange: {
//     min: 18,
//     max: 50,
//     weight: { weight: 70, enabled: true }
//   },
//   heightRange: {
//     min: 150,
//     max: 190,
//     weight: { weight: 50, enabled: true }
//   },
//   locations: {
//     districts: [],
//     weight: { weight: 80, enabled: true }
//   },
//   religion: {
//     value: null,
//     weight: { weight: 60, enabled: false }
//   },
//   caste: {
//     value: null,
//     weight: { weight: 40, enabled: false }
//   },
//   education: {
//     value: null,
//     weight: { weight: 50, enabled: false }
//   }
// };

// export default function BrowseProfilesClient({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
//   availableDistricts = [],
//   availableReligions = [],
//   availableCastes = [],
//   availableEducations = [],
//   initialPreferences
// }: BrowseProfilesClientProps) {
//   const [allProfiles, setAllProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [displayProfiles, setDisplayProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [preferences, setPreferences] = useState<UserPreferences>(
//     initialPreferences || DEFAULT_PREFERENCES
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSorting, setIsSorting] = useState(false);
  
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Initialize with all profiles
//   useEffect(() => {
//     setAllProfiles(initialProfiles);
//     setDisplayProfiles(initialProfiles);
//   }, [initialProfiles]);

//   // Handle client-side sorting when preferences change
//   useEffect(() => {
//     if (allProfiles.length > 0) {
//       setIsSorting(true);
      
//       // Calculate scores and sort
//       const scoredProfiles = allProfiles.map(profile => ({
//         ...profile,
//         matchScore: calculatePreferenceMatchScore(preferences, profile)
//       }));
      
//       const sortedProfiles = sortProfilesByMatchScore(scoredProfiles);
//       setDisplayProfiles(sortedProfiles);
      
//       setIsSorting(false);
//     }
//   }, [preferences, allProfiles]);

//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handlePreferencesChange = async (newPreferences: UserPreferences) => {
//     setPreferences(newPreferences);
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`/api/preferences/${currentUserId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newPreferences),
//       });
      
//       if (!response.ok) throw new Error('Failed to save preferences');
//       router.refresh(); // Refresh to get server-side sorted results
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getActiveFilterCount = () => {
//     let count = 0;
//     if (preferences.ageRange.weight.enabled) count++;
//     if (preferences.heightRange.weight.enabled) count++;
//     if (preferences.locations.weight.enabled && preferences.locations.districts.length > 0) count++;
//     if (preferences.religion.weight.enabled && preferences.religion.value) count++;
//     if (preferences.caste.weight.enabled && preferences.caste.value) count++;
//     if (preferences.education.weight.enabled && preferences.education.value) count++;
//     return count;
//   };

//   // Get paginated results from displayProfiles
//   const paginatedProfiles = displayProfiles.slice(
//     (page - 1) * perPage,
//     page * perPage
//   );

//   if (paginatedProfiles.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h3 className="text-xl font-medium">No profiles found</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your preferences to see more results.</p>
        
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button variant="outline" className="mt-4">
//               <SlidersHorizontal className="mr-2 h-4 w-4" />
//               Adjust Preferences
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Matching Preferences</DialogTitle>
//             </DialogHeader>
//             <PreferenceForm
//               initialPreferences={preferences}
//               onPreferencesChange={handlePreferencesChange}
//               districts={availableDistricts}
//               religions={availableReligions}
//               castes={availableCastes}
//               educationLevels={availableEducations}
//               userId={currentUserId}
//             />
//           </DialogContent>
//         </Dialog>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex items-center gap-3">
//           <h1 className="text-3xl font-bold">Browse Profiles</h1>
//           <Badge variant="secondary" className="flex items-center gap-1">
//             <span>{getActiveFilterCount()} filters</span>
//             {(isLoading || isSorting) && <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full" />}
//           </Badge>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Button variant="outline" onClick={() => router.refresh()} size="sm">
//             <RotateCcw className="mr-2 h-4 w-4" />
//             Reset
//           </Button>
          
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline">
//                 <SlidersHorizontal className="mr-2 h-4 w-4" />
//                 Preferences
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Matching Preferences</DialogTitle>
//               </DialogHeader>
//               <PreferenceForm
//                 initialPreferences={preferences}
//                 onPreferencesChange={handlePreferencesChange}
//                 districts={availableDistricts}
//                 religions={availableReligions}
//                 castes={availableCastes}
//                 educationLevels={availableEducations}
//                 userId={currentUserId}
//               />
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       <div className="mb-6 text-sm text-gray-600">
//         Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, displayProfiles.length)} of {displayProfiles.length} profiles
//         {initialPreferences && (
//           <span className="ml-2 text-blue-600 font-medium">
//             (sorted by compatibility)
//           </span>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
//         {paginatedProfiles.map((profile) => (
//           <ProfileCard 
//             key={profile.id} 
//             profile={profile} 
//             currentUserId={currentUserId}
//           />
//         ))}
//       </div>

//       {displayProfiles.length > perPage && (
//         <div className="flex justify-center">
//           <Pagination
//             totalItems={displayProfiles.length}
//             itemsPerPage={perPage}
//             currentPage={page}
//             onPageChange={handlePageChange}
//           />
//         </div>
//       )}
//     </div>
//   );
// }





// // app/browse/BrowseProfilesClient.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { ProfileWithDetails, UserPreferences } from '@/types/profile';
// import ProfileCard from '../profiles/ProfileCard';
// import Pagination from '@/components/Pagination';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { SlidersHorizontal, RotateCcw } from 'lucide-react';
// import PreferenceForm from '@/components/PreferenceForm';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// interface BrowseProfilesClientProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number;
//   availableDistricts: string[];
//   availableReligions: string[];
//   availableCastes: string[];
//   availableEducations: string[];
//   initialPreferences?: UserPreferences;
// }

// export default function BrowseProfilesClient({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
//   availableDistricts = [],
//   availableReligions = [],
//   availableCastes = [],
//   availableEducations = [],
//   initialPreferences
// }: BrowseProfilesClientProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [preferences, setPreferences] = useState<UserPreferences>(
//     initialPreferences || DEFAULT_PREFERENCES
//   );
//   const [isLoading, setIsLoading] = useState(false);
  
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handlePreferencesChange = async (newPreferences: UserPreferences) => {
//     setPreferences(newPreferences);
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`/api/preferences/${currentUserId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newPreferences),
//       });
      
//       if (!response.ok) throw new Error('Failed to save preferences');
//       router.refresh(); // Refresh to get server-side sorted results
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getActiveFilterCount = () => {
//     let count = 0;
//     if (preferences.ageRange.weight.enabled) count++;
//     if (preferences.heightRange.weight.enabled) count++;
//     if (preferences.locations.weight.enabled && preferences.locations.districts.length > 0) count++;
//     if (preferences.religion.weight.enabled && preferences.religion.value) count++;
//     if (preferences.caste.weight.enabled && preferences.caste.value) count++;
//     if (preferences.education.weight.enabled && preferences.education.value) count++;
//     return count;
//   };

//   if (profiles.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h3 className="text-xl font-medium">No profiles found</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your preferences to see more results.</p>
        
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button variant="outline" className="mt-4">
//               <SlidersHorizontal className="mr-2 h-4 w-4" />
//               Adjust Preferences
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Matching Preferences</DialogTitle>
//             </DialogHeader>
//             <PreferenceForm
//               initialPreferences={preferences}
//               onPreferencesChange={handlePreferencesChange}
//               districts={availableDistricts}
//               religions={availableReligions}
//               castes={availableCastes}
//               educationLevels={availableEducations}
//               userId={currentUserId}
//             />
//           </DialogContent>
//         </Dialog>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex items-center gap-3">
//           <h1 className="text-3xl font-bold">Browse Profiles</h1>
//           <Badge variant="secondary" className="flex items-center gap-1">
//             <span>{getActiveFilterCount()} filters</span>
//             {isLoading && <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full" />}
//           </Badge>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Button variant="outline" onClick={() => router.refresh()} size="sm">
//             <RotateCcw className="mr-2 h-4 w-4" />
//             Reset
//           </Button>
          
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline">
//                 <SlidersHorizontal className="mr-2 h-4 w-4" />
//                 Preferences
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Matching Preferences</DialogTitle>
//               </DialogHeader>
//               <PreferenceForm
//                 initialPreferences={preferences}
//                 onPreferencesChange={handlePreferencesChange}
//                 districts={availableDistricts}
//                 religions={availableReligions}
//                 castes={availableCastes}
//                 educationLevels={availableEducations}
//                 userId={currentUserId}
//               />
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       <div className="mb-6 text-sm text-gray-600">
//         Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, totalProfiles)} of {totalProfiles} profiles
//         {initialPreferences && (
//           <span className="ml-2 text-blue-600 font-medium">
//             (sorted by compatibility)
//           </span>
//         )}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
//         {profiles.map((profile) => (
//           <ProfileCard 
//             key={profile.id} 
//             profile={profile} 
//             currentUserId={currentUserId}
//           />
//         ))}
//       </div>

//       {totalProfiles > perPage && (
//         <div className="flex justify-center">
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

// const DEFAULT_PREFERENCES: UserPreferences = {
//   ageRange: {
//     min: 18,
//     max: 50,
//     weight: { weight: 70, enabled: true }
//   },
//   heightRange: {
//     min: 150,
//     max: 190,
//     weight: { weight: 50, enabled: true }
//   },
//   locations: {
//     districts: [],
//     weight: { weight: 80, enabled: true }
//   },
//   religion: {
//     value: null,
//     weight: { weight: 60, enabled: false }
//   },
//   caste: {
//     value: null,
//     weight: { weight: 40, enabled: false }
//   },
//   education: {
//     value: null,
//     weight: { weight: 50, enabled: false }
//   }
// };


// // app/browse/BrowseProfilesClient.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import ProfileCard from '../profiles/ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { calculatePreferenceMatchScore, sortProfilesByMatchScore, ProfileWithDetails } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { SlidersHorizontal, RotateCcw } from 'lucide-react';
// import PreferenceForm from '@/components/PreferenceForm';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// const DEFAULT_PREFERENCES: UserPreferences = {
//   ageRange: {
//     min: 18,
//     max: 50,
//     weight: { weight: 70, enabled: true }
//   },
//   heightRange: {
//     min: 150,
//     max: 190,
//     weight: { weight: 50, enabled: true }
//   },
//   locations: {
//     districts: [],
//     weight: { weight: 80, enabled: true }
//   },
//   religion: {
//     value: null,
//     weight: { weight: 60, enabled: false }
//   },
//   caste: {
//     value: null,
//     weight: { weight: 40, enabled: false }
//   },
//   education: {
//     value: null,
//     weight: { weight: 50, enabled: false }
//   }
// };

// interface BrowseProfilesClientProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number;
//   availableDistricts: string[];
//   availableReligions: string[];
//   availableCastes: string[];
//   availableEducations: string[];
//   initialPreferences?: UserPreferences;
// }

// export default function BrowseProfilesClient({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
//   availableDistricts = [],
//   availableReligions = [],
//   availableCastes = [],
//   availableEducations = [],
//   initialPreferences
// }: BrowseProfilesClientProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [preferences, setPreferences] = useState<UserPreferences>(
//     initialPreferences || DEFAULT_PREFERENCES
//   );
//   const [isLoading, setIsLoading] = useState(false);
//   const [preferencesChanged, setPreferencesChanged] = useState(false);
  
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Re-score profiles when preferences change
//   useEffect(() => {
//     if (preferencesChanged && profiles.length > 0) {
//       console.log('Re-scoring profiles with new preferences:', preferences);
      
//       const scoredProfiles = profiles.map(profile => {
//         const score = calculatePreferenceMatchScore(preferences, profile);
//         console.log(`Profile ${profile.firstName} ${profile.lastName}: ${score}%`);
//         return {
//           ...profile,
//           matchScore: score
//         };
//       });

//       const sortedProfiles = sortProfilesByMatchScore(scoredProfiles);
//       setProfiles(sortedProfiles);
//       setPreferencesChanged(false);
//     }
//   }, [preferences, preferencesChanged]);

//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handlePreferencesChange = async (newPreferences: UserPreferences) => {
//     console.log('Preferences updated:', newPreferences);
//     setPreferences(newPreferences);
//     setPreferencesChanged(true);
    
//     // Save preferences to database
//     try {
//       setIsLoading(true);
//       const response = await fetch(`/api/preferences/${currentUserId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newPreferences),
//       });
      
//       if (!response.ok) {
//         console.error('Failed to save preferences');
//       }
//     } catch (error) {
//       console.error('Error saving preferences:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const resetToServerScoring = () => {
//     // Refresh the page to get server-side scoring
//     router.refresh();
//   };

//   const getActiveFilterCount = () => {
//     let count = 0;
    
//     if (preferences.ageRange.weight.enabled) count++;
//     if (preferences.heightRange.weight.enabled) count++;
//     if (preferences.locations.weight.enabled && preferences.locations.districts.length > 0) count++;
//     if (preferences.religion.weight.enabled && preferences.religion.value) count++;
//     if (preferences.caste.weight.enabled && preferences.caste.value) count++;
//     if (preferences.education.weight.enabled && preferences.education.value) count++;
    
//     return count;
//   };

//   if (profiles.length === 0) {
//     return (
//       <div className="text-center py-10">
//         <h3 className="text-xl font-medium">No profiles found</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your preferences to see more results.</p>
        
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button variant="outline" className="mt-4">
//               <SlidersHorizontal className="mr-2 h-4 w-4" />
//               Adjust Preferences
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>Matching Preferences</DialogTitle>
//             </DialogHeader>
//             <PreferenceForm
//               initialPreferences={preferences}
//               onPreferencesChange={handlePreferencesChange}
//               districts={availableDistricts}
//               religions={availableReligions}
//               castes={availableCastes}
//               educationLevels={availableEducations}
//               userId={currentUserId}
//             />
//           </DialogContent>
//         </Dialog>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-6">
//       {/* Header with Preference Controls */}
//       <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div className="flex items-center gap-3">
//           <h1 className="text-3xl font-bold">Browse Profiles</h1>
//           <Badge variant="secondary" className="flex items-center gap-1">
//             <span>{getActiveFilterCount()} filters</span>
//             {isLoading && <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full" />}
//           </Badge>
//         </div>
        
//         <div className="flex items-center gap-2">
//           <Button variant="outline" onClick={resetToServerScoring} size="sm">
//             <RotateCcw className="mr-2 h-4 w-4" />
//             Reset
//           </Button>
          
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline">
//                 <SlidersHorizontal className="mr-2 h-4 w-4" />
//                 Preferences
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>Matching Preferences</DialogTitle>
//               </DialogHeader>
//               <PreferenceForm
//                 initialPreferences={preferences}
//                 onPreferencesChange={handlePreferencesChange}
//                 districts={availableDistricts}
//                 religions={availableReligions}
//                 castes={availableCastes}
//                 educationLevels={availableEducations}
//                 userId={currentUserId}
//               />
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Results Summary */}
//       <div className="mb-6 text-sm text-gray-600">
//         Showing {((page - 1) * perPage) + 1}-{Math.min(page * perPage, totalProfiles)} of {totalProfiles} profiles
//         {initialPreferences && (
//           <span className="ml-2 text-blue-600 font-medium">
//             (sorted by compatibility)
//           </span>
//         )}
//       </div>

//       {/* Debug Info - Remove in production */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="mb-6 p-4 bg-gray-50 rounded-lg text-xs">
//           <h3 className="font-semibold mb-2">Debug Info:</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//             <div>
//               <strong>Age:</strong> {preferences.ageRange.min}-{preferences.ageRange.max} 
//               ({preferences.ageRange.weight.weight}%, {preferences.ageRange.weight.enabled ? 'ON' : 'OFF'})
//             </div>
//             <div>
//               <strong>Height:</strong> {preferences.heightRange.min}-{preferences.heightRange.max}cm 
//               ({preferences.heightRange.weight.weight}%, {preferences.heightRange.weight.enabled ? 'ON' : 'OFF'})
//             </div>
//             <div>
//               <strong>Locations:</strong> {preferences.locations.districts.length} selected 
//               ({preferences.locations.weight.weight}%, {preferences.locations.weight.enabled ? 'ON' : 'OFF'})
//             </div>
//             <div>
//               <strong>Top Scores:</strong> {profiles.slice(0, 3).map(p => p.matchScore || 0).join(', ')}%
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Profile Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
//         {profiles.map((profile) => (
//           <ProfileCard 
//             key={profile.id} 
//             profile={profile} 
//             currentUserId={currentUserId} 
//             matchScore={profile.matchScore}
//           />
//         ))}
//       </div>

//       {/* Pagination */}
//       {totalProfiles > perPage && (
//         <div className="flex justify-center">
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

// import { useState } from 'react';
// import ProfileList from '../profiles/ProfileList';
// import { ProfileWithDetails } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';

// interface BrowseProfilesClientProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number;
//   availableDistricts: string[];
//   availableReligions: string[];
//   availableCastes: string[];
//   availableEducations: string[];
//   initialPreferences?: UserPreferences;
// }

// export default function BrowseProfilesClient({
//   initialProfiles,
//   totalProfiles,
//   page,
//   perPage,
//   currentUserId,
//   availableDistricts,
//   availableReligions,
//   availableCastes,
//   availableEducations,
//   initialPreferences
// }: BrowseProfilesClientProps) {
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-center mb-2">Find Your Perfect Match</h1>
//         <p className="text-gray-600 text-center">
//           Browse profiles that match your preferences and connect with potential partners
//         </p>
//       </div>
      
//       <ProfileList
//         initialProfiles={initialProfiles}
//         totalProfiles={totalProfiles}
//         page={page}
//         perPage={perPage}
//         currentUserId={currentUserId}
//         availableDistricts={availableDistricts}
//         availableReligions={availableReligions}
//         availableCastes={availableCastes}
//         availableEducations={availableEducations}
//         initialPreferences={initialPreferences}
//       />
//     </div>
//   );
// }