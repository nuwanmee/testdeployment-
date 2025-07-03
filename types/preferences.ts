import { z } from 'zod';

const weightSchema = z.object({
  weight: z.number().min(0).max(100),
  enabled: z.boolean()
});

const rangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  weight: weightSchema
}).refine(data => data.min <= data.max, {
  message: "Min must be less than or equal to Max",
  path: ["min"]
});

const selectablePreferenceSchema = z.object({
  value: z.string().nullable(),
  weight: weightSchema
});

export const userPreferencesSchema = z.object({
  ageRange: rangeSchema.refine(data => data.min >= 18 && data.max <= 100, {
    message: "Age must be between 18 and 100"
  }),
  heightRange: rangeSchema.refine(data => data.min >= 140 && data.max <= 220, {
    message: "Height must be between 140cm and 220cm"
  }),
  locations: z.object({
    districts: z.array(z.string()),
    weight: weightSchema
  }),
  religion: selectablePreferenceSchema,
  caste: selectablePreferenceSchema,
  education: selectablePreferenceSchema
});

export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// // types/preferences.ts

// // Base weight type for preference fields
// export interface PreferenceWeight {
//     enabled: boolean;
//     weight: number;
//   }
  
//   // Base preference field with a value and weight
//   export interface PreferenceField<T> {
//     value: T | null;
//     weight: PreferenceWeight;
//   }
  
//   // Range type with min/max and weight
//   export interface RangePreference {
//     min: number;
//     max: number;
//     weight: PreferenceWeight;
//   }
  
//   // Location preferences
//   export interface LocationPreference {
//     districts: string[];
//     weight: PreferenceWeight;
//   }
  
//   // Complete user preferences structure
//   export interface UserPreferences {
//     ageRange: RangePreference;
//     heightRange: RangePreference;
//     locations: LocationPreference;
//     religion: PreferenceField<string>;
//     caste: PreferenceField<string>;
//     education: PreferenceField<string>;
//   }