// import { UserPreferences } from '@/types/preferences';

// export interface ProfileWithDetails {
//   id: number;
//   firstName: string;
//   lastName: string;
//   dateOfBirth?: string | Date;
//   education?: string;
//   occupation?: string;
//   religion?: string;
//   caste?: string;
//   profilePicture?: string;
//   receivedProposals?: Array<{
//     senderId: number;
//     receiverId: number;
//     status: string;
//   }>;
//   sentProposals?: Array<{
//     senderId: number;
//     receiverId: number;
//     status: string;
//   }>;
//   profile?: {
//     profileId?: string;
//     district?: string;
//     aboutMe?: string;
//     height?: number;
//     photos?: Array<{
//       url: string;
//       isMain: boolean;
//     }>;
//   };
//   matchScore?: number;
//   age?: number;
//   scoreBreakdown?: Record<string, number>;
// }

// export function calculateAge(dateOfBirth: string | Date): number {
//   const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
//   const today = new Date();
  
//   let age = today.getFullYear() - dob.getFullYear();
//   const monthDifference = today.getMonth() - dob.getMonth();
  
//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
//     age--;
//   }
  
//   return age;
// }

// export function calculatePreferenceMatchScore(
//   preferences: UserPreferences,
//   profile: ProfileWithDetails
// ): { totalScore: number; breakdown: Record<string, number> } {
//   const breakdown: Record<string, number> = {};
//   let totalScore = 0;

//   // Standardized multiplier for all criteria
//   const SCORE_MULTIPLIER = 100;

//   // Age matching
//   if (preferences.ageRange.weight.enabled) {
//     const age = profile.age || (profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0);
//     const ageMatch = age >= preferences.ageRange.min && age <= preferences.ageRange.max;
//     breakdown.age = ageMatch ? preferences.ageRange.weight.weight * SCORE_MULTIPLIER : 0;
//     totalScore += breakdown.age;
//   }

//   // Height matching
//   if (preferences.heightRange.weight.enabled && profile.profile?.height) {
//     const height = profile.profile.height;
//     const heightMatch = height >= preferences.heightRange.min && height <= preferences.heightRange.max;
//     breakdown.height = heightMatch ? preferences.heightRange.weight.weight * SCORE_MULTIPLIER : 0;
//     totalScore += breakdown.height;
//   }

//   // Location matching
//   if (preferences.locations.weight.enabled && profile.profile?.district) {
//     const isLocationMatch = preferences.locations.districts.length === 0 || 
//                          preferences.locations.districts.includes(profile.profile.district);
//     breakdown.location = isLocationMatch ? preferences.locations.weight.weight * SCORE_MULTIPLIER : 0;
//     totalScore += breakdown.location;
//   }

//   // Religion matching
//   if (preferences.religion.weight.enabled && preferences.religion.value && profile.religion) {
//     breakdown.religion = profile.religion === preferences.religion.value 
//       ? preferences.religion.weight.weight * SCORE_MULTIPLIER 
//       : 0;
//     totalScore += breakdown.religion;
//   }

//   // Caste matching
//   if (preferences.caste.weight.enabled && preferences.caste.value && profile.caste) {
//     breakdown.caste = profile.caste === preferences.caste.value 
//       ? preferences.caste.weight.weight * SCORE_MULTIPLIER 
//       : 0;
//     totalScore += breakdown.caste;
//   }

//   // Education matching
//   if (preferences.education.weight.enabled && preferences.education.value && profile.education) {
//     breakdown.education = profile.education === preferences.education.value 
//       ? preferences.education.weight.weight * SCORE_MULTIPLIER 
//       : 0;
//     totalScore += breakdown.education;
//   }

//   return {
//     totalScore,
//     breakdown
//   };
// }

// export function sortProfilesByMatchScore(profiles: ProfileWithDetails[]): ProfileWithDetails[] {
//   return [...profiles].sort((a, b) => {
//     // Sort by match score descending
//     const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
//     if (scoreDiff !== 0) return scoreDiff;
    
//     // Secondary sort by name if scores are equal
//     const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
//     const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
//     return nameA.localeCompare(nameB);
//   });
// }


// // utils/profileScoring.ts
// export function calculatePreferenceMatchScore(preferences: UserPreferences, profile: ProfileWithDetails): number {
//   let score = 0;
//   let totalPossibleScore = 0;

//   // Helper function for flexible matching with partial scores
//   const calculateMatchScore = (
//     value: any,
//     preferredValue: any,
//     weight: number,
//     options?: {
//       isRange?: boolean;
//       min?: number;
//       max?: number;
//       buffer?: number;
//     }
//   ) => {
//     if (!value || !preferredValue) return 0;

//     // Exact match for non-range values
//     if (!options?.isRange) {
//       return value === preferredValue ? weight : 0;
//     }

