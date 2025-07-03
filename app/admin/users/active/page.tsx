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

  return (
    <div className="container mx-auto p-4">
     
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Active Users Management</h1>
        <div className="overflow-x-auto">
          <ActiveUserTable users={activeUsers} />
        </div>
      </div>
    </div>
  );
}