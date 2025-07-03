// components/admin/userTable.tsx
'use client'

import { useState } from 'react'
import { roles } from '@/lib/constants'

type User = {
  id: number
  email: string
  role: string
  status: string
}

export default function UserTable({ users }: { users: User[] }) {
  const [userList, setUserList] = useState(users)
  const [message, setMessage] = useState('')

  const updateRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          role: newRole,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUserList(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        )
        setMessage(data.message)
      } else {
        setMessage(data.error || 'Failed to update role')
      }
    } catch (error) {
      setMessage('An error occurred while updating the role')
    }
  }

  const toggleStatus = async (userId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      const response = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: userId,
          status: newStatus,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUserList(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, status: newStatus } : user
          )
        )
        setMessage(`User status updated to ${newStatus}`)
      } else {
        setMessage(data.error || 'Failed to update status')
      }
    } catch (error) {
      setMessage('An error occurred while updating the status')
    }
  }

  return (
    <div className="container-fluid p-0">
      {message && (
        <div className={`alert alert-dismissible fade show mb-4 ${
          message.includes('Updated') || message.includes('updated') 
            ? 'alert-success' 
            : 'alert-danger'
        }`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}
      
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Email</th>
              <th scope="col">Status</th>
              <th scope="col">Role</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>
                  <button
                    onClick={() => toggleStatus(user.id, user.status)}
                    className={`btn btn-sm ${
                      user.status === 'active' 
                        ? 'btn-success' 
                        : 'btn-danger'
                    }`}
                  >
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>{user.role}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={e => updateRole(user.id, e.target.value)}
                    className="form-select form-select-sm"
                  >
                    {Object.values(roles).map(role => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


// // components/admin/userTable.tsx
// 'use client'

// import { useState } from 'react'
// import { roles } from '@/lib/constants'

// type User = {
//   id: number
//   email: string
//   role: string
//   status: string // Add this
// }

// export default function UserTable({ users }: { users: User[] }) {
//   const [userList, setUserList] = useState(users)
//   const [message, setMessage] = useState('')

//   const updateRole = async (userId: number, newRole: string) => {
//     try {
//       const response = await fetch('/api/admin/update-role', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: userId,
//           role: newRole,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setUserList(prevUsers =>
//           prevUsers.map(user =>
//             user.id === userId ? { ...user, role: newRole } : user
//           )
//         )
//         setMessage(data.message)
//       } else {
//         setMessage(data.error || 'Failed to update role')
//       }
//     } catch (error) {
//       setMessage('An error occurred while updating the role')
//     }
//   }

//   const toggleStatus = async (userId: number, currentStatus: string) => {
//     const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
//     try {
//       const response = await fetch('/api/admin/update-status', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: userId,
//           status: newStatus,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setUserList(prevUsers =>
//           prevUsers.map(user =>
//             user.id === userId ? { ...user, status: newStatus } : user
//           )
//         )
//         setMessage(`User status updated to ${newStatus}`)
//       } else {
//         setMessage(data.error || 'Failed to update status')
//       }
//     } catch (error) {
//       setMessage('An error occurred while updating the status')
//     }
//   }

//   return (
//     <div>
//       {message && (
//         <div className={`mb-4 p-3 rounded ${
//           message.includes('Updated') || message.includes('updated') 
//             ? 'bg-green-100 text-green-800' 
//             : 'bg-red-100 text-red-800'
//         }`}>
//           {message}
//         </div>
//       )}
      
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border">
//           <thead>
//             <tr>
//               <th className="py-2 px-4 border">ID</th>
//               <th className="py-2 px-4 border">Email</th>
//               <th className="py-2 px-4 border">Status</th>
//               <th className="py-2 px-4 border">Role</th>
//               <th className="py-2 px-4 border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {userList.map(user => (
//               <tr key={user.id}>
//                 <td className="py-2 px-4 border">{user.id}</td>
//                 <td className="py-2 px-4 border">{user.email}</td>
//                 <td className="py-2 px-4 border">
//                   <button
//                     onClick={() => toggleStatus(user.id, user.status)}
//                     className={`px-3 py-1 rounded text-white ${
//                       user.status === 'active' 
//                         ? 'bg-green-500 hover:bg-green-600' 
//                         : 'bg-red-500 hover:bg-red-600'
//                     }`}
//                   >
//                     {user.status === 'active' ? 'Active' : 'Inactive'}
//                   </button>
//                 </td>
//                 <td className="py-2 px-4 border">{user.role}</td>
//                 <td className="py-2 px-4 border">
//                   <select
//                     value={user.role}
//                     onChange={e => updateRole(user.id, e.target.value)}
//                     className="border rounded p-1"
//                   >
//                     {Object.values(roles).map(role => (
//                       <option key={role} value={role}>
//                         {role}
//                       </option>
//                     ))}
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }


// 'use client'

// import { useState } from 'react'
// import { roles } from '@/lib/constants'

// type User = {
//   id: number
//   email: string
//   role: string
// }

// export default function UserTable({ users }: { users: User[] }) {
//   const [userList, setUserList] = useState(users)
//   const [message, setMessage] = useState('')

//   const updateRole = async (userId: number, newRole: string) => {
//     try {
//       const response = await fetch('/api/admin/update-role', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           id: userId,
//           role: newRole,
//         }),
//       })

//       const data = await response.json()

//       if (response.ok) {
//         setUserList(prevUsers =>
//           prevUsers.map(user =>
//             user.id === userId ? { ...user, role: newRole } : user
//           )
//         )
//         setMessage(data.message)
//       } else {
//         setMessage(data.error || 'Failed to update role')
//       }
//     } catch (error) {
//       setMessage('An error occurred while updating the role')
//     }
//   }

//   return (
//     <div>
//       {message && (
//         <div className={`mb-4 p-3 rounded ${
//           message.includes('Updated') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           {message}
//         </div>
//       )}
      
//       <div className="overflow-x-auto">
//         <table className="min-w-full bg-white border">
//           <thead>
//             <tr>
//               <th className="py-2 px-4 border">ID</th>
//               <th className="py-2 px-4 border">Email</th>
//               <th className="py-2 px-4 border">Role</th>
//               <th className="py-2 px-4 border">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {userList.map(user => (
//               <tr key={user.id}>
//                 <td className="py-2 px-4 border">{user.id}</td>
//                 <td className="py-2 px-4 border">{user.email}</td>
//                 <td className="py-2 px-4 border">{user.role}</td>
//                 <td className="py-2 px-4 border">
//                   <select
//                     value={user.role}
//                     onChange={e => updateRole(user.id, e.target.value)}
//                     className="border rounded p-1"
//                   >
//                     {Object.values(roles).map(role => (
//                       <option key={role} value={role}>
//                         {role}
//                       </option>
//                     ))}
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }