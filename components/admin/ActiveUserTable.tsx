'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

type Props = {
  users: Pick<User, 'id' | 'email' | 'name' | 'role' | 'status' | 'createdAt' | 'isProfileComplete'>[];
};

export default function ActiveUserTable({ users: initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const router = useRouter();

  const toggleStatus = async (userId: number, currentStatus: string) => {
    setLoadingId(userId);
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const response = await fetch('/api/admin/users/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));

      toast.success(`User status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <table className="table table-striped table-bordered">
      <thead className="table-light">
        <tr>
          <th scope="col" className="text-nowrap">ID</th>
          <th scope="col" className="text-nowrap">Name</th>
          <th scope="col" className="text-nowrap">Email</th>
          <th scope="col" className="text-nowrap">Role</th>
          <th scope="col" className="text-nowrap">Joined</th>
          <th scope="col" className="text-nowrap">Profile Complete</th>
          <th scope="col" className="text-nowrap">Status</th>
          <th scope="col" className="text-nowrap">Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td className="align-middle">{user.id}</td>
            <td className="align-middle fw-medium">{user.name || '-'}</td>
            <td className="align-middle">{user.email}</td>
            <td className="align-middle text-capitalize">{user.role.toLowerCase()}</td>
            <td className="align-middle">{formatDate(user.createdAt)}</td>
            <td className="align-middle">{user.isProfileComplete ? 'Yes' : 'No'}</td>
            <td className="align-middle text-capitalize">{user.status}</td>
            <td className="align-middle">
              <button
                onClick={() => toggleStatus(user.id, user.status)}
                disabled={loadingId === user.id}
                className={`btn btn-sm px-3 py-1 fw-medium ${
                  user.status === 'active'
                    ? 'btn-outline-danger'
                    : 'btn-outline-success'
                }`}
              >
                {loadingId === user.id ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : user.status === 'active' ? (
                  'Deactivate'
                ) : (
                  'Activate'
                )}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


// 'use client';

// import { useState } from 'react';
// import { User } from '@prisma/client';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';

// type Props = {
//   users: Pick<User, 'id' | 'email' | 'name' | 'role' | 'status' | 'createdAt' | 'isProfileComplete'>[];
// };

// export default function ActiveUserTable({ users: initialUsers }: Props) {
//   const [users, setUsers] = useState(initialUsers);
//   const [loadingId, setLoadingId] = useState<number | null>(null);
//   const router = useRouter();

//   const toggleStatus = async (userId: number, currentStatus: string) => {
//     setLoadingId(userId);
//     try {
//       const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
//       const response = await fetch('/api/admin/users/status', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ userId, status: newStatus }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update status');
//       }

//       setUsers(users.map(user => 
//         user.id === userId ? { ...user, status: newStatus } : user
//       ));

//       toast.success(`User status updated to ${newStatus}`);
//       router.refresh(); // Refresh server components
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to update status');
//     } finally {
//       setLoadingId(null);
//     }
//   };

//   const formatDate = (date: Date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <table className="min-w-full divide-y divide-gray-200">
//       <thead className="bg-gray-50">
//         <tr>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile Complete</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//         </tr>
//       </thead>
//       <tbody className="bg-white divide-y divide-gray-200">
//         {users.map((user) => (
//           <tr key={user.id}>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name || '-'}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//               {user.isProfileComplete ? 'Yes' : 'No'}
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.status}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//               <button
//                 onClick={() => toggleStatus(user.id, user.status)}
//                 disabled={loadingId === user.id}
//                 className={`px-3 py-1 rounded-md text-sm font-medium ${
//                   user.status === 'active'
//                     ? 'bg-red-100 text-red-800 hover:bg-red-200'
//                     : 'bg-green-100 text-green-800 hover:bg-green-200'
//                 }`}
//               >
//                 {loadingId === user.id ? (
//                   'Processing...'
//                 ) : user.status === 'active' ? (
//                   'Deactivate'
//                 ) : (
//                   'Activate'
//                 )}
//               </button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }