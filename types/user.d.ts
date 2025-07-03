// types/user.d.ts
interface User {
  id: number
  email: string
  status: 'active' | 'inactive'
  profile?: Profile
  createdAt: Date
  updatedAt: Date
}

// types/profile.d.ts
interface Profile {
  id: number
  userId: number
  status: 'pending' | 'approved' | 'refused'
  lastUpdated: Date
  profileId: number | undefined;
}