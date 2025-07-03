import { useState, useEffect } from 'react';
import { ProfileWithDetails, calculatePreferenceMatchScore, sortProfilesByMatchScore } from '@/profileScoring';
import { UserPreferences } from '@/types/preferences';
import PreferenceForm from '@/components/PreferenceForm';
import ProfileCard from './ProfileCard';

// If you use a Dialog/Modal component, import it here
import Dialog from '@mui/material/Dialog'; // or your preferred dialog/modal

interface ProfileListProps {
  initialProfiles: ProfileWithDetails[];
  initialPreferences: UserPreferences;
  districts: string[];
  religions: string[];
  castes: string[];
  educationLevels: string[];
  currentUserId: number;
}

export default function ProfileList({
  initialProfiles,
  initialPreferences,
  districts,
  religions,
  castes,
  educationLevels,
  currentUserId,
}: ProfileListProps) {
  const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
  const [preferences, setPreferences] = useState<UserPreferences>(initialPreferences);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    console.log('Preferences changed:', preferences);
    if (profiles.length > 0) {
      console.log('Updating scores with current profiles');
      updateProfileScores(profiles);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences]);

  const updateProfileScores = (profilesToScore: ProfileWithDetails[]) => {
    console.log('Starting score update with prefs:', preferences);
    const scoredProfiles = profilesToScore.map(profile => {
      const { totalScore, breakdown } = calculatePreferenceMatchScore(preferences, profile);
      console.log(`Profile ${profile.id} score:`, totalScore, breakdown);
      return { ...profile, matchScore: totalScore, scoreBreakdown: breakdown };
    });

    const sortedProfiles = sortProfilesByMatchScore(scoredProfiles);
    console.log('Sorted profiles:', sortedProfiles.map(p => `${p.id}:${p.matchScore}`));
    setProfiles(sortedProfiles);
  };

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    setDialogOpen(false); // close dialog after save
    // updateProfileScores(profiles); // Not needed, useEffect will trigger
  };

  return (
    <div>
      <button onClick={() => setDialogOpen(true)}>Edit Preferences</button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <div style={{ padding: '1rem', minWidth: 350 }}>
          <PreferenceForm
            initialPreferences={preferences}
            onPreferencesChange={handlePreferencesChange}
            districts={districts}
            religions={religions}
            castes={castes}
            educationLevels={educationLevels}
            userId={currentUserId}
          />
        </div>
      </Dialog>
      <div className="profile-list-grid">
        {profiles.map(profile => (
          <ProfileCard key={profile.id} profile={profile} currentUserId={currentUserId} />
        ))}
      </div>
    </div>
  );
}




// // app/profiles/ProfileList.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import ProfileCard from './ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { calculateAge, ProfileWithDetails, calculatePreferenceMatchScore, sortProfilesByMatchScore } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { SlidersHorizontal } from 'lucide-react';
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

// interface ProfileListProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number | null;
//   availableDistricts: string[];
//   availableReligions: string[];
//   availableCastes: string[];
//   availableEducations: string[];
//   initialPreferences?: UserPreferences;
// }

