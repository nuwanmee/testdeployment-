import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BackButton from '@/components/ui/BackButton'
import LogoutButton from '@/components/auth/LogoutButton'

export default async function Profile() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="container mx-auto p-4">
      <BackButton />
   
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">ID</h2>
          <p>{session.user.id}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Email</h2>
          <p>{session.user.email}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Role</h2>
          <p>{session.user.role}</p>
        </div>
      </div>
    </div>
  )
}