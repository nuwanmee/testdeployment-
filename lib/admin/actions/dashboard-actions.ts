// lib/admin/actions/dashboard-actions.ts
import prisma from '../../prisma'

export async function getAdminStats() {
  const [
    totalUsers,
    activeUsers,
    pendingApprovals,
    approvedProfiles,
    refusedProfiles,
    recentApprovals,
    recentUsers
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'active' }}),
    prisma.profile.count({ where: { status: 'pending' }}),
    prisma.profile.count({ where: { status: 'approved' }}),
    prisma.profile.count({ where: { status: 'refused' }}),
    prisma.profile.findMany({
      where: { status: { in: ['approved', 'refused'] }},
      orderBy: { updatedAt: 'desc' },  // Changed from lastUpdated to updatedAt
      take: 5,
      include: { user: true }
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { profile: true }
    })
  ])

  // Calculate user growth percentage
  const lastMonthUsers = await prisma.user.count({
    where: {
      createdAt: { 
        lte: new Date(new Date().setMonth(new Date().getMonth() - 1))
      }
    }
  })
  
  const userGrowth = lastMonthUsers > 0 
    ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
    : 100

  return {
    totalUsers,
    activeUsers,
    pendingApprovals,
    approvedProfiles,
    refusedProfiles,
    userGrowth,
    recentApprovals,
    recentUsers
  }
}



// import prisma from '../../prisma'

// export async function getAdminStats() {
//   const [
//     totalUsers,
//     activeUsers,
//     pendingApprovals,
//     approvedProfiles,
//     refusedProfiles,
//     recentApprovals,
//     recentUsers
//   ] = await Promise.all([
//     prisma.user.count(),
//     prisma.user.count({ where: { status: 'active' }}),
//     prisma.profile.count({ where: { status: 'pending' }}),
//     prisma.profile.count({ where: { status: 'approved' }}),
//     prisma.profile.count({ where: { status: 'refused' }}),
//     prisma.profile.findMany({
//       where: { status: { in: ['approved', 'refused'] }},
//       orderBy: { lastUpdated: 'desc' },
//       take: 5,
//       include: { user: true }
//     }),
//     prisma.user.findMany({
//       orderBy: { createdAt: 'desc' },
//       take: 5,
//       include: { profile: true }
//     })
//   ])

//   // Calculate user growth percentage (example)
//   const lastMonthUsers = await prisma.user.count({
//     where: {
//       createdAt: { 
//         lte: new Date(new Date().setMonth(new Date().getMonth() - 1))
//       }
//     }
//   })
//   const userGrowth = lastMonthUsers > 0 
//     ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
//     : 100

//   return {
//     totalUsers,
//     activeUsers,
//     pendingApprovals,
//     approvedProfiles,
//     refusedProfiles,
//     userGrowth,
//     recentApprovals,
//     recentUsers
//   }
// }