// components/Layout.tsx
'use client'

import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Layout({ children, title }: { children: React.ReactNode, title: string }) {
  const { data: session } = useSession();
  
  return (
    <div className="min-h-screen">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">Matrimony App</Link>
          <div className="flex space-x-4">
            {session && (
              <Link href="/profile" className="px-3 py-2 hover:text-blue-600">
                My Profile
              </Link>
            )}
            {/* Other navigation links */}
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{title}</h1>
        {children}
      </main>
    </div>
  );
}


// // src/components/Layout.tsx
// import React, { ReactNode } from 'react';
// import Head from 'next/head';
// import Link from 'next/link';
// import { useSession, signOut } from 'next-auth/react';
// import Script from 'next/script';

// interface LayoutProps {
//   children: ReactNode;
//   title?: string;
// }

// export default function Layout({ children, title = 'Matchmaking App' }: LayoutProps) {
//   const { data: session } = useSession();

//   return (
//     <>
//       <Head>
//         <title>{title}</title>
//         <meta name="description" content="Find your perfect match" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <link rel="icon" href="/favicon.ico" />
//         {/* Bootstrap CSS */}
//         <link 
//           href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
//           rel="stylesheet" 
//           integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" 
//           crossOrigin="anonymous" 
//         />
//       </Head>

//       {/* Bootstrap JS */}
//       <Script
//         src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
//         integrity="sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz"
//         crossOrigin="anonymous"
//       />

//       <div className="d-flex flex-column min-vh-100">
//         {/* Navigation */}
//         <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
//           <div className="container">
//             <Link href="/" className="navbar-brand">
//               Matchmaking App
//             </Link>
//             <button 
//               className="navbar-toggler" 
//               type="button" 
//               data-bs-toggle="collapse" 
//               data-bs-target="#navbarNav" 
//               aria-controls="navbarNav"
//               aria-expanded="false"
//               aria-label="Toggle navigation"
//             >
//               <span className="navbar-toggler-icon"></span>
//             </button>
            
//             <div className="collapse navbar-collapse" id="navbarNav">
//               <ul className="navbar-nav me-auto mb-2 mb-lg-0">
//                 <li className="nav-item">
//                   <Link href="/" className="nav-link">
//                     Home
//                   </Link>
//                 </li>
//                 <li className="nav-item">
//                   <Link href="/profiles" className="nav-link">
//                     Browse Profiles
//                   </Link>
//                 </li>
//                 {session && (
//                   <>
//                     <li className="nav-item">
//                       <Link href="/proposals" className="nav-link">
//                         Proposals
//                       </Link>
//                     </li>
//                     <li className="nav-item">
//                       <Link href="/messages" className="nav-link">
//                         Messages
//                       </Link>
//                     </li>
//                   </>
//                 )}
//               </ul>
              
//               <div className="d-flex">
//                 {session ? (
//                   <div className="dropdown">
//                     <button 
//                       className="btn btn-light dropdown-toggle" 
//                       type="button" 
//                       id="userDropdown" 
//                       data-bs-toggle="dropdown" 
//                       aria-expanded="false"
//                     >
//                       {session.user?.id || session.user?.email}
//                     </button>
//                     <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
//                       <li>
//                         <Link href="/profile" className="dropdown-item">
//                           My Profile
//                         </Link>
//                       </li>
//                       <li>
//                         <Link href="/profile/edit" className="dropdown-item">
//                           Edit Profile
//                         </Link>
//                       </li>
//                       <li>
//                         <Link href="/settings" className="dropdown-item">
//                           Settings
//                         </Link>
//                       </li>
//                       <li><hr className="dropdown-divider" /></li>
//                       <li>
//                         <button 
//                           className="dropdown-item text-danger" 
//                           onClick={() => signOut({ callbackUrl: '/' })}
//                         >
//                           Sign Out
//                         </button>
//                       </li>
//                     </ul>
//                   </div>
//                 ) : (
//                   <div className="d-flex">
//                     <Link href="/login" className="btn btn-light me-2">
//                       Login
//                     </Link>
//                     <Link href="/register" className="btn btn-outline-light">
//                       Register
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </nav>

//         {/* Main Content */}
//         <main className="flex-grow-1 py-4">
//           {children}
//         </main>

//         {/* Footer */}
//         <footer className="bg-dark text-white py-4 mt-auto">
//           <div className="container">
//             <div className="row">
//               <div className="col-md-6">
//                 <h5>Matchmaking App</h5>
//                 <p className="mb-0">Find your perfect match today!</p>
//               </div>
//               <div className="col-md-6 text-md-end">
//                 <ul className="list-inline mb-0">
//                   <li className="list-inline-item">
//                     <Link href="/about" className="text-white">
//                       About
//                     </Link>
//                   </li>
//                   <li className="list-inline-item">
//                     <Link href="/terms" className="text-white">
//                       Terms
//                     </Link>
//                   </li>
//                   <li className="list-inline-item">
//                     <Link href="/privacy" className="text-white">
//                       Privacy
//                     </Link>
//                   </li>
//                   <li className="list-inline-item">
//                     <Link href="/contact" className="text-white">
//                       Contact
//                     </Link>
//                   </li>
//                 </ul>
//                 <p className="mt-2 mb-0">© {new Date().getFullYear()} Matchmaking App. All rights reserved.</p>
//               </div>
//             </div>
//           </div>
//         </footer>
//       </div>
//     </>
//   );
// }