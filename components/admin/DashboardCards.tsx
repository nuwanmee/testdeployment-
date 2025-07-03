// components/admin/DashboardCards.tsx
'use client'

import { Activity, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  deactivatedUsers: number // Added inactive users count
  pendingApprovals: number
  approvedProfiles: number
  refusedProfiles: number
  userGrowth: number
}

interface DashboardCardProps {
  title: string
  value: number
  icon: React.ReactNode
  trend?: number
  onClick?: () => void
}

function DashboardCard({ title, value, icon, trend, onClick }: DashboardCardProps) {
  
  // const { pendingCount, approvedCount } = useProfileStore()
  
  return (
    <div 
      className="card h-100 cursor-pointer hover-shadow"
      onClick={onClick}
      style={{ transition: 'box-shadow 0.3s ease' }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="card-title text-muted mb-0">{title}</h5>
          <div className="text-primary">{icon}</div>
        </div>
        <div className="mt-3">
          <h2 className="mb-1">{value}</h2>
          {trend !== undefined && (
            <span className={`small ${trend >= 0 ? 'text-success' : 'text-danger'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function DashboardCards({ stats }: { stats: DashboardStats }) {
  const router = useRouter()

  // Initialize Bootstrap tooltips
  useEffect(() => {
    const initTooltips = () => {
      if (typeof window !== 'undefined' && window.bootstrap) {
        const tooltipTriggerList = [].slice.call(
          document.querySelectorAll('[data-bs-toggle="tooltip"]')
        )
        tooltipTriggerList.map((tooltipTriggerEl) => {
          return new window.bootstrap.Tooltip(tooltipTriggerEl)
        })
      }
    }
    initTooltips()
  }, [])

  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="h-5 w-5" />,
      trend: stats.userGrowth,
      onClick: () => router.push('/admin/users')
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      icon: <Activity className="h-5 w-5" />,
      onClick: () => router.push('/admin/users/active')
    },
    {
      title: 'Inactive Users',
      value: stats.deactivatedUsers,
      icon: <Activity className="h-5 w-5" />,
      onClick: () => router.push('/admin/users/inactive')
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      icon: <Clock className="h-5 w-5" />,
      onClick: () => router.push('/admin/users/approvals')
    },
    {
      title: 'Approved Profiles',
      value: stats.approvedProfiles,
      icon: <CheckCircle className="h-5 w-5" />,
      onClick: () => router.push('/admin/users/approved')
    },
    {
      title: 'Refused Profiles',
      value: stats.refusedProfiles,
      icon: <XCircle className="h-5 w-5" />,
      onClick: () => router.push('/admin/users/refused')
    }
  ]

  return (
    <div className="row g-4 mb-4">
      {cards.map((card) => (
        <div key={card.title} className="col-md-6 col-lg-4 col-xl-2">
          <DashboardCard 
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            onClick={card.onClick}
          />
        </div>
      ))}
    </div>
  )
}

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
// import { Activity, Users, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react'

// export function DashboardCards({ stats }: { stats: any }) {
//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
//       <DashboardCard 
//         title="Total Users" 
//         value={stats.totalUsers} 
//         icon={<Users className="h-5 w-5" />}
//         trend={stats.userGrowth}
//         trendLabel="from last month"
//       />
//       <DashboardCard 
//         title="Active Users" 
//         value={stats.activeUsers} 
//         icon={<Activity className="h-5 w-5" />}
//       />
//       <DashboardCard 
//         title="Inactive Users" 
//         value={stats.deactivatedUsers} 
//         icon={<Activity className="h-5 w-5" />}
//       />
//       <DashboardCard 
//         title="Pending Approvals" 
//         value={stats.pendingApprovals} 
//         icon={<Clock className="h-5 w-5" />}
//       />
//       <DashboardCard 
//         title="Approved Profiles" 
//         value={stats.approvedProfiles} 
//         icon={<CheckCircle className="h-5 w-5" />}
//       />
//       <DashboardCard 
//         title="Refused Profiles" 
//         value={stats.refusedProfiles} 
//         icon={<XCircle className="h-5 w-5" />}
//       />
//     </div>
//   )
// }

// function DashboardCard({ 
//   title, 
//   value, 
//   icon, 
//   trend, 
//   trendLabel 
// }: { 
//   title: string
//   value: number
//   icon: React.ReactNode
//   trend?: number
//   trendLabel?: string
// }) {
//   return (
//     <Card className="hover:shadow-md transition-shadow">
//       <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
//         <CardTitle className="text-sm font-medium text-muted-foreground">
//           {title}
//         </CardTitle>
//         <div className="h-5 w-5 text-muted-foreground">{icon}</div>
//       </CardHeader>
//       <CardContent>
//         <div className="text-2xl font-bold">{value}</div>
//         {trend !== undefined && (
//           <div className="flex items-center text-xs mt-1">
//             {trend >= 0 ? (
//               <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
//             ) : (
//               <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
//             )}
//             <span className={trend >= 0 ? 'text-green-500' : 'text-red-500'}>
//               {trend >= 0 ? `+${trend}` : trend}%
//             </span>
//             {trendLabel && (
//               <span className="text-muted-foreground ml-1">{trendLabel}</span>
//             )}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   )
// }


// // components/admin/DashboardCards.tsx
// 'use client'

// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Activity, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
// import { useRouter } from 'next/navigation'

// interface DashboardStats {
//   totalUsers: number
//   activeUsers: number
//   pendingApprovals: number
//   approvedProfiles: number
//   refusedProfiles: number
//   userGrowth: number
// }

// export function DashboardCards({ stats }: { stats: DashboardStats }) {
//   const router = useRouter()

//   const cards = [
//     {
//       title: 'Total Users',
//       value: stats.totalUsers,
//       icon: <Users className="h-4 w-4" />,
//       trend: stats.userGrowth,
//       onClick: () => router.push('/admin/users')
//     },
//     {
//       title: 'Active Users',
//       value: stats.activeUsers,
//       icon: <Activity className="h-4 w-4" />,
//       onClick: () => router.push('/admin/users/active')
//     },
//     {
//       title: 'Pending Approvals',
//       value: stats.pendingApprovals,
//       icon: <Clock className="h-4 w-4" />,
//       onClick: () => router.push('/admin/users/approvals')
//     },
//     {
//       title: 'Approved Profiles',
//       value: stats.approvedProfiles,
//       icon: <CheckCircle className="h-4 w-4" />,
//       onClick: () => router.push('/admin/users/approved')
//     },
//     {
//       title: 'Refused Profiles',
//       value: stats.refusedProfiles,
//       icon: <XCircle className="h-4 w-4" />,
//       onClick: () => router.push('/admin/users/refused')
//     }
//   ]

//   return (
//     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
//       {cards.map((card) => (
//         <Card 
//           key={card.title} 
//           className="hover:shadow-lg transition-shadow cursor-pointer"
//           onClick={card.onClick}
//         >
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             {/* <CardTitle className="text-sm font-medium">{card.title}</CardTitle> */}
//             <div className="h-4 w-4 text-muted-foreground">{card.icon}</div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{card.value}</div>
//             {card.trend !== undefined && (
//               <p className="text-xs text-muted-foreground">
//                 {card.trend >= 0 ? `↑ ${card.trend}` : `↓ ${Math.abs(card.trend)}`}% from last month
//               </p>
//             )}
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   )
// }