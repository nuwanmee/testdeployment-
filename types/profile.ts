// types/profile.ts

import { z } from 'zod'

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  approvedAt: z.string().datetime().optional().nullable(),
  rejectedAt: z.string().datetime().optional().nullable(),
  // Add other profile fields as needed
});

export type Profile = z.infer<typeof profileSchema>;
export interface ProfileWithDetails {
  id: number;
  profileId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | null;
  age?: number;
  education?: string | null;
  occupation?: string | null;
  religion?: string | null;
  caste?: string | null;
  profilePicture?: string | null;
  isVerified?: boolean;
  isProfileComplete?: boolean;
  lastLogin?: string;
  matchScore?: number;
  
  profile?: {
    district?: string | null;
    aboutMe?: string | null;
    height?: number | null;
    photos?: {
      url: string;
      isMain: boolean;
    }[];
  };
  
  receivedProposals?: {
    senderId: number;
    receiverId: number;
    status: string;
  }[];
  
  sentProposals?: {
    senderId: number;
    receiverId: number;
    status: string;
  }[];
}

export interface UserPreferences {
  ageRange: {
    min: number;
    max: number;
    weight: { weight: number; enabled: boolean };
  };
  heightRange: {
    min: number;
    max: number;
    weight: { weight: number; enabled: boolean };
  };
  locations: {
    districts: string[];
    weight: { weight: number; enabled: boolean };
  };
  religion: {
    value: string | null;
    weight: { weight: number; enabled: boolean };
  };
  caste: {
    value: string | null;
    weight: { weight: number; enabled: boolean };
  };
  education: {
    value: string | null;
    weight: { weight: number; enabled: boolean };
  };
}