import { create } from 'zustand';

interface Profile {
  id: string; // Frontend uses string IDs
  userId: string;
  status: 'pending' | 'approved' | 'refused'; // Matches Prisma schema
  sex?: string | null;
  birthday?: string | null;
  district?: string | null;
  familyDetails?: string | null;
  hobbies?: string | null;
  expectations?: string | null;
  education?: string | null;
  occupation?: string | null;
  religion?: string | null;
  caste?: string | null;
  height?: number | null;
  maritalStatus?: string | null;
  motherTongue?: string | null;
  annualIncome?: string | null;
  aboutMe?: string | null;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  approvedBy?: string | null;
  photos: { id: string; url: string; isMain: boolean }[];
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    profilePicture?: string | null;
  };
}

interface ProfileState {
  pendingProfiles: Profile[];
  approvedProfiles: Profile[];
  refusedProfiles: Profile[];
  loading: boolean;
  error: string | null;
  fetchProfiles: () => Promise<void>;
  approveProfile: (id: string) => Promise<void>;
  refuseProfile: (id: string) => Promise<void>;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  pendingProfiles: [],
  approvedProfiles: [],
  refusedProfiles: [],
  loading: false,
  error: null,
  
  fetchProfiles: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/admin/profiles', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch profiles: ${errorText}`);
      }

      const data = await response.json();
      
      // Convert backend data to frontend format
      const transformProfile = (profile: any): Profile => ({
        ...profile,
        id: String(profile.id),
        userId: String(profile.userId),
        photos: profile.photos?.map((photo: any) => ({
          id: String(photo.id),
          url: photo.url,
          isMain: photo.isMain
        })) || [],
        user: {
          id: String(profile.user?.id),
          name: profile.user?.name,
          email: profile.user?.email,
          profilePicture: profile.user?.profilePicture
        }
      });

      const profiles = Array.isArray(data) 
        ? data.map(transformProfile)
        : [];

      set({
        pendingProfiles: profiles.filter(p => p.status === 'pending'),
        approvedProfiles: profiles.filter(p => p.status === 'approved'),
        refusedProfiles: profiles.filter(p => p.status === 'refused'),
        loading: false
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to load profiles',
        loading: false
      });
    }
  },

  approveProfile: async (id: string) => {
    try {
      set({ loading: true, error: null });
      
      const response = await fetch(`/api/admin/profiles/${id}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Approval failed: ${response.status}`);
      }

      const updatedProfile = await response.json();

      set((state) => ({
        pendingProfiles: state.pendingProfiles.filter(p => p.id !== id),
        approvedProfiles: [...state.approvedProfiles, {
          ...updatedProfile,
          id: String(updatedProfile.id),
          userId: String(updatedProfile.userId)
        }],
        loading: false
      }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Approval failed',
        loading: false
      });
    }
  },
  
   refuseProfile: async (id) => {
    try {
      set({ loading: true });
      const response = await fetch(`/api/admin/profiles/${id}/refuse`, {
        method: 'PUT'
      });
      const updatedProfile = await response.json();
      set((state) => ({
        pendingProfiles: state.pendingProfiles.filter(p => p.id !== id),
        refusedProfiles: [...state.refusedProfiles, updatedProfile],
        loading: false
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  
  reset: () => {
    set({
      pendingProfiles: [],
      approvedProfiles: [],
      refusedProfiles: [],
      loading: false,
      error: null,
    });
  },
}));

// // // stores/profileStore.ts
// import { create } from 'zustand';

// interface Profile {
//   id: string; // Frontend uses string IDs
//   name: string;
//   email?: string;
//   status: 'PENDING' | 'APPROVED' | 'REJECTED';
//   createdAt: string;
//   updatedAt: string;
//   approvedAt?: string | null;
//   rejectedAt?: string | null;
// }

// interface ProfileState {
//   pendingProfiles: Profile[];
//   approvedProfiles: Profile[];
//   rejectedProfiles: Profile[];
//   loading: boolean;
//   error: string | null;
//   fetchProfiles: () => Promise<void>;
//   approveProfile: (id: string) => Promise<void>;
//   rejectProfile: (id: string) => Promise<void>;
//   reset: () => void;
// }

// export const useProfileStore = create<ProfileState>((set) => ({
//   pendingProfiles: [],
//   approvedProfiles: [],
//   rejectedProfiles: [],
//   loading: false,
//   error: null,
  
//   // stores/profileStore.ts
// fetchProfiles: async () => {
//   set({ loading: true, error: null });
  
//   try {
//     console.log('Fetching profiles from API...');
//     const response = await fetch('/api/admin/profiles', {
//       credentials: 'include',
//       headers: { 'Content-Type': 'application/json' }
//     });

//     if (response.status === 401) {
//       console.log('Unauthorized - redirecting to login');
//       window.location.href = '/login';
//       return;
//     }

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('Fetch error:', errorText);
//       throw new Error(`Failed to fetch profiles: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log('Raw API response:', data);

    

//     const isValidProfile = (p: any): p is Profile => {
//       const isValid = p?.id && p?.name && ['PENDING', 'APPROVED', 'REJECTED'].includes(p.status);
//       if (!isValid) {
//         console.warn('Invalid profile:', p);
//       }
//       return isValid;
//     };

//     const profiles = Array.isArray(data) ? data.filter(isValidProfile) : [];
//     console.log('Filtered profiles:', profiles);

//     set({
//       pendingProfiles: profiles.filter(p => p.status === 'PENDING'),
//       approvedProfiles: profiles.filter(p => p.status === 'APPROVED'),
//       rejectedProfiles: profiles.filter(p => p.status === 'REJECTED'),
//       loading: false
//     });
//   } catch (err) {
//     console.error('Error in fetchProfiles:', err);
//     set({
//       error: err instanceof Error ? err.message : 'Failed to load profiles',
//       loading: false
//     });
//   }
// },
//   approveProfile: async (id: string) => {
//     try {
//       set({ loading: true, error: null });
      
//       const response = await fetch(`/api/admin/profiles/${id}`, {
//         method: 'PUT',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'approve' })
//       });

//       if (!response.ok) {
//         throw new Error(`Approval failed: ${response.status}`);
//       }

//       const updatedProfile = await response.json();

//       set((state) => ({
//         pendingProfiles: state.pendingProfiles.filter(p => p.id !== id),
//         approvedProfiles: [...state.approvedProfiles, updatedProfile],
//         loading: false
//       }));
//     } catch (err) {
//       set({
//         error: err instanceof Error ? err.message : 'Approval failed',
//         loading: false
//       });
//     }
//   },
  
//   rejectProfile: async (id: string) => {
//     try {
//       set({ loading: true, error: null });
      
//       const response = await fetch(`/api/admin/profiles/${id}`, {
//         method: 'PUT',
//         credentials: 'include',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'reject' })
//       });

//       if (!response.ok) {
//         throw new Error(`Rejection failed: ${response.status}`);
//       }

//       const updatedProfile = await response.json();

//       set((state) => ({
//         pendingProfiles: state.pendingProfiles.filter(p => p.id !== id),
//         rejectedProfiles: [...state.rejectedProfiles, updatedProfile],
//         loading: false
//       }));
//     } catch (err) {
//       set({
//         error: err instanceof Error ? err.message : 'Rejection failed',
//         loading: false
//       });
//     }
//   },
  
//   reset: () => {
//     set({
//       pendingProfiles: [],
//       approvedProfiles: [],
//       rejectedProfiles: [],
//       loading: false,
//       error: null,
//     });
//   },
// }));

// // stores/profileStore.ts
// import { create } from 'zustand';
// import type { ProfileStatus } from '@/types';

// interface Profile {
//   id: string;
//   name: string;
//   email?: string;
//   status: ProfileStatus;
//   createdAt: string;
//   updatedAt: string;
//   approvedAt?: string | null;
//   rejectedAt?: string | null;
// }

// interface ProfileState {
//   pendingProfiles: Profile[];
//   approvedProfiles: Profile[];
//   rejectedProfiles: Profile[];
//   loading: boolean;
//   error: string | null;
//   fetchProfiles: () => Promise<void>;
//   approveProfile: (id: string) => Promise<void>;
//   rejectProfile: (id: string) => Promise<void>;
// }

// export const useProfileStore = create<ProfileState>((set) => ({
//   pendingProfiles: [],
//   approvedProfiles: [],
//   rejectedProfiles: [],
//   loading: false,
//   error: null,
  
//   fetchProfiles: async () => {
//    set({ loading: true, error: null });
//   try {
//     // First get the session
//     const sessionResponse = await fetch('/api/auth/session');
//     const session = await sessionResponse.json();
    
//     if (!session?.user) {
//       throw new Error('Not authenticated');
//     }

//     // Then fetch profiles with credentials
//     const response = await fetch('/api/admin/profiles', {
//       credentials: 'include', // Crucial for session cookies
//       headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${session?.accessToken}` // Use proper token
//     }
//       // headers: {
//       //   'Content-Type': 'application/json',
//       //   // If using token-based auth:
//       //   'Authorization': `Bearer ${session.accessToken}`
//       // }
//     });
    
//     if (response.status === 401) {
//       // Redirect to login if unauthorized
//       window.location.href = '/login';
//       return;
//     }
      
//       if (!response.ok) {
//         throw new Error(`Failed to fetch profiles: ${response.status}`);
//       }
      
//       const data = await response.json();
      
//       // Type guard validation (optional)
//       const isValidProfile = (p: any): p is Profile => {
//         return ['PENDING', 'APPROVED', 'REJECTED'].includes(p.status);
//       };
      
//       const profiles = data.filter(isValidProfile);
      
//       set({
//         pendingProfiles: profiles.filter(p => p.status === 'PENDING'),
//         approvedProfiles: profiles.filter(p => p.status === 'APPROVED'),
//         rejectedProfiles: profiles.filter(p => p.status === 'REJECTED'),
//         loading: false
//       });
//     } catch (err) {
//       set({
//         error: err instanceof Error ? err.message : 'Unknown error',
//         loading: false
//       });
//     }
//   },
//   approveProfile: async (id: string) => {
//     try {
//       set((state) => ({
//         pendingProfiles: state.pendingProfiles.filter((p) => p.id !== id),
//       }));
      
//       const response = await fetch(`/api/admin/profiles/${id}/approve`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error(`Approval failed: ${response.status}`);
//       }
      
//       const updatedProfile = await response.json();
//       const validatedProfile = profileSchema.parse(updatedProfile);
      
//       set((state) => ({
//         approvedProfiles: [...state.approvedProfiles, validatedProfile],
//       }));
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Approval failed';
//       set({ error: errorMessage });
//       console.error('Error approving profile:', err);
//       // Re-fetch to reset state
//       useProfileStore.getState().fetchProfiles();
//     }
//   },
  
//   rejectProfile: async (id: string) => {
//     try {
//       set((state) => ({
//         pendingProfiles: state.pendingProfiles.filter((p) => p.id !== id),
//       }));
      
//       const response = await fetch(`/api/admin/profiles/${id}/reject`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (!response.ok) {
//         throw new Error(`Rejection failed: ${response.status}`);
//       }
      
//       const updatedProfile = await response.json();
//       const validatedProfile = profileSchema.parse(updatedProfile);
      
//       set((state) => ({
//         rejectedProfiles: [...state.rejectedProfiles, validatedProfile],
//       }));
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Rejection failed';
//       set({ error: errorMessage });
//       console.error('Error rejecting profile:', err);
//       // Re-fetch to reset state
//       useProfileStore.getState().fetchProfiles();
//     }
//   },
  
//   reset: () => {
//     set({
//       pendingProfiles: [],
//       approvedProfiles: [],
//       rejectedProfiles: [],
//       loading: false,
//       error: null,
//     });
//   },
// }));