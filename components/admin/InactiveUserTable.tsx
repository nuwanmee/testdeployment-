'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

type Props = {
  users: Pick<User, 'id' | 'email' | 'name' | 'role' | 'status' | 'createdAt' | 'updatedAt' | 'isProfileComplete'>[];
};

export default function InactiveUserTable({ users: initialUsers }: Props) {
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

      if (newStatus === 'active') {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
      }

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col">Created</th>
            <th scope="col">Last Updated</th>
            <th scope="col">Status</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td className="fw-semibold">{user.name || 'N/A'}</td>
              <td>{user.email}</td>
              <td className="text-capitalize">{user.role.toLowerCase()}</td>
              <td>{formatDate(user.createdAt)}</td>
              <td>{formatDate(user.updatedAt)}</td>
              <td>
                <span className={`badge ${
                  user.status === 'active' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'
                }`}>
                  {user.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => toggleStatus(user.id, user.status)}
                  disabled={loadingId === user.id}
                  className={`btn btn-sm btn-success ${
                    loadingId === user.id ? 'disabled' : ''
                  }`}
                >
                  {loadingId === user.id ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                      Processing...
                    </>
                  ) : (
                    'Activate'
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


// 'use client';

// import { useState } from 'react';
// import { User } from '@prisma/client';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';

// type Props = {
//   users: Pick<User, 'id' | 'email' | 'name' | 'role' | 'status' | 'createdAt' | 'updatedAt' | 'isProfileComplete'>[];
// };

// export default function InactiveUserTable({ users: initialUsers }: Props) {
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

//       // Remove the user from the list if activated
//       if (newStatus === 'active') {
//         setUsers(users.filter(user => user.id !== userId));
//       } else {
//         setUsers(users.map(user => 
//           user.id === userId ? { ...user, status: newStatus } : user
//         ));
//       }

//       toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
//       router.refresh();
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
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
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
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//         </tr>
//       </thead>
//       <tbody className="bg-white divide-y divide-gray-200">
//         {users.map((user) => (
//           <tr key={user.id}>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//               {user.name || 'N/A'}
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.createdAt)}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(user.updatedAt)}</td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                 user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//               }`}>
//                 {user.status}
//               </span>
//             </td>
//             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//               <button
//                 onClick={() => toggleStatus(user.id, user.status)}
//                 disabled={loadingId === user.id}
//                 className={`px-3 py-1 rounded text-white bg-green-600 hover:bg-green-700 ${
//                   loadingId === user.id ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {loadingId === user.id ? 'Processing...' : 'Activate'}
//               </button>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );
// }