//     // Range matching with buffer zone
//     if (options?.isRange && typeof value === 'number') {
//       if (value >= options.min! && value <= options.max!) {
//         return weight; // Full score for exact match
//       }
//       if (options.buffer && (
//         (value >= options.min! - options.buffer && value < options.min!) ||
//         (value > options.max! && value <= options.max! + options.buffer)
//       )) {
//         return weight * 0.5; // Half score for buffer zone
//       }
//     }
    
//     return 0;
//   };

//   // Age matching (uses cached age if available, otherwise calculates)
//   if (preferences.ageRange.weight.enabled) {
//     const age = profile.age || (profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0);
//     score += calculateMatchScore(
//       age,
//       null, // Not used for range matching
//       preferences.ageRange.weight.weight,
//       {
//         isRange: true,
//         min: preferences.ageRange.min,
//         max: preferences.ageRange.max,
//         buffer: 5 // 5 year buffer zone
//       }
//     );
//     totalPossibleScore += preferences.ageRange.weight.weight;
//   }

//   // Height matching
//   if (preferences.heightRange.weight.enabled && profile.profile?.height) {
//     score += calculateMatchScore(
//       profile.profile.height,
//       null, // Not used for range matching
//       preferences.heightRange.weight.weight,
//       {
//         isRange: true,
//         min: preferences.heightRange.min,
//         max: preferences.heightRange.max,
//         buffer: 5 // 5cm buffer zone
//       }
//     );
//     totalPossibleScore += preferences.heightRange.weight.weight;
//   }

//   // Location matching
//   if (preferences.locations.weight.enabled && profile.profile?.district) {
//     const isLocationMatch = preferences.locations.districts.includes(profile.profile.district);
//     score += isLocationMatch ? preferences.locations.weight.weight : 0;
//     totalPossibleScore += preferences.locations.weight.weight;
//   }

//   // Religion matching
//   if (preferences.religion.weight.enabled && preferences.religion.value) {
//     score += calculateMatchScore(
//       profile.religion,
//       preferences.religion.value,
//       preferences.religion.weight.weight
//     );
//     totalPossibleScore += preferences.religion.weight.weight;
//   }

//   // Caste matching
//   if (preferences.caste.weight.enabled && preferences.caste.value) {
//     score += calculateMatchScore(
//       profile.caste,
//       preferences.caste.value,
//       preferences.caste.weight.weight
//     );
//     totalPossibleScore += preferences.caste.weight.weight;
//   }

//   // Education matching
//   if (preferences.education.weight.enabled && preferences.education.value) {
//     score += calculateMatchScore(
//       profile.education,
//       preferences.education.value,
//       preferences.education.weight.weight
//     );
//     totalPossibleScore += preferences.education.weight.weight;
//   }

//   // Return 0 if no criteria were evaluated
//   if (totalPossibleScore === 0) return 0;

//   // Calculate percentage score (rounded to nearest integer)
//   return Math.min(100, Math.round((score / totalPossibleScore) * 100));
// }

// // Utility function remains the same
// export function calculateAge(dateOfBirth: string | Date): number {
//   const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
//   const today = new Date();
  
//   let age = today.getFullYear() - dob.getFullYear();
//   const monthDifference = today.getMonth() - dob.getMonth();
  
//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
//     age--;
//   }
  
//   return age;
// }


// import { UserPreferences } from '@/types/preferences';

// export interface ProfileWithDetails {
//   id: number;
//   firstName: string;
//   lastName: string;
//   dateOfBirth?: string | Date;
//   education?: string;
//   occupation?: string;
//   religion?: string;
//   caste?: string;
//   profilePicture?: string;
//   receivedProposals?: Array<{
//     senderId: number;
//     receiverId: number;
//     status: string;
//   }>;
//   sentProposals?: Array<{
//     senderId: number;
//     receiverId: number;
//     status: string;
//   }>;
//   profile?: {
//     profileId?: string;
//     district?: string;
//     aboutMe?: string;
//     height?: number;
//     photos?: Array<{
//       url: string;
//       isMain: boolean;
//     }>;
//   };
//   matchScore?: number;
//   age?: number;
//   scoreBreakdown?: Record<string, number>;
// }

// export function calculateAge(dateOfBirth: string | Date): number {
//   const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
//   const today = new Date();
  
//   let age = today.getFullYear() - dob.getFullYear();
//   const monthDifference = today.getMonth() - dob.getMonth();
  
//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
//     age--;
//   }
  
//   return age;
// }

// export function calculatePreferenceMatchScore(
//   preferences: UserPreferences,
//   profile: ProfileWithDetails
// ): { totalScore: number; breakdown: Record<string, number> } {
//   const breakdown: Record<string, number> = {};
//   let totalScore = 0;

//   // Age matching
//   if (preferences.ageRange.weight.enabled) {
//     const age = profile.age || (profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0);
//     const ageMatch = age >= preferences.ageRange.min && age <= preferences.ageRange.max;
//     breakdown.age = ageMatch ? preferences.ageRange.weight.weight * 10 : 0;
//     totalScore += breakdown.age;
//   }

