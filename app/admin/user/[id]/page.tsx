import prisma from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">User Profile</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">ID</h2>
                <p className="mt-1 text-lg text-gray-900">{user.id}</p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</h2>
                <p className="mt-1 text-lg text-gray-900">{user.email}</p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Role</h2>
                <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created At</h2>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Updated</h2>
                <p className="mt-1 text-lg text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
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

// export default async function UserProfile({ params }: { params: Promise<{ id: string }> }) {
//   const session = await getServerSession(authOptions)
  
//   if (!session || session.user.role !== 'ADMIN') {
//     redirect('/')
//   }

//   // Await the params Promise in Next.js 15
//   const resolvedParams = await params
  
//   const user = await prisma.user.findUnique({
//     where: { id: parseInt(resolvedParams.id) },
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