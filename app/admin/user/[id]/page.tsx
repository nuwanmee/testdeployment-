import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import BackButton from '@/components/ui/BackButton'

export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  // Await the params Promise in Next.js 15
  const resolvedParams = await params
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(resolvedParams.id) },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (!user) {
    redirect('/admin/users')
  }

  return (
    <div className="container mx-auto p-4">
      <Navbar />
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-white p-6 rounded shadow">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">ID</h2>
          <p>{user.id}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Email</h2>
          <p>{user.email}</p>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Role</h2>
          <p>{user.role}</p>
        </div>
      </div>
    </div>
  )
}


// import prisma from '@/lib/db'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import { redirect } from 'next/navigation'
// import Navbar from '@/components/layout/Navbar'
// import BackButton from '@/components/ui/BackButton'

// export default async function UserProfile({ params }: { params: { id: string } }) {
//   const session = await getServerSession(authOptions)
  
//   if (!session || session.user.role !== 'ADMIN') {
//     redirect('/')
//   }

//   const user = await prisma.user.findUnique({
//     where: { id: parseInt(params.id) },
//     select: {
//       id: true,
//       email: true,
//       role: true,
//       createdAt: true,
//       updatedAt: true
//     }
//   })

//   if (!user) {
//     redirect('/admin/users')
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <Navbar />
//       <BackButton />
//       <h1 className="text-2xl font-bold mb-4">User Profile</h1>
//       <div className="bg-white p-6 rounded shadow">
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold">ID</h2>
//           <p>{user.id}</p>
//         </div>
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold">Email</h2>
//           <p>{user.email}</p>
//         </div>
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold">Role</h2>
//           <p>{user.role}</p>
//         </div>
//       </div>
//     </div>
//   )
// }