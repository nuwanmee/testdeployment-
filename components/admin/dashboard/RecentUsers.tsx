import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserWithProfile {
  id: number
  email: string
  profile?: {
    status: 'pending' | 'approved' | 'refused'
  }
  createdAt: Date
}

export default function RecentUsers({ users }: { users: UserWithProfile[] }) {
  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div key={user.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-sm text-muted-foreground">
              {user.profile 
                ? `Profile: ${user.profile.status}`
                : 'No profile yet'}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${user.id}`}>
              Manage
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}