//   // Height matching
//   if (preferences.heightRange.weight.enabled && profile.profile?.height) {
//     const height = profile.profile.height;
//     const heightMatch = height >= preferences.heightRange.min && height <= preferences.heightRange.max;
//     breakdown.height = heightMatch ? preferences.heightRange.weight.weight * 10 : 0;
//     totalScore += breakdown.height;
//   }

//   // Location matching (heavily weighted)
//   if (preferences.locations.weight.enabled && profile.profile?.district) {
//     const isLocationMatch = preferences.locations.districts.length === 0 || 
//                          preferences.locations.districts.includes(profile.profile.district);
//     breakdown.location = isLocationMatch ? preferences.locations.weight.weight * 100 : 0;
//     totalScore += breakdown.location;
//   }

//   // Religion matching
//   if (preferences.religion.weight.enabled && preferences.religion.value && profile.religion) {
//     breakdown.religion = profile.religion === preferences.religion.value 
//       ? preferences.religion.weight.weight 
//       : 0;
//     totalScore += breakdown.religion;
//   }

//   // Caste matching
//   if (preferences.caste.weight.enabled && preferences.caste.value && profile.caste) {
//     breakdown.caste = profile.caste === preferences.caste.value 
//       ? preferences.caste.weight.weight 
//       : 0;
//     totalScore += breakdown.caste;
//   }

//   // Education matching
//   if (preferences.education.weight.enabled && preferences.education.value && profile.education) {
//     breakdown.education = profile.education === preferences.education.value 
//       ? preferences.education.weight.weight 
//       : 0;
//     totalScore += breakdown.education;
//   }

//   return {
//     totalScore,
//     breakdown
//   };
// }

// export function sortProfilesByMatchScore(profiles: ProfileWithDetails[]): ProfileWithDetails[] {
//   return [...profiles].sort((a, b) => {
//     // Sort by match score descending
//     const scoreDiff = (b.matchScore || 0) - (a.matchScore || 0);
//     if (scoreDiff !== 0) return scoreDiff;
    
//     // Secondary sort by name if scores are equal
//     const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
//     const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
//     return nameA.localeCompare(nameB);
//   });
// }



// utils/profileScoring.ts
import { UserPreferences } from '@/types/preferences';

export interface ProfileWithDetails {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | Date;
  education?: string;
  occupation?: string;
  religion?: string;
  caste?: string;
  profilePicture?: string;
  receivedProposals?: Array<{
    senderId: number;
    receiverId: number;
    status: string;
  }>;
  sentProposals?: Array<{
    senderId: number;
    receiverId: number;
    status: string;
  }>;
  profile?: {
    profileId?: string;
    district?: string;
    aboutMe?: string;
    height?: number;
    photos?: Array<{
      url: string;
      isMain: boolean;
    }>;
  };
  matchScore?: number;
  age?: number;
}

