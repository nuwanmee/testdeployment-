// components/admin/AdminSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useEffect } from 'react'
import { signOut } from 'next-auth/react'
import 'bootstrap/dist/css/bootstrap.min.css'

export function AdminSidebar() {
  const pathname = usePathname()

  // Initialize Bootstrap JS
  useEffect(() => {
    require('bootstrap/dist/js/bootstrap.bundle.min.js')
  }, [])

  const handleSignOut = async () => {
    try {
      // Close any open dropdowns first
      const dropdowns = document.querySelectorAll('.dropdown-menu.show')
      dropdowns.forEach(dropdown => dropdown.classList.remove('show'))
      
      // Sign out using NextAuth.js
      await signOut({ 
        callbackUrl: '/login',
        redirect: true
      })
      
      // Clear any additional client-side storage if needed
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Fallback redirect if signOut fails
      window.location.href = '/login'
    }
  }

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: <LayoutDashboard className="me-2" size={18} />
    },
    {
      href: '/admin/users',
      label: 'All Users',
      icon: <Users className="me-2" size={18} />
    },
    {
      href: '/admin/users/active',
      label: 'Active Users',
      icon: <Users className="me-2" size={18} />
    },
    {
      href: '/admin/users/inactive',
      label: 'Inactive Users',
      icon: <Users className="me-2" size={18} />
    },
    {
      href: '/admin/users/approvals',
      label: 'Pending Approvals',
      icon: <Clock className="me-2" size={18} />
    },
    {
      href: '/admin/users/approved',
      label: 'Approved Profiles',
      icon: <CheckCircle className="me-2" size={18} />
    },
    {
      href: '/admin/users/refused',
      label: 'Refused Profiles',
      icon: <XCircle className="me-2" size={18} />
    },
  ]

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{ width: '280px', height: '100vh' }}>
      <Link href="/admin" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
        <span className="fs-4">Admin Panel</span>
      </Link>
      
      <hr />
      
      <ul className="nav nav-pills flex-column mb-auto">
        {navItems.map((item) => (
          <li key={item.href} className="nav-item">
            <Link
              href={item.href}
              className={pathname === item.href ? 'nav-link active' : 'nav-link'}
            >
              {item.icon}
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      
      <hr />
      
      <div className="dropdown">
        <a 
          href="#" 
          className="d-flex align-items-center text-decoration-none dropdown-toggle" 
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <strong>Admin User</strong>
        </a>
        <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
          {/* <li><a className="dropdown-item" href="#">Settings</a></li>
          <li><a className="dropdown-item" href="#">Profile</a></li> */}
          <li><hr className="dropdown-divider" /></li>
          <li>
            <button 
              className="dropdown-item" 
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              Sign out
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}


// // components/admin/AdminSidebar.tsx
// 'use client'

// import Link from 'next/link'
// import { usePathname } from 'next/navigation'
// import { LayoutDashboard, Users, CheckCircle, XCircle, Clock, Settings } from 'lucide-react'
// import { useEffect } from 'react'
// import 'bootstrap/dist/css/bootstrap.min.css'

// export function AdminSidebar() {
//   const pathname = usePathname()

//   // Initialize Bootstrap JS
//   useEffect(() => {
//     require('bootstrap/dist/js/bootstrap.bundle.min.js')
//   }, [])

//   const navItems = [
//     {
//       href: '/admin',
//       label: 'Dashboard',
//       icon: <LayoutDashboard className="me-2" size={18} />
//     },
//     {
//       href: '/admin/users',
//       label: 'All Users',
//       icon: <Users className="me-2" size={18} />
//     },
//     {
//       href: '/admin/users/active',
//       label: 'Active Users',
//       icon: <Users className="me-2" size={18} />
//     },
//     {
//       href: '/admin/users/inactive',
//       label: 'Inactive Users',
//       icon: <Users className="me-2" size={18} />
//     },
//     {
//       href: '/admin/users/approvals',
//       label: 'Pending Approvals',
//       icon: <Clock className="me-2" size={18} />
//     },
//     {
//       href: '/admin/users/approved',
//       label: 'Approved Profiles',
//       icon: <CheckCircle className="me-2" size={18} />
//     },
//     {
//       href: '/admin/users/refused',
//       label: 'Refused Profiles',
//       icon: <XCircle className="me-2" size={18} />
//     },
//     // {
//     //   href: '/admin/settings',
//     //   label: 'Settings',
//     //   icon: <Settings className="me-2" size={18} />
//     // }
//   ]

//   return (
//     <div className="d-flex flex-column flex-shrink-0 p-3 bg-light" style={{ width: '280px', height: '100vh' }}>
//       <Link href="/admin" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-decoration-none">
//         <span className="fs-4">Admin Panel</span>
//       </Link>
      
//       <hr />
      
//       <ul className="nav nav-pills flex-column mb-auto">
//         {navItems.map((item) => (
//           <li key={item.href} className="nav-item">
//             <Link
//               href={item.href}
//               className={pathname === item.href ? 'nav-link active' : 'nav-link'}
//             >
//               {item.icon}
//               {item.label}
//             </Link>
//           </li>
//         ))}
//       </ul>
      
//       <hr />
      
//       <div className="dropdown">
//         <a href="#" className="d-flex align-items-center text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
//           <strong>Admin User</strong>
//         </a>
//         <ul className="dropdown-menu dropdown-menu-dark text-small shadow">
//           <li><a className="dropdown-item" href="#">Settings</a></li>
//           <li><a className="dropdown-item" href="#">Profile</a></li>
//           <li><hr className="dropdown-divider" /></li>
//           <li><a className="dropdown-item" href="#">Sign out</a></li>
//         </ul>
//       </div>
//     </div>
//   )
// }