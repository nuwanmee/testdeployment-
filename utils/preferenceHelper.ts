// utils/preferenceHelpers.ts
import { UserPreferences } from '@/types/preferences';
import { prisma } from '@/lib/prisma';

export async function saveUserPreferences(userId: number, preferences: UserPreferences) {
  // Prepare weight settings for storage
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

  try {
    return await prisma.preference.upsert({
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
  } catch (error) {
    console.error('Error saving preferences:', error);
    throw error;
  }
}