export function calculateAge(dateOfBirth: string | Date): number {
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();
  
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

export function calculatePreferenceMatchScore(preferences: UserPreferences, profile: ProfileWithDetails): number {
  let score = 0;
  let totalPossibleScore = 0;

  // Helper function for flexible matching with partial scores
  const calculateMatchScore = (
    value: any,
    preferredValue: any,
    weight: number,
    options?: {
      isRange?: boolean;
      min?: number;
      max?: number;
      buffer?: number;
    }
  ) => {
    if (!value || (!preferredValue && !options?.isRange)) return 0;

    // Exact match for non-range values
    if (!options?.isRange) {
      return value === preferredValue ? weight : 0;
    }

    // Range matching with buffer zone
    if (options?.isRange && typeof value === 'number') {
      if (value >= options.min! && value <= options.max!) {
        return weight; // Full score for exact match
      }
      if (options.buffer && (
        (value >= options.min! - options.buffer && value < options.min!) ||
        (value > options.max! && value <= options.max! + options.buffer)
      )) {
        return weight * 0.5; // Half score for buffer zone
      }
    }
    
    return 0;
  };

  // Age matching (uses cached age if available, otherwise calculates)
  if (preferences.ageRange.weight.enabled) {
    const age = profile.age || (profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0);
    if (age > 0) { // Only score if we have a valid age
      score += calculateMatchScore(
        age,
        null, // Not used for range matching
        preferences.ageRange.weight.weight,
        {
          isRange: true,
          min: preferences.ageRange.min,
          max: preferences.ageRange.max,
          buffer: 5 // 5 year buffer zone
        }
      );
    }
    totalPossibleScore += preferences.ageRange.weight.weight;
  }

  // Height matching
  if (preferences.heightRange.weight.enabled && profile.profile?.height) {
    score += calculateMatchScore(
      profile.profile.height,
      null, // Not used for range matching
      preferences.heightRange.weight.weight,
      {
        isRange: true,
        min: preferences.heightRange.min,
        max: preferences.heightRange.max,
        buffer: 5 // 5cm buffer zone
      }
    );
    totalPossibleScore += preferences.heightRange.weight.weight;
  }

  // Location matching
  if (preferences.locations.weight.enabled && profile.profile?.district) {
    const isLocationMatch = preferences.locations.districts.length === 0 || 
                           preferences.locations.districts.includes(profile.profile.district);
    score += isLocationMatch ? preferences.locations.weight.weight : 0;
    totalPossibleScore += preferences.locations.weight.weight;
  }

  // Religion matching
  if (preferences.religion.weight.enabled && preferences.religion.value && profile.religion) {
    score += calculateMatchScore(
      profile.religion,
      preferences.religion.value,
      preferences.religion.weight.weight
    );
    totalPossibleScore += preferences.religion.weight.weight;
  }

  // Caste matching
  if (preferences.caste.weight.enabled && preferences.caste.value && profile.caste) {
    score += calculateMatchScore(
      profile.caste,
      preferences.caste.value,
      preferences.caste.weight.weight
    );
    totalPossibleScore += preferences.caste.weight.weight;
  }

  // Education matching
  if (preferences.education.weight.enabled && preferences.education.value && profile.education) {
    score += calculateMatchScore(
      profile.education,
      preferences.education.value,
      preferences.education.weight.weight
    );
    totalPossibleScore += preferences.education.weight.weight;
  }

  // Return 0 if no criteria were evaluated
  if (totalPossibleScore === 0) return 0;

  // Calculate percentage score (rounded to nearest integer)
  return Math.min(100, Math.round((score / totalPossibleScore) * 100));
}

// MISSING FUNCTION - This was the cause of your error
export function sortProfilesByMatchScore(profiles: ProfileWithDetails[]): ProfileWithDetails[] {
  return [...profiles].sort((a, b) => {
    const scoreA = a.matchScore || 0;
    const scoreB = b.matchScore || 0;
    
    // Sort by match score descending (highest first)
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // If match scores are equal, sort by name as secondary criteria
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
}


// // utils/profileScoring.ts
// export function calculatePreferenceMatchScore(preferences: UserPreferences, profile: ProfileWithDetails): number {
//   let score = 0;
//   let totalPossibleScore = 0;

//   // Helper function for flexible matching with partial scores
//   const calculateMatchScore = (
//     value: any,
//     preferredValue: any,
//     weight: number,
//     options?: {
//       isRange?: boolean;
//       min?: number;
//       max?: number;
//       buffer?: number;
//     }
//   ) => {
//     if (!value || !preferredValue) return 0;

//     // Exact match for non-range values
//     if (!options?.isRange) {
//       return value === preferredValue ? weight : 0;
//     }

//     // Range matching with buffer zone
//     if (options?.isRange && typeof value === 'number') {
//       if (value >= options.min! && value <= options.max!) {
//         return weight; // Full score for exact match
//       }
//       if (options.buffer && (
//         (value >= options.min! - options.buffer && value < options.min!) ||
//         (value > options.max! && value <= options.max! + options.buffer)
//       )) {
//         return weight * 0.5; // Half score for buffer zone
//       }
//     }
    
//     return 0;
//   };

//   // Age matching (uses cached age if available, otherwise calculates)
//   if (preferences.ageRange.weight.enabled) {
//     const age = profile.age || (profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0);
//     score += calculateMatchScore(
//       age,
//       null, // Not used for range matching
//       preferences.ageRange.weight.weight,
//       {
//         isRange: true,
//         min: preferences.ageRange.min,
//         max: preferences.ageRange.max,
//         buffer: 5 // 5 year buffer zone
//       }
//     );
//     totalPossibleScore += preferences.ageRange.weight.weight;
//   }

//   // Height matching
//   if (preferences.heightRange.weight.enabled && profile.profile?.height) {
//     score += calculateMatchScore(
//       profile.profile.height,
//       null, // Not used for range matching
//       preferences.heightRange.weight.weight,
//       {
//         isRange: true,
//         min: preferences.heightRange.min,
//         max: preferences.heightRange.max,
//         buffer: 5 // 5cm buffer zone
//       }
//     );
//     totalPossibleScore += preferences.heightRange.weight.weight;
//   }

//   // Location matching
//   if (preferences.locations.weight.enabled && profile.profile?.district) {
//     const isLocationMatch = preferences.locations.districts.includes(profile.profile.district);
//     score += isLocationMatch ? preferences.locations.weight.weight : 0;
//     totalPossibleScore += preferences.locations.weight.weight;
//   }

//   // Religion matching
//   if (preferences.religion.weight.enabled && preferences.religion.value) {
//     score += calculateMatchScore(
//       profile.religion,
//       preferences.religion.value,
//       preferences.religion.weight.weight
//     );
//     totalPossibleScore += preferences.religion.weight.weight;
//   }

//   // Caste matching
//   if (preferences.caste.weight.enabled && preferences.caste.value) {
//     score += calculateMatchScore(
//       profile.caste,
//       preferences.caste.value,
//       preferences.caste.weight.weight
//     );
//     totalPossibleScore += preferences.caste.weight.weight;
//   }

//   // Education matching
//   if (preferences.education.weight.enabled && preferences.education.value) {
//     score += calculateMatchScore(
//       profile.education,
//       preferences.education.value,
//       preferences.education.weight.weight
//     );
//     totalPossibleScore += preferences.education.weight.weight;
//   }

//   // Return 0 if no criteria were evaluated
//   if (totalPossibleScore === 0) return 0;

//   // Calculate percentage score (rounded to nearest integer)
//   return Math.min(100, Math.round((score / totalPossibleScore) * 100));
// }

// // Utility function remains the same
// export function calculateAge(dateOfBirth: string | Date): number {
//   const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
//   const today = new Date();
  
//   let age = today.getFullYear() - dob.getFullYear();
//   const monthDifference = today.getMonth() - dob.getMonth();
  
//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
//     age--;
//   }
  
//   return age;
// }


// // // utils/profileScoring.ts
// // export function calculatePreferenceMatchScore(preferences: UserPreferences, profile: ProfileWithDetails): number {
// //   let score = 0;
// //   let totalPossibleScore = 0;

// // /*************  ✨ Windsurf Command 🌟  *************/
// //   // Helper function to calculate partial matches
// //   // This function takes in the value of the profile,
// //   // the preferred value of the preference, and the weight
// //   // of the preference, and returns the partial score.
// //   // If the value matches the preferred value, the full weight
// //   // is returned. Otherwise, 0 is returned to indicate no partial score.
// //   // This is a basic implementation and may be extended in the future
// //   // to allow for partial scores in more complex preference matches.
// //   const calculatePartialScore = (value: any, preferredValue: any, weight: number) => {
// //     if (value === preferredValue) {
// //       // If the value matches the preferred value, return the full weight
// //       return weight;
// //     } else {
// //       // Otherwise, return 0 to indicate no partial score
// //       return 0;
// //     }
// //     if (value === preferredValue) return weight;
// //     return 0; // No partial score in basic implementation
// //   };
// // /*******  8efa60e7-e2e3-4679-8cca-dfd92e2cdbe6  *******/

// //   // Age matching (only if profile has dateOfBirth)
// //   if (preferences.ageRange.weight.enabled && profile.dateOfBirth) {
// //     const age = calculateAge(profile.dateOfBirth);
// //     if (age >= preferences.ageRange.min && age <= preferences.ageRange.max) {
// //       score += preferences.ageRange.weight.weight;
// //     }
// //     totalPossibleScore += preferences.ageRange.weight.weight;
// //   }

// //   // Height matching (only if profile has height)
// //   if (preferences.heightRange.weight.enabled && profile.profile?.height) {
// //     const height = profile.profile.height;
// //     if (height >= preferences.heightRange.min && height <= preferences.heightRange.max) {
// //       score += preferences.heightRange.weight.weight;
// //     }
// //     totalPossibleScore += preferences.heightRange.weight.weight;
// //   }

// //   // Location matching (only if profile has district)
// //   if (preferences.locations.weight.enabled && profile.profile?.district) {
// //     const isLocationMatch = preferences.locations.districts.includes(profile.profile.district);
// //     if (isLocationMatch) {
// //       score += preferences.locations.weight.weight;
// //     }
// //     totalPossibleScore += preferences.locations.weight.weight;
// //   }

// //   // Religion matching (only if both profile and preferences have religion)
// //   if (preferences.religion.weight.enabled && preferences.religion.value && profile.religion) {
// //     score += calculatePartialScore(profile.religion, preferences.religion.value, preferences.religion.weight.weight);
// //     totalPossibleScore += preferences.religion.weight.weight;
// //   }

// //   // Caste matching (only if both profile and preferences have caste)
// //   if (preferences.caste.weight.enabled && preferences.caste.value && profile.caste) {
// //     score += calculatePartialScore(profile.caste, preferences.caste.value, preferences.caste.weight.weight);
// //     totalPossibleScore += preferences.caste.weight.weight;
// //   }

// //   // Education matching (only if both profile and preferences have education)
// //   if (preferences.education.weight.enabled && preferences.education.value && profile.education) {
// //     score += calculatePartialScore(profile.education, preferences.education.value, preferences.education.weight.weight);
// //     totalPossibleScore += preferences.education.weight.weight;
// //   }

// //   // Return 0 if no criteria were evaluated
// //   if (totalPossibleScore === 0) return 0;

// //   // Calculate percentage score
// //   const percentage = Math.round((score / totalPossibleScore) * 100);
// //   return Math.min(100, percentage);
// // }


// // // utils/profileScoring.ts
// // import { UserPreferences } from '@/types/preferences';

// // export interface ProfileWithDetails {
// //   id: number;
// //   firstName: string;
// //   lastName: string;
// //   dateOfBirth?: string | Date;
// //   education?: string;
// //   occupation?: string;
// //   religion?: string;
// //   caste?: string;
// //   profilePicture?: string;
// //   receivedProposals?: Array<{
// //     senderId: number;
// //     receiverId: number;
// //     status: string;
// //   }>;
// //   sentProposals?: Array<{
// //     senderId: number;
// //     receiverId: number;
// //     status: string;
// //   }>;
// //   profile?: {
// //     profileId?: string;
// //     district?: string;
// //     aboutMe?: string;
// //     height?: number;
// //     photos?: Array<{
// //       url: string;
// //       isMain: boolean;
// //     }>;
// //   };
// //   matchScore?: number;
// //   age?: number;
// // }

// // export function calculateAge(dateOfBirth: string | Date): number {
// //   const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
// //   const today = new Date();
  
// //   let age = today.getFullYear() - dob.getFullYear();
// //   const monthDifference = today.getMonth() - dob.getMonth();
  
// //   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
// //     age--;
// //   }
  
// //   return age;
// // }

// // export function calculatePreferenceMatchScore(preferences: UserPreferences, profile: ProfileWithDetails): number {
// //   let score = 0;
// //   let totalPossibleScore = 0;

// //   // Age matching
// //   if (preferences.ageRange.weight.enabled) {
// //     const age = profile.age || (profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0);
// //     if (age >= preferences.ageRange.min && age <= preferences.ageRange.max) {
// //       score += preferences.ageRange.weight.weight;
// //     } else {
// //       const buffer = 5;
// //       if (age >= preferences.ageRange.min - buffer && age <= preferences.ageRange.max + buffer) {
// //         score += preferences.ageRange.weight.weight * 0.5;
// //       }
// //     }
// //     totalPossibleScore += preferences.ageRange.weight.weight;
// //   }

// //   // Height matching
// //   if (preferences.heightRange.weight.enabled && profile.profile?.height) {
// //     const height = profile.profile.height;
// //     if (height >= preferences.heightRange.min && height <= preferences.heightRange.max) {
// //       score += preferences.heightRange.weight.weight;
// //     } else {
// //       const buffer = 5;
// //       if (height >= preferences.heightRange.min - buffer && height <= preferences.heightRange.max + buffer) {
// //         score += preferences.heightRange.weight.weight * 0.5;
// //       }
// //     }
// //     totalPossibleScore += preferences.heightRange.weight.weight;
// //   }

// //   // Location matching
// //   if (preferences.locations.weight.enabled && profile.profile?.district) {
// //     const districtMatch = preferences.locations.districts.includes(profile.profile.district);
// //     score += districtMatch ? preferences.locations.weight.weight : 0;
// //     totalPossibleScore += preferences.locations.weight.weight;
// //   }

// //   // Religion matching
// //   if (preferences.religion.weight.enabled && preferences.religion.value && profile.religion) {
// //     const religionMatch = profile.religion === preferences.religion.value;
// //     score += religionMatch ? preferences.religion.weight.weight : 0;
// //     totalPossibleScore += preferences.religion.weight.weight;
// //   }

// //   // Caste matching
// //   if (preferences.caste.weight.enabled && preferences.caste.value && profile.caste) {
// //     const casteMatch = profile.caste === preferences.caste.value;
// //     score += casteMatch ? preferences.caste.weight.weight : 0;
// //     totalPossibleScore += preferences.caste.weight.weight;
// //   }

// //   // Education matching
// //   if (preferences.education.weight.enabled && preferences.education.value && profile.education) {
// //     const educationMatch = profile.education === preferences.education.value;
// //     score += educationMatch ? preferences.education.weight.weight : 0;
// //     totalPossibleScore += preferences.education.weight.weight;
// //   }

// //   return totalPossibleScore > 0 ? Math.min(100, Math.round((score / totalPossibleScore) * 100)) : 0;
// // }

// // export function sortProfilesByMatchScore(profiles: ProfileWithDetails[]): ProfileWithDetails[] {
// //   return [...profiles].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
// // }



// // utils/profileScoring.ts

// import { UserPreferences } from '@/types/preferences';

// /**
//  * Interface for profile data with details
//  */
// export interface ProfileWithDetails {
//   id: number;
//   firstName: string;
//   lastName: string;
//   dateOfBirth?: string | Date;
//   education?: string;
//   occupation?: string;
//   profilePicture?: string;
//   receivedProposals?: Array<{
//     senderId: number;
//     receiverId: number;
//     status: string;
//   }>;
//   sentProposals?: Array<{
//     senderId: number;
//     receiverId: number;
//     status: string;
//   }>;
//   profile?: {
//     profileId?: string;
//     district?: string;
//     aboutMe?: string;
//     photos?: Array<{
//       url: string;
//       isMain: boolean;
//     }>;
//   };
//   matchScore?: number;
//   age?: number;
// }

// /**
//  * Calculates age based on date of birth
//  * @param dateOfBirth - Date of birth string or Date object
//  * @returns Number representing age in years
//  */
// export function calculateAge(dateOfBirth: string | Date): number {
//   const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
//   const today = new Date();
  
//   let age = today.getFullYear() - dob.getFullYear();
//   const monthDifference = today.getMonth() - dob.getMonth();
  
//   // If birthday hasn't occurred yet this year, subtract one year
//   if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
//     age--;
//   }
  
//   return age;
// }

// /**
//  * Calculate match score based on user preferences
//  * @param preferences - User's preferences
//  * @param profile - Profile to score against preferences
//  * @returns Match percentage as a number between 0-100
//  */
// export function calculatePreferenceMatchScore(preferences: UserPreferences, profile: ProfileWithDetails): number {
//   let score = 0;
//   let totalPossibleScore = 0;

//   // Age matching
//   if (preferences.ageRange.weight.enabled) {
//     const age = profile.age || (profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : 0);
//     const inRange = age >= preferences.ageRange.min && age <= preferences.ageRange.max;
//     score += inRange ? preferences.ageRange.weight.weight : 0;
//     totalPossibleScore += preferences.ageRange.weight.weight;
//   }

//   // Height matching
//   if (preferences.heightRange.weight.enabled && profile.profile?.height) {
//     const height = profile.profile.height;
//     const inRange = height >= preferences.heightRange.min && height <= preferences.heightRange.max;
//     score += inRange ? preferences.heightRange.weight.weight : 0;
//     totalPossibleScore += preferences.heightRange.weight.weight;
//   }

//   // Location matching
//   if (preferences.locations.weight.enabled && profile.profile?.district) {
//     const districtMatch = preferences.locations.districts.includes(profile.profile.district);
//     score += districtMatch ? preferences.locations.weight.weight : 0;
//     totalPossibleScore += preferences.locations.weight.weight;
//   }

//   // Religion matching
//   if (preferences.religion.weight.enabled && preferences.religion.value && profile.religion) {
//     const religionMatch = profile.religion === preferences.religion.value;
//     score += religionMatch ? preferences.religion.weight.weight : 0;
//     totalPossibleScore += preferences.religion.weight.weight;
//   }

//   // Caste matching
//   if (preferences.caste.weight.enabled && preferences.caste.value && profile.caste) {
//     const casteMatch = profile.caste === preferences.caste.value;
//     score += casteMatch ? preferences.caste.weight.weight : 0;
//     totalPossibleScore += preferences.caste.weight.weight;
//   }

//   // Education matching
//   if (preferences.education.weight.enabled && preferences.education.value && profile.education) {
//     const educationMatch = profile.education === preferences.education.value;
//     score += educationMatch ? preferences.education.weight.weight : 0;
//     totalPossibleScore += preferences.education.weight.weight;
//   }

//   // Calculate percentage if we have any enabled criteria
//   return totalPossibleScore > 0 ? Math.round((score / totalPossibleScore) * 100) : 0;
// }

// /**
//  * Calculate match score between two profiles
//  * @param profileA - First profile
//  * @param profileB - Second profile
//  * @returns Match percentage as a number between 0-100
//  */
// export function calculateProfileMatchScore(profileA: ProfileWithDetails, profileB: ProfileWithDetails): number {
//   let score = 0;
//   let factors = 0;
  
//   // Education match
//   if (profileA.education && profileB.education) {
//     if (profileA.education === profileB.education) {
//       score += 100;
//     } else {
//       // Partial match for similar education levels
//       const educationKeywords = ['Bachelor', 'Master', 'PhD', 'Graduate', 'College'];
//       const matchedKeywords = educationKeywords.filter(keyword => 
//         profileA.education?.includes(keyword) && profileB.education?.includes(keyword)
//       );
//       if (matchedKeywords.length > 0) {
//         score += 50;
//       }
//     }
//     factors++;
//   }
  
//   // Age compatibility (within 5 years)
//   if (profileA.dateOfBirth && profileB.dateOfBirth) {
//     const ageA = calculateAge(profileA.dateOfBirth);
//     const ageB = calculateAge(profileB.dateOfBirth);
//     const ageDifference = Math.abs(ageA - ageB);
    
//     if (ageDifference <= 2) {
//       score += 100;
//     } else if (ageDifference <= 5) {
//       score += 75;
//     } else if (ageDifference <= 10) {
//       score += 50;
//     } else {
//       score += 25;
//     }
//     factors++;
//   }
  
//   // Location match
//   if (profileA.profile?.district && profileB.profile?.district) {
//     if (profileA.profile.district === profileB.profile.district) {
//       score += 100;
//     }
//     factors++;
//   }
  
//   // Occupation compatibility
//   if (profileA.occupation && profileB.occupation) {
//     if (profileA.occupation === profileB.occupation) {
//       score += 100;
//     }
//     factors++;
//   }
  
//   // If no factors were compared, return a default score
//   if (factors === 0) {
//     return 50;
//   }
  
//   // Return the average score
//   return Math.round(score / factors);
// }

// /**
//  * Sort profiles by match score
//  * @param profiles - Array of profiles with match scores
//  * @returns Sorted array of profiles (highest match score first)
//  */
// export function sortProfilesByMatchScore(profiles: ProfileWithDetails[]): ProfileWithDetails[] {
//   return [...profiles].sort((a, b) => {
//     // Sort descending (highest match score first)
//     return (b.matchScore || 0) - (a.matchScore || 0);
//   });
// }


// // utils/profileScoring.ts



// import { UserPreferences } from '@/types/preferences';

// export function calculateMatchScore(preferences: UserPreferences, profile: ProfileWithDetails): number {
//   // Your existing match score calculation logic
//   let score = 0;
//   let totalPossibleScore = 0;

//   // Age matching
//   if (preferences.ageRange.weight.enabled) {
//     const age = profile.age;
//     const inRange = age >= preferences.ageRange.min && age <= preferences.ageRange.max;
//     score += inRange ? preferences.ageRange.weight.weight : 0;
//     totalPossibleScore += preferences.ageRange.weight.weight;
//   }

//   // Add other criteria (height, location, etc.) similarly...

//   return totalPossibleScore > 0 ? (score / totalPossibleScore) * 100 : 0;
// }

// export function sortProfilesByMatchScore(profiles: ProfileWithDetails[]): ProfileWithDetails[] {
//   return [...profiles].sort((a, b) => {
//     // Sort descending (highest match score first)
//     return (b.matchScore || 0) - (a.matchScore || 0);
//   });
// }


// // // utils/profileScoring.ts

// // /**
// //  * Interface for profile data with details
// //  */
// export interface ProfileWithDetails {
//     id: number;
//     firstName: string;
//     lastName: string;
//     dateOfBirth?: string | Date;
//     education?: string;
//     occupation?: string;
//     profilePicture?: string;
//     receivedProposals?: Array<{
//       senderId: number;
//       receiverId: number;
//       status: string;
//     }>;
//     sentProposals?: Array<{
//       senderId: number;
//       receiverId: number;
//       status: string;
//     }>;
//     profile?: {
//       profileId?: string;
//       district?: string;
//       aboutMe?: string;
//       photos?: Array<{
//         url: string;
//         isMain: boolean;
//       }>;
//     };
//   }
  
//   /**
//    * Calculates age based on date of birth
//    * @param dateOfBirth - Date of birth string or Date object
//    * @returns Number representing age in years
//    */
//   export function calculateAge(dateOfBirth: string | Date): number {
//     const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
//     const today = new Date();
    
//     let age = today.getFullYear() - dob.getFullYear();
//     const monthDifference = today.getMonth() - dob.getMonth();
    
//     // If birthday hasn't occurred yet this year, subtract one year
//     if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
//       age--;
//     }
    
//     return age;
//   }
  
//   /**
//    * Calculate match score between two profiles
//    * @param profileA - First profile
//    * @param profileB - Second profile
//    * @returns Match percentage as a number between 0-100
//    */
//   export function calculateMatchScore(profileA: ProfileWithDetails, profileB: ProfileWithDetails): number {
//     let score = 0;
//     let factors = 0;
    
//     // Education match
//     if (profileA.education && profileB.education) {
//       if (profileA.education === profileB.education) {
//         score += 100;
//       } else {
//         // Partial match for similar education levels
//         const educationKeywords = ['Bachelor', 'Master', 'PhD', 'Graduate', 'College'];
//         const matchedKeywords = educationKeywords.filter(keyword => 
//           profileA.education?.includes(keyword) && profileB.education?.includes(keyword)
//         );
//         if (matchedKeywords.length > 0) {
//           score += 50;
//         }
//       }
//       factors++;
//     }
    
//     // Age compatibility (within 5 years)
//     if (profileA.dateOfBirth && profileB.dateOfBirth) {
//       const ageA = calculateAge(profileA.dateOfBirth);
//       const ageB = calculateAge(profileB.dateOfBirth);
//       const ageDifference = Math.abs(ageA - ageB);
      
//       if (ageDifference <= 2) {
//         score += 100;
//       } else if (ageDifference <= 5) {
//         score += 75;
//       } else if (ageDifference <= 10) {
//         score += 50;
//       } else {
//         score += 25;
//       }
//       factors++;
//     }
    
//     // Location match
//     if (profileA.profile?.district && profileB.profile?.district) {
//       if (profileA.profile.district === profileB.profile.district) {
//         score += 100;
//       }
//       factors++;
//     }
    
//     // Occupation compatibility
//     if (profileA.occupation && profileB.occupation) {
//       if (profileA.occupation === profileB.occupation) {
//         score += 100;
//       }
//       factors++;
//     }
    
//     // If no factors were compared, return a default score
//     if (factors === 0) {
//       return 50;
//     }
    
//     // Return the average score
//     return Math.round(score / factors);
//   }
