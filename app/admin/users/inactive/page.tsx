import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
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

  return (
    <div className="container mx-auto p-4">
      
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Inactive Users Management</h1>
        <p className="text-gray-600 mb-4">
          {inactiveUsers.length} inactive user(s) found
        </p>
        <div className="overflow-x-auto">
          <InactiveUserTable users={inactiveUsers} />
        </div>
      </div>
    </div>
  );
}