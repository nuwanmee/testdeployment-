import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ActiveUserTable from '@/components/admin/ActiveUserTable';
import Navbar from '@/components/layout/Navbar';
import { User } from '@prisma/client';

export default async function ActiveUsersPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not admin
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch active users with their basic info
  const activeUsers = await prisma.user.findMany({
    where: {
      status: 'active'
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      isProfileComplete: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Calculate some basic stats
  const totalActiveUsers = activeUsers.length;
  const adminCount = activeUsers.filter(user => user.role === 'ADMIN').length;
  const clientCount = activeUsers.filter(user => user.role === 'CLIENT').length;
  const completeProfilesCount = activeUsers.filter(user => user.isProfileComplete).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Users Management</h1>
          <p className="text-gray-600">Manage and monitor all active users in the system</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalActiveUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clientCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Complete Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{completeProfilesCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Users List</h2>
          </div>
          <div className="overflow-x-auto">
            <ActiveUserTable users={activeUsers} />
          </div>
        </div>
      </div>
    </div>
  );
}

// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';
// import { redirect } from 'next/navigation';
// import { prisma } from '@/lib/prisma';
// import ActiveUserTable from '@/components/admin/ActiveUserTable';
// import Navbar from '@/components/layout/Navbar';
// import { User } from '@prisma/client';

// export default async function ActiveUsersPage() {
//   const session = await getServerSession(authOptions);
  
//   // Redirect if not admin
//   if (!session || session.user.role !== 'ADMIN') {
//     redirect('/');
//   }

//   // Fetch active users with their basic info
//   const activeUsers = await prisma.user.findMany({
//     where: {
//       status: 'active'
//     },
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       status: true,
//       createdAt: true,
//       isProfileComplete: true
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });

//   return (
//     <div className="container mx-auto p-4">
     
//       <div className="bg-white rounded-lg shadow p-6">
//         <h1 className="text-2xl font-bold mb-6">Active Users Management</h1>
//         <div className="overflow-x-auto">
//           <ActiveUserTable users={activeUsers} />
//         </div>
//       </div>
//     </div>
//   );
// }