// export default function ProfileList({
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
// }: ProfileListProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [preferences, setPreferences] = useState<UserPreferences>(
//     initialPreferences || DEFAULT_PREFERENCES
//   );
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   useEffect(() => {
//     if (!initialPreferences && currentUserId) {
//       fetchUserPreferences();
//     }
//   }, [currentUserId]);

//   useEffect(() => {
//     if (initialProfiles.length > 0) {
//       updateProfileScores(initialProfiles);
//     }
//   }, [initialProfiles, preferences]);

//   const fetchUserPreferences = async () => {
//     if (!currentUserId) return;
    
//     try {
//       const response = await fetch(`/api/preferences/${currentUserId}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.preferences) {
//           console.log('Fetched preferences:', data.preferences);
//           setPreferences(data.preferences);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching preferences:', error);
//     }
//   };

//   const updateProfileScores = (profilesToScore: ProfileWithDetails[]) => {
//     console.log('Updating scores with preferences:', preferences);
    
//     const scoredProfiles = profilesToScore.map(profile => {
//       const score = calculatePreferenceMatchScore(preferences, profile);
      
//       console.log(`Profile ${profile.id} score breakdown:`, {
//         name: `${profile.firstName} ${profile.lastName}`,
//         age: profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 'N/A',
//         height: profile.profile?.height || 'N/A',
//         district: profile.profile?.district || 'N/A',
//         religion: profile.religion || 'N/A',
//         caste: profile.caste || 'N/A',
//         education: profile.education || 'N/A',
//         calculatedScore: score
//       });

//       return {
//         ...profile,
//         matchScore: score
//       };
//     });

//     const sortedProfiles = sortProfilesByMatchScore(scoredProfiles);
//     setProfiles(sortedProfiles);
//   };

//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const handlePreferencesChange = (newPreferences: UserPreferences) => {
//     console.log('Preferences changed:', newPreferences);
//     setPreferences(newPreferences);
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
//         <h3 className="text-xl font-medium">No profiles match your criteria</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
        
//         {currentUserId && (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="mt-4">
//                 <SlidersHorizontal className="mr-2 h-4 w-4" />
//                 Adjust Preferences
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
//         )}
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Preference Controls */}
//       {currentUserId && (
//         <div className="mb-6 flex justify-between items-center">
//           <div className="flex items-center">
//             <h2 className="text-2xl font-bold">Matching Profiles</h2>
//             <Badge variant="secondary" className="ml-2">
//               {getActiveFilterCount()} active filters
//             </Badge>
//           </div>
          
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
//       )}

//       {/* Debug Info (remove in production) */}
//       <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
//         <h3 className="font-medium mb-1">Debug Info:</h3>
//         <div className="grid grid-cols-2 gap-2">
//           <div>
//             <p>Active Filters: {getActiveFilterCount()}</p>
//             <p>Age Range: {preferences.ageRange.min}-{preferences.ageRange.max} ({preferences.ageRange.weight.weight}%)</p>
//             <p>Height Range: {preferences.heightRange.min}-{preferences.heightRange.max}cm ({preferences.heightRange.weight.weight}%)</p>
//           </div>
//           <div>
//             <p>Locations: {preferences.locations.districts.length} selected ({preferences.locations.weight.weight}%)</p>
//             <p>Religion: {preferences.religion.value || 'Any'} ({preferences.religion.weight.weight}%)</p>
//             <p>Education: {preferences.education.value || 'Any'} ({preferences.education.weight.weight}%)</p>
//           </div>
//         </div>
//       </div>

//       {/* Profile Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {profiles.map((profile) => (
//           <ProfileCard 
//             key={profile.id} 
//             profile={profile} 
//             currentUserId={currentUserId} 
//             matchScore={profile.matchScore}
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

// // app/profiles/ProfileList.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import ProfileCard from './ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { 
//   ProfileWithDetails, 
//   calculatePreferenceMatchScore, 
//   sortProfilesByMatchScore 
// } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { SlidersHorizontal } from 'lucide-react';
// import PreferenceForm from '@/components/PreferenceForm';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// // Default preferences for new users
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

// interface ProfileListProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number | null;
//   availableDistricts: string[];
//   availableReligions: string[];
//   availableCastes: string[];
//   availableEducations: string[];
//   initialPreferences?: UserPreferences;
// }

// export default function ProfileList({
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
// }: ProfileListProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [preferences, setPreferences] = useState<UserPreferences>(
//     initialPreferences || DEFAULT_PREFERENCES
//   );
//   const [showPreferences, setShowPreferences] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Load user preferences from API if not provided
//   useEffect(() => {
//     if (!initialPreferences && currentUserId) {
//       fetchUserPreferences();
//     }
//   }, [currentUserId]);

//   // Fetch user preferences
//   const fetchUserPreferences = async () => {
//     if (!currentUserId) return;
    
//     try {
//       const response = await fetch(`/api/preferences/${currentUserId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setPreferences(data.preferences || DEFAULT_PREFERENCES);
//       }
//     } catch (error) {
//       console.error('Error fetching preferences:', error);
//     }
//   };

//   // Update profiles when initial data changes
//   useEffect(() => {
//     if (initialProfiles.length > 0) {
//       updateProfileScores(initialProfiles);
//     }
//   }, [initialProfiles, preferences]);

//   // Calculate and update match scores for profiles
//   const updateProfileScores = (profiles: ProfileWithDetails[]) => {
//     // Calculate match scores for each profile
//     const scoredProfiles = profiles.map(profile => ({
//       ...profile,
//       matchScore: calculatePreferenceMatchScore(preferences, profile)
//     }));
    
//     // Sort profiles by match score
//     const sortedProfiles = sortProfilesByMatchScore(scoredProfiles);
//     setProfiles(sortedProfiles);
//   };

//   // Handle pagination
//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   // Handle preference changes
//   const handlePreferencesChange = (newPreferences: UserPreferences) => {
//     setPreferences(newPreferences);
//     // This will trigger the useEffect that updates profile scores
//   };

//   // Get active filters count for badge
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
//         <h3 className="text-xl font-medium">No profiles match your criteria</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
        
//         {currentUserId && (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="mt-4">
//                 <SlidersHorizontal className="mr-2 h-4 w-4" />
//                 Adjust Preferences
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
//         )}
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Preference Controls */}
//       {currentUserId && (
//         <div className="mb-6 flex justify-between items-center">
//           <div className="flex items-center">
//             <h2 className="text-2xl font-bold">Matching Profiles</h2>
//             <Badge variant="secondary" className="ml-2">
//               {getActiveFilterCount()} active filters
//             </Badge>
//           </div>
          
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
//       )}

