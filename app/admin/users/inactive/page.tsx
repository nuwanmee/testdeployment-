
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InactiveUserTable from '@/components/admin/InactiveUserTable';
import Navbar from '@/components/layout/Navbar';
import { User } from '@prisma/client';

export default async function InactiveUsersPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not admin
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Fetch inactive users with their basic info
  const inactiveUsers = await prisma.user.findMany({
    where: {
      status: 'inactive'
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      isProfileComplete: true
    },
    orderBy: {
      updatedAt: 'desc' // Show recently deactivated first
    }
  });

  // Calculate some basic stats
  const totalInactiveUsers = inactiveUsers.length;
  const inactiveAdmins = inactiveUsers.filter(user => user.role === 'ADMIN').length;
  const inactiveClients = inactiveUsers.filter(user => user.role === 'CLIENT').length;
  const incompleteProfiles = inactiveUsers.filter(user => !user.isProfileComplete).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inactive Users Management</h1>
          <p className="text-gray-600">Manage and monitor all inactive users in the system</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Inactive Users</p>
                <p className="text-2xl font-bold text-gray-900">{totalInactiveUsers}</p>
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
                <p className="text-sm font-medium text-gray-600">Inactive Admins</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveAdmins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Clients</p>
                <p className="text-2xl font-bold text-gray-900">{inactiveClients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L4.098 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Incomplete Profiles</p>
                <p className="text-2xl font-bold text-gray-900">{incompleteProfiles}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Inactive Users List</h2>
              {totalInactiveUsers > 0 && (
                <div className="text-sm text-gray-600">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            {totalInactiveUsers > 0 ? (
              <InactiveUserTable users={inactiveUsers} />
            ) : (
              <div className="p-12 text-center">
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Inactive Users</h3>
                <p className="text-gray-600">All users are currently active in the system.</p>
              </div>
            )}
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
// import InactiveUserTable from '@/components/admin/InactiveUserTable';
// import Navbar from '@/components/layout/Navbar';
// import { User } from '@prisma/client';

// export default async function InactiveUsersPage() {
//   const session = await getServerSession(authOptions);
  
//   // Redirect if not admin
//   if (!session || session.user.role !== 'ADMIN') {
//     redirect('/');
//   }

//   // Fetch inactive users with their basic info
//   const inactiveUsers = await prisma.user.findMany({
//     where: {
//       status: 'inactive'
//     },
//     select: {
//       id: true,
//       email: true,
//       name: true,
//       role: true,
//       status: true,
//       createdAt: true,
//       updatedAt: true,
//       isProfileComplete: true
//     },
//     orderBy: {
//       updatedAt: 'desc' // Show recently deactivated first
//     }
//   });

//   return (
//     <div className="container mx-auto p-4">
      
//       <div className="bg-white rounded-lg shadow p-6">
//         <h1 className="text-2xl font-bold mb-6">Inactive Users Management</h1>
//         <p className="text-gray-600 mb-4">
//           {inactiveUsers.length} inactive user(s) found
//         </p>
//         <div className="overflow-x-auto">
//           <InactiveUserTable users={inactiveUsers} />
//         </div>
//       </div>
//     </div>
//   );
// }