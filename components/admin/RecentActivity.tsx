import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export function RecentActivity({ approvals }: { approvals: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 items-center gap-4 text-sm text-muted-foreground font-medium">
          <div>User</div>
          <div>Status</div>
          <div>Date</div>
          <div className="text-right">Action</div>
        </div>
        <div className="space-y-3">
          {approvals.map((approval) => (
            <div key={approval.id} className="grid grid-cols-4 items-center gap-4">
              <div className="font-medium truncate">{approval.name}</div>
              <div className="flex items-center">
                {approval.status === 'approved' && (
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                )}
                {approval.status === 'rejected' && (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                {approval.status === 'pending' && (
                  <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                )}
                <span className="capitalize">{approval.status}</span>
              </div>
              <div className="text-sm text-muted-foreground">{approval.date}</div>
              <div className="text-right">
                <button className="text-primary hover:underline text-sm">View</button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}