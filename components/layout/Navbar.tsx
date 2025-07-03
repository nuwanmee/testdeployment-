'use client'

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Bell, User, Heart, FileHeart, MessageSquare } from 'lucide-react';
import useProposalStore from '@/store/proposalStore';

export default function Navbar() {
  const { data: session } = useSession();
  const { pendingReceivedProposals } = useProposalStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const primary = '#464989';
  const secondary = '#edb1c4';
  const hasNewProposals = pendingReceivedProposals.length > 0;

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <nav className="navbar navbar-expand-lg px-5" style={{ backgroundColor: primary }}>
      <div className="container">
        {/* <Link href="/" className="navbar-brand" style={{ color: secondary }}>
          RBAC
        </Link> */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link href="/" className="nav-link" style={{ color: 'white' }}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/browse" className="nav-link" style={{ color: 'white' }}>
                Matching
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/live-profiles" className="nav-link" style={{ color: 'white' }}>
                Live Profiles
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/saved-profiles" className="nav-link" style={{ color: 'white' }}>
                Saved Profiles
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/profile" className="nav-link" style={{ color: 'white' }}>
                My Profile
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/messages" className="nav-link" style={{ color: 'white' }}>
                <div className="flex items-center gap-1">
                  <MessageSquare size={16} />
                  <span>Messages</span>
                </div>
              </Link>
            </li>
          </ul>

          {session && (
            <div className="d-flex align-items-center">
              <div className="dropdown me-3">
                <button
                  className="btn position-relative"
                  onClick={toggleNotifications}
                  style={{ color: 'white' }}
                >
                  <Bell size={20} />
                  {hasNewProposals && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {pendingReceivedProposals.length}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="dropdown-menu show" style={{ right: 0, left: 'auto' }}>
                    <div className="px-4 py-2 border-bottom">
                      <h3 className="font-medium m-0">Notifications</h3>
                    </div>
                    {hasNewProposals ? (
                      <div className="p-2">
                        <Link
                          href="/proposals/received"
                          className="dropdown-item"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          You have {pendingReceivedProposals.length} new proposal{pendingReceivedProposals.length > 1 ? 's' : ''}
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 text-sm text-muted">No new notifications</div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="btn"
                style={{ color: secondary }}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// 'use client'

// import Link from 'next/link'
// import { useSession, signOut } from 'next-auth/react' 
// import { roles } from '@/lib/constants'
// import LogoutButton from '@/components/auth/LogoutButton'

// export default function Navbar() {
//   const { data: session } = useSession()


//  const handleLogout = () => {
//     signOut({ callbackUrl: '/' })
//   }

//   return (
//     <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
//       <div className="container">
//         <Link href="/" className="navbar-brand">
//           RBAC
//         </Link>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#navbarNav"
//           aria-controls="navbarNav"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon"></span>
//         </button>
//         <div className="collapse navbar-collapse" id="navbarNav">
//           <ul className="navbar-nav ms-auto">
//             <li className="nav-item">
//               <Link href="/" className="nav-link">
//                 Home
//               </Link>
//             </li> 
//             <li className="nav-item">
//               <Link href="/browse" className="nav-link">
//                 Matching
//               </Link>
//             </li> 
//             <li className="nav-item">
//               <Link href="/live-profiles" className="nav-link">
//                 live-profiles
//               </Link>
//             </li> 
//             <li className="nav-item">
//               <Link href="/saved-profiles" className="nav-link">
//                 Saved-profiles
//               </Link>
//             </li> 
//             <li className="nav-item">
//                   <Link href="/profile" className="nav-link">
//                    My Profile
//                   </Link>
//             </li>
          
//             <li className="nav-item">
//                   <Link
//                    href="/" className="nav-link"
//                   onClick={handleLogout}
//                   >
//                     Logout
//                   </Link>
//                 </li>
     
              
            
        
//           </ul>
//         </div>
//       </div>
//     </nav>
//   )
// }