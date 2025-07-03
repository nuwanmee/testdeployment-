
import { UserPreferences } from '@/types/preferences';
export function convertPreferenceFromDB(dbPreference: any): UserPreferences {
  return {
    ageRange: {
      min: dbPreference.ageMin || 18,
      max: dbPreference.ageMax || 50,
      weight: {
        weight: dbPreference.ageWeight || 70,
        enabled: dbPreference.ageEnabled ?? true
      }
    },
    heightRange: {
      min: dbPreference.heightMin || 150,
      max: dbPreference.heightMax || 190,
      weight: {
        weight: dbPreference.heightWeight || 50,
        enabled: dbPreference.heightEnabled ?? true
      }
    },
    locations: {
      districts: dbPreference.locations ? JSON.parse(dbPreference.locations) : [],
      weight: {
        weight: dbPreference.locationsWeight || 80,
        enabled: dbPreference.locationsEnabled ?? true
      }
    },
    religion: {
      value: dbPreference.religion || null,
      weight: {
        weight: dbPreference.religionWeight || 60,
        enabled: dbPreference.religionEnabled ?? false
      }
    },
    caste: {
      value: dbPreference.caste || null,
      weight: {
        weight: dbPreference.casteWeight || 40,
        enabled: dbPreference.casteEnabled ?? false
      }
    },
    education: {
      value: dbPreference.education || null,
      weight: {
        weight: dbPreference.educationWeight || 50,
        enabled: dbPreference.educationEnabled ?? false
      }
    }
  };
}

// // utils/PreferenceConverter.ts
// import { UserPreferences } from '@/types/preferences';

// export function convertPreferenceFromDB(dbPreference: any): UserPreferences {
//   let weightSettings = {};
//   try {
//     if (dbPreference.otherPreferences) {
//       weightSettings = JSON.parse(dbPreference.otherPreferences)?.weights || {};
//     }
//   } catch (error) {
//     console.error('Error parsing otherPreferences:', error);
//   }

//   return {
//     ageRange: {
//       min: dbPreference.ageRangeMin || 18,
//       max: dbPreference.ageRangeMax || 50,
//       weight: {
//         weight: weightSettings?.age?.weight || 70,
//         enabled: weightSettings?.age?.enabled ?? true
//       }
//     },
//     heightRange: {
//       min: dbPreference.heightRangeMin || 150,
//       max: dbPreference.heightRangeMax || 190,
//       weight: {
//         weight: weightSettings?.height?.weight || 50,
//         enabled: weightSettings?.height?.enabled ?? true
//       }
//     },
//     locations: {
//       districts: dbPreference.preferredLocation?.split(',') || [],
//       weight: {
//         weight: weightSettings?.location?.weight || 80,
//         enabled: weightSettings?.location?.enabled ?? true
//       }
//     },
//     religion: {
//       value: dbPreference.preferredReligion || null,
//       weight: {
//         weight: weightSettings?.religion?.weight || 60,
//         enabled: weightSettings?.religion?.enabled ?? false
//       }
//     },
//     caste: {
//       value: dbPreference.preferredCaste || null,
//       weight: {
//         weight: weightSettings?.caste?.weight || 40,
//         enabled: weightSettings?.caste?.enabled ?? false
//       }
//     },
//     education: {
//       value: dbPreference.preferredEducation || null,
//       weight: {
//         weight: weightSettings?.education?.weight || 50,
//         enabled: weightSettings?.education?.enabled ?? false
//       }
//     }
//   };
// }



// // utils/preferenceConverter.ts
// import { UserPreferences } from '@/types/preferences';

// // Default preferences as fallback
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

// // Convert DB preference to app format
// export function convertPreferenceFromDB(dbPreference: any): UserPreferences {
//   // Parse otherPreferences JSON if it exists
//   let weightSettings;
//   try {
//     if (dbPreference.otherPreferences) {
//       const otherPrefs = JSON.parse(dbPreference.otherPreferences);
//       weightSettings = otherPrefs.weights || {};
//     }
//   } catch (error) {
//     console.error('Error parsing otherPreferences:', error);
//     weightSettings = {};
//   }
  
//   // Get preferred locations as array
//   const districts = dbPreference.preferredLocation 
//     ? dbPreference.preferredLocation.split(',')
//     : [];
  
//   // Build preferences object
//   const preferences: UserPreferences = {
//     ageRange: {
//       min: dbPreference.ageRangeMin || DEFAULT_PREFERENCES.ageRange.min,
//       max: dbPreference.ageRangeMax || DEFAULT_PREFERENCES.ageRange.max,
//       weight: {
//         weight: weightSettings?.age?.weight || DEFAULT_PREFERENCES.ageRange.weight.weight,
//         enabled: weightSettings?.age?.enabled !== undefined 
//           ? weightSettings.age.enabled 
//           : DEFAULT_PREFERENCES.ageRange.weight.enabled
//       }
//     },
//     heightRange: {
//       min: dbPreference.heightRangeMin || DEFAULT_PREFERENCES.heightRange.min,
//       max: dbPreference.heightRangeMax || DEFAULT_PREFERENCES.heightRange.max,
//       weight: {
//         weight: weightSettings?.height?.weight || DEFAULT_PREFERENCES.heightRange.weight.weight,
//         enabled: weightSettings?.height?.enabled !== undefined 
//           ? weightSettings.height.enabled 
//           : DEFAULT_PREFERENCES.heightRange.weight.enabled
//       }
//     },
//     locations: {
//       districts,
//       weight: {
//         weight: weightSettings?.location?.weight || DEFAULT_PREFERENCES.locations.weight.weight,
//         enabled: weightSettings?.location?.enabled !== undefined 
//           ? weightSettings.location.enabled 
//           : DEFAULT_PREFERENCES.locations.weight.enabled
//       }
//     },
//     religion: {
//       value: dbPreference.religion || DEFAULT_PREFERENCES.religion.value,
//       weight: {
//         weight: weightSettings?.religion?.weight || DEFAULT_PREFERENCES.religion.weight.weight,
//         enabled: weightSettings?.religion?.enabled !== undefined 
//           ? weightSettings.religion.enabled 
//           : DEFAULT_PREFERENCES.religion.weight.enabled
//       }
//     },
//     caste: {
//       value: dbPreference.caste || DEFAULT_PREFERENCES.caste.value,
//       weight: {
//         weight: weightSettings?.caste?.weight || DEFAULT_PREFERENCES.caste.weight.weight,
//         enabled: weightSettings?.caste?.enabled !== undefined 
//           ? weightSettings.caste.enabled 
//           : DEFAULT_PREFERENCES.caste.weight.enabled
//       }
//     },
//     education: {
//       value: dbPreference.education || DEFAULT_PREFERENCES.education.value,
//       weight: {
//         weight: weightSettings?.education?.weight || DEFAULT_PREFERENCES.education.weight.weight,
//         enabled: weightSettings?.education?.enabled !== undefined 
//           ? weightSettings.education.enabled 
//           : DEFAULT_PREFERENCES.education.weight.enabled
//       }
//     }
//   };

//   return preferences;
// }