import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import Link from 'next/link'

interface ProfileWithUser {
  id: number
  status: 'pending' | 'approved' | 'refused'
  user: {
    id: number
    email: string
  }
  updatedAt: Date
}

export default function RecentApprovals({ approvals }: { approvals: ProfileWithUser[] }) {
  return (
    <div className="space-y-4">
      {approvals.map((profile) => (
        <div key={profile.id} className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {profile.user.email}
            </p>
            <p className={`text-sm ${
              profile.status === 'approved' 
                ? 'text-green-500' 
                : profile.status === 'refused'
                ? 'text-red-500'
                : 'text-yellow-500'
            }`}>
              {profile.status}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/users/${profile.user.id}`}>
              View
            </Link>
          </Button>
        </div>
      ))}
    </div>
  )
}