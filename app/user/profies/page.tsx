// // app/users/page.tsx
// import { getAllUsers } from "@/lib/db"; // assuming you have such a function
// import Link from "next/link";

// export default async function UserListPage() {
//   const users = await getAllUsers();

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Matrimony Profiles</h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {users.map((user) => (
//           <div key={user.id} className="border p-4 rounded shadow">
//             <h2 className="text-lg font-semibold">{user.name}</h2>
//             <p>Age: {user.age}</p>
//             <p>Location: {user.location}</p>
//             <Link href={`/user/profile/${user.id}`}>
//               <span className="text-blue-500 hover:underline">View Profile</span>
//             </Link>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
