import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, ArrowUp, ArrowDown, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface UserInsightsProps {
  users: Array<{
    id: string
    name: string
    email: string
    avatar?: string
    joined: string
    status: 'active' | 'pending' | 'inactive'
  }>
  growth: number
}

export function UserInsights({ users, growth }: UserInsightsProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle>User Insights</CardTitle>
          <Badge 
            variant={growth >= 0 ? 'positive' : 'negative'} 
            className="flex items-center gap-1"
          >
            {growth >= 0 ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {Math.abs(growth)}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <Users className="h-5 w-5 text-primary mb-1" />
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-semibold">{users.length}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <UserPlus className="h-5 w-5 text-green-500 mb-1" />
            <span className="text-sm text-muted-foreground">New</span>
            <span className="font-semibold">
              {users.filter(u => u.status === 'active').length}
            </span>
          </div>
          <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
            <UserPlus className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-sm text-muted-foreground">Pending</span>
            <span className="font-semibold">
              {users.filter(u => u.status === 'pending').length}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Recent Signups</h3>
          <div className="space-y-3">
            {users.slice(0, 4).map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Badge 
                  variant={
                    user.status === 'active' 
                      ? 'positive' 
                      : user.status === 'pending' 
                        ? 'warning' 
                        : 'negative'
                  }
                  className="text-xs capitalize"
                >
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}