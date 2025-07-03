import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import UserTable from '@/components/admin/userTable'
import Navbar from '@/components/layout/Navbar'
import BackButton from '@/components/ui/BackButton'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function ManageUsers() {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      status: true
    }
  })

  return (
    <div className="container mx-auto p-4">
    
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <UserTable users={users} />
    </div>
  )
}