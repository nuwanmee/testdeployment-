// app/admin/layout.tsx
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import 'bootstrap/dist/css/bootstrap.min.css'
import RealTimeListener from '@/components/RealTimeListener';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* <RealTimeListener /> */}
    <div className="d-flex">
    
      <AdminSidebar />
      <main className="flex-grow-1 p-4">
        {children}
      </main>
    </div>
    </div>
  )
}



// export default function AdminLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       {/* Sidebar would go here */}
//       <div className="flex-1">
//         {/* Top navigation would go here */}
//         <div className="p-6 md:p-8 lg:p-10">
//           {children}
//         </div>
//       </div>
//     </div>
//   )
// }



// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <div className="admin-container">
//       {/* <AdminSidebar /> */}
//       <main className="admin-content">
//         {children}
//       </main>
//     </div>
//   )
// }