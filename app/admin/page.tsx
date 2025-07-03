// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { getAdminStats } from '@/lib/admin/actions/dashboard-actions'
// import { RecentApprovals } from '@/components/admin/dashboard/RecentApprovals'
// import { RecentUsers } from '@/components/admin/dashboard/RecentUsers'
// import { Activity, Users, CheckCircle, XCircle, Clock } from 'lucide-react'


// export default async function AdminDashboard() {
//   const stats = await getAdminStats()
  
//   return (
//     <div className="container mx-auto py-6">
//       <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
//       {/* Stats Overview Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
//         <DashboardCard 
//           title="Total Users" 
//           value={stats.totalUsers} 
//           icon={<Users className="h-4 w-4" />}
//           trend={stats.userGrowth}
//         />
//         <DashboardCard 
//           title="Active Users" 
//           value={stats.activeUsers} 
//           icon={<Activity className="h-4 w-4" />}
//         />
//         <DashboardCard 
//           title="Pending Approvals" 
//           value={stats.pendingApprovals} 
//           icon={<Clock className="h-4 w-4" />}
//         />
//         <DashboardCard 
//           title="Approved Profiles" 
//           value={stats.approvedProfiles} 
//           icon={<CheckCircle className="h-4 w-4" />}
//         />
//         <DashboardCard 
//           title="Refused Profiles" 
//           value={stats.refusedProfiles} 
//           icon={<XCircle className="h-4 w-4" />}
//         />
//       </div>

//       {/* Recent Activity Sections */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//         <Card className="col-span-4">
//           <CardHeader>
//             <CardTitle>Recent Approvals</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <RecentApprovals approvals={stats.recentApprovals} />
//           </CardContent>
//         </Card>
        
//         <Card className="col-span-3">
//           <CardHeader>
//             <CardTitle>New Registrations</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <RecentUsers users={stats.recentUsers} />
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

// function DashboardCard({ title, value, icon, trend }: {
//   title: string
//   value: number
//   icon: React.ReactNode
//   trend?: number
// }) {
//   return (
//     <Card>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium">{title}</CardTitle>
//         <div className="h-4 w-4 text-muted-foreground">{icon}</div>
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold">{value}</div>
//         {trend !== undefined && (
//           <p className="text-xs text-muted-foreground">
//             {trend >= 0 ? `+${trend}` : trend}% from last month
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   )
// }



// // // app/admin/page.tsx
// // import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// // import { getAdminStats } from '@/lib/admin/actions/dashboard-actions'
// // import { RecentApprovals } from '@/components/admin/dashboard/RecentApprovals'
// // import { RecentUsers } from '@/components/admin/dashboard/RecentUsers'
// // import { Activity, Users, CheckCircle, XCircle, Clock } from 'lucide-react'

// // export default async function AdminDashboard() {
// //   const stats = await getAdminStats()
  
// //   return (
// //     <div className="container mx-auto py-6">
// //       <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
// //       {/* Stats Overview Cards */}
// //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
// //         <DashboardCard 
// //           title="Total Users" 
// //           value={stats.totalUsers} 
// //           icon={<Users className="h-4 w-4" />}
// //           trend={stats.userGrowth}
// //         />
// //         <DashboardCard 
// //           title="Active Users" 
// //           value={stats.activeUsers} 
// //           icon={<Activity className="h-4 w-4" />}
// //         />
// //         <DashboardCard 
// //           title="Pending Approvals" 
// //           value={stats.pendingApprovals} 
// //           icon={<Clock className="h-4 w-4" />}
// //         />
// //         <DashboardCard 
// //           title="Approved Profiles" 
// //           value={stats.approvedProfiles} 
// //           icon={<CheckCircle className="h-4 w-4" />}
// //         />
// //         <DashboardCard 
// //           title="Refused Profiles" 
// //           value={stats.refusedProfiles} 
// //           icon={<XCircle className="h-4 w-4" />}
// //         />
// //       </div>

// //       {/* Recent Activity Sections */}
// //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
// //         <Card className="col-span-4">
// //           <CardHeader>
// //             <CardTitle>Recent Approvals</CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             <RecentApprovals approvals={stats.recentApprovals} />
// //           </CardContent>
// //         </Card>
        
// //         <Card className="col-span-3">
// //           <CardHeader>
// //             <CardTitle>New Registrations</CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             <RecentUsers users={stats.recentUsers} />
// //           </CardContent>
// //         </Card>
// //       </div>
// //     </div>
// //   )
// // }

// // // Dashboard Card Component
// // function DashboardCard({ title, value, icon, trend }: {
// //   title: string
// //   value: number
// //   icon: React.ReactNode
// //   trend?: number
// // }) {
// //   return (
// //     <Card>
// //       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// //         <CardTitle className="text-sm font-medium">{title}</CardTitle>
// //         <div className="h-4 w-4 text-muted-foreground">{icon}</div>
// //       </CardHeader>
// //       <CardContent>
// //         <div className="text-2xl font-bold">{value}</div>
// //         {trend !== undefined && (
// //           <p className="text-xs text-muted-foreground">
// //             {trend >= 0 ? `+${trend}` : trend}% from last month
// //           </p>
// //         )}
// //       </CardContent>
// //     </Card>
// //   )
// // }

// import { getAdminStats } from '@/lib/admin/actions/dashboard-actions'
// import { DashboardCards } from '@/components/admin/DashboardCards'

// export default async function AdminDashboard() {
//   const stats = await getAdminStats()
  
//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
//       <DashboardCards stats={stats} />
//     </div>
//   )
// }


import { getAdminStats } from '@/lib/admin/actions/dashboard-actions'
import { DashboardCards } from '@/components/admin/DashboardCards'
import { RecentActivity } from '@/components/admin/RecentActivity'
import { UserInsights } from '@/components/admin/UserInsights'


export default async function AdminDashboard() {
  const stats = await getAdminStats()


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Insights and analytics for your platform
          </p>
        </div>
        {/* Add date picker or other controls here if needed */}
      </div>

      <DashboardCards stats={stats} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <RecentActivity approvals={stats.recentApprovals} />
        </div>
        <div className="lg:col-span-3">
          {/* <UserInsights users={stats.recentUsers} growth={stats.userGrowth} /> */}
        </div>
      </div>
    </div>
  )
}