//       {/* Updated grid layout with max 3 cards per row */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {profiles.map((profile) => (
//           <ProfileCard 
//             key={profile.id} 
//             profile={profile} 
//             currentUserId={currentUserId} 
//             matchScore={profile.matchScore}
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


// // app/profiles/ProfileList.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import ProfileCard from './ProfileCard';
// import Pagination from '@/components/Pagination';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { ProfileWithDetails, calculateMatchScore, sortProfilesByMatchScore } from '@/utils/profileScoring';
// import { UserPreferences } from '@/types/preferences';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import { SlidersHorizontal } from 'lucide-react';
// import PreferenceForm from '@/components/PreferenceForm';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// // Default preferences for new users
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

// interface ProfileListProps {
//   initialProfiles: ProfileWithDetails[];
//   totalProfiles: number;
//   page: number;
//   perPage: number;
//   currentUserId: number | null;
//   availableDistricts: string[];
//   availableReligions: string[];
//   availableCastes: string[];
//   availableEducations: string[];
//   initialPreferences?: UserPreferences;
// }

// export default function ProfileList({
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
// }: ProfileListProps) {
//   const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
//   const [preferences, setPreferences] = useState<UserPreferences>(
//     initialPreferences || DEFAULT_PREFERENCES
//   );
//   const [showPreferences, setShowPreferences] = useState(false);
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Load user preferences from API if not provided
//   useEffect(() => {
//     if (!initialPreferences && currentUserId) {
//       fetchUserPreferences();
//     }
//   }, [currentUserId]);

//   // Fetch user preferences
//   const fetchUserPreferences = async () => {
//     if (!currentUserId) return;
    
//     try {
//       const response = await fetch(`/api/preferences/${currentUserId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setPreferences(data.preferences || DEFAULT_PREFERENCES);
//       }
//     } catch (error) {
//       console.error('Error fetching preferences:', error);
//     }
//   };

//   // Update profiles when initial data changes
//   useEffect(() => {
//     if (initialProfiles.length > 0) {
//       updateProfileScores(initialProfiles);
//     }
//   }, [initialProfiles, preferences]);

//   // Calculate and update match scores for profiles
//   const updateProfileScores = (profiles: ProfileWithDetails[]) => {
//     // Calculate match scores for each profile
//     const scoredProfiles = profiles.map(profile => ({
//       ...profile,
//       matchScore: calculateMatchScore(preferences, profile)
//     }));
    
//     // Sort profiles by match score
//     const sortedProfiles = sortProfilesByMatchScore(scoredProfiles);
//     setProfiles(sortedProfiles);
//   };

//   // Handle pagination
//   const handlePageChange = (newPage: number) => {
//     const params = new URLSearchParams(searchParams.toString());
//     params.set('page', newPage.toString());
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   // Handle preference changes
//   const handlePreferencesChange = (newPreferences: UserPreferences) => {
//     setPreferences(newPreferences);
//     // This will trigger the useEffect that updates profile scores
//   };

//   // Get active filters count for badge
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
//         <h3 className="text-xl font-medium">No profiles match your criteria</h3>
//         <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
        
//         {currentUserId && (
//           <Dialog>
//             <DialogTrigger asChild>
//               <Button variant="outline" className="mt-4">
//                 <SlidersHorizontal className="mr-2 h-4 w-4" />
//                 Adjust Preferences
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
//         )}
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* Preference Controls */}
//       {currentUserId && (
//         <div className="mb-6 flex justify-between items-center">
//           <div className="flex items-center">
//             <h2 className="text-2xl font-bold">Matching Profiles</h2>
//             <Badge variant="secondary" className="ml-2">
//               {getActiveFilterCount()} active filters
//             </Badge>
//           </div>
          
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
//       )}

//       {/* Updated grid layout with max 3 cards per row */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {profiles.map((profile) => (
//           <ProfileCard 
//             key={profile.id} 
//             profile={profile} 
//             currentUserId={currentUserId} 
//             matchScore={profile.matchScore}
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