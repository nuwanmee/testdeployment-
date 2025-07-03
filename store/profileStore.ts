// store/profileStore.ts
import { create } from 'zustand'

interface Profile {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  isActive: boolean
  // other profile fields
}

interface ProfileState {
  profiles: Profile[]
  pendingCount: number
  approvedCount: number
  rejectedCount: number
  addProfile: (profile: Profile) => void
  updateProfile: (id: string, updates: Partial<Profile>) => void
  approveProfile: (id: string) => void
  rejectProfile: (id: string) => void
  toggleActive: (id: string) => void
}

const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  pendingCount: 0,
  approvedCount: 0,
  rejectedCount: 0,
  

addProfile: (profile) => set(state => ({
  profiles: [...state.profiles, {...profile, status: 'pending'}],
  pendingCount: state.pendingCount + 1
})),

//   addProfile: (profile) => set((state) => ({
//     profiles: [...state.profiles, {...profile, status: 'pending'}],
//     pendingCount: state.pendingCount + 1
//   })),
  

  updateProfile: (id, updates) => set((state) => {
    const updated = state.profiles.map(p => 
      p.id === id ? {...p, ...updates, status: 'pending'} : p
    )
    return { profiles: updated }
  }),
  
  approveProfile: (id) => set((state) => {
    const updated = state.profiles.map(p => 
      p.id === id ? {...p, status: 'approved'} : p
    )
    return {
      profiles: updated,
      pendingCount: state.pendingCount - 1,
      approvedCount: state.approvedCount + 1
    }
  }),


  rejectProfile: (id) => set((state) => {
  const updated = state.profiles.map(p => 
    p.id === id ? {...p, status: 'rejected'} : p
  )
  return {
    profiles: updated,
    pendingCount: state.pendingCount - 1,
    rejectedCount: state.rejectedCount + 1
  }
}),

toggleActive: (id) => set((state) => {
  const updated = state.profiles.map(p => 
    p.id === id ? {...p, isActive: !p.isActive} : p
  )
  return { profiles: updated }
})
}))