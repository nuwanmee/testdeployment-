// components/layout/Sidebar.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Bell, User, Heart, MessageSquare, LogOut, FileHeart } from 'lucide-react';
import useProposalStore from '@/store/proposalStore';

const primary = '#6a6da7';
const secondary = '#dd90a6';
const white = '#ffffff';

interface SidebarProps {
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { pendingReceivedProposals, fetchUserProposals } = useProposalStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProposals(Number(session.user.id));
    }
  }, [session, fetchUserProposals]);

  const hasNewProposals = pendingReceivedProposals.length > 0;

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Logo */}
      <div className="d-flex align-items-center justify-content-center py-3 border-bottom" style={{ backgroundColor: white }}>
        <Link href="/" className="h5 mb-0 text-decoration-none" style={{ color: primary, fontWeight: 'bold' }}>
          {isCollapsed ? 'M' : <><img 
    src="/title-logo.svg" 
    alt="Mangala Kirana Logo"
    style={{
      height: '30px', // adjust as needed
      width: 'auto',
      marginRight: '10px',
      verticalAlign: 'middle'
    }}
  />MatrimonyMatch </>}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="p-3" style={{ backgroundColor: white }}>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link 
              href="/browse" 
              className="nav-link d-flex align-items-center gap-2 text-secondary" 
              style={{ color: '#495057' }}
              title={isCollapsed ? 'Browse Profiles' : undefined}
            >
              <User size={16} />
              {!isCollapsed && <span>Browse Profiles</span>}
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              href="/proposals" 
              className="nav-link d-flex align-items-center gap-2 text-secondary position-relative" 
              style={{ color: '#495057' }}
              title={isCollapsed ? 'Proposals' : undefined}
            >
              <FileHeart size={16} />
              {!isCollapsed && <span>Proposals</span>}
              {hasNewProposals && (
                <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                  {isCollapsed ? '' : pendingReceivedProposals.length}
                </span>
              )}
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              href="/messages" 
              className="nav-link d-flex align-items-center gap-2 text-secondary" 
              style={{ color: '#495057' }}
              title={isCollapsed ? 'Messages' : undefined}
            >
              <MessageSquare size={16} />
              {!isCollapsed && <span>Messages</span>}
            </Link>
          </li>
        </ul>
      </div>

      {/* User Actions */}
      {session ? (
        <div className="p-3 border-top" style={{ backgroundColor: white }}>
          <div className="mb-2 position-relative">
            <button
              onClick={toggleNotifications}
              className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary position-relative"
              style={{ color: '#495057' }}
              title={isCollapsed ? 'Notifications' : undefined}
            >
              <Bell size={16} />
              {!isCollapsed && <span>Notifications</span>}
              {hasNewProposals && (
                <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                  {isCollapsed ? '' : pendingReceivedProposals.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div 
                className="position-absolute top-100 start-0 mt-2 bg-white rounded shadow-sm" 
                style={{ 
                  width: isCollapsed ? '200px' : '240px', 
                  zIndex: 1,
                  left: isCollapsed ? '80px' : '0'
                }}
              >
                <h6 className="dropdown-header">Notifications</h6>
                {hasNewProposals ? (
                  <Link
                    href="/proposals/received"
                    className="dropdown-item text-decoration-none"
                    onClick={() => setIsNotificationsOpen(false)}
                  >
                    You have {pendingReceivedProposals.length} new proposal{pendingReceivedProposals.length > 1 ? 's' : ''}
                  </Link>
                ) : (
                  <span className="dropdown-item text-muted">No new notifications</span>
                )}
              </div>
            )}
          </div>

          <Link
            href={`/profile`}
            className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2"
            style={{ color: '#495057' }}
            title={isCollapsed ? 'My Profile' : undefined}
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '24px', height: '24px', objectFit: 'cover' }}
              />
            ) : (
              <User size={16} />
            )}
            {!isCollapsed && <span>My Profile</span>}
          </Link>
          <Link
            href="/proposals/sent"
            className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2"
            style={{ color: '#495057' }}
            title={isCollapsed ? 'Sent Proposals' : undefined}
          >
            <Heart size={16} />
            {!isCollapsed && <span>Sent Proposals</span>}
          </Link>
          <Link
            href="/proposals/received"
            className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2 position-relative"
            style={{ color: '#495057' }}
            title={isCollapsed ? 'Received Proposals' : undefined}
          >
            <FileHeart size={16} />
            {!isCollapsed && <span>Received Proposals</span>}
            {hasNewProposals && (
              <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
                {isCollapsed ? '' : pendingReceivedProposals.length}
              </span>
            )}
          </Link>
          <button
            onClick={() => signOut()}
            className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary"
            style={{ color: '#495057' }}
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      ) : (
        <div className="p-3 border-top" style={{ backgroundColor: white }}>
          <Link
            href="/login"
            className="btn btn-outline-secondary w-100 mb-2 d-flex align-items-center justify-content-center"
            style={{ color: '#495057', borderColor: '#6c757d' }}
            title={isCollapsed ? 'Login' : undefined}
          >
            {isCollapsed ? <User size={16} /> : 'Login'}
          </Link>
          <Link
            href="/register"
            className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: primary, borderColor: primary }}
            title={isCollapsed ? 'Register' : undefined}
          >
            {isCollapsed ? <UserPlus size={16} /> : 'Register'}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

// // components/layout/Sidebar.tsx
// 'use client'

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useSession, signOut } from 'next-auth/react';
// import { Bell, User, Heart, MessageSquare, LogOut, FileHeart } from 'lucide-react';
// import useProposalStore from '@/store/proposalStore';

// const primary = '#6a6da7';
// const secondary = '#dd90a6';
// const white = '#ffffff';

// const Sidebar = () => {
//   const pathname = usePathname();
//   const { data: session } = useSession();
//   const { pendingReceivedProposals, fetchUserProposals } = useProposalStore();
//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchUserProposals(Number(session.user.id));
//     }
//   }, [session, fetchUserProposals]);

//   const hasNewProposals = pendingReceivedProposals.length > 0;

//   const toggleNotifications = () => {
//     setIsNotificationsOpen(!isNotificationsOpen);
//   };

//   return (
//     <div className="d-flex flex-column bg-light shadow-sm" style={{ width: '240px', minHeight: '100vh' }}>
//       {/* Logo */}
//       <div className="d-flex align-items-center justify-content-center py-3 border-bottom" style={{ backgroundColor: white }}>
//         <Link href="/" className="h5 mb-0 text-decoration-none" style={{ color: primary, fontWeight: 'bold' }}>
//           MatrimonyApp
//         </Link>
//       </div>

//       {/* Navigation Links */}
//       <div className="p-3 " style={{ backgroundColor: white }}>
//         <ul className="nav flex-column">
//           <li className="nav-item">
//             <Link href="/browse" className="nav-link d-flex align-items-center gap-2 text-secondary" style={{ color: '#495057' }}>
//               <User size={16} />
//               <span>Browse Profiles</span>
//             </Link>
//           </li>
//           <li className="nav-item">
//             <Link href="/proposals" className="nav-link d-flex align-items-center gap-2 text-secondary position-relative" style={{ color: '#495057' }}>
//               <FileHeart size={16} />
//               <span>Proposals</span>
//               {hasNewProposals && (
//                 <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
//                   {pendingReceivedProposals.length}
//                 </span>
//               )}
//             </Link>
//           </li>
//           <li className="nav-item">
//             <Link href="/messages" className="nav-link d-flex align-items-center gap-2 text-secondary" style={{ color: '#495057' }}>
//               <MessageSquare size={16} />
//               <span>Messages</span>
//             </Link>
//           </li>
//         </ul>
//       </div>

//       {/* User Actions */}
//       {session ? (
//         <div className="p-3 border-top" style={{ backgroundColor: white }}>
//           <div className="mb-2 position-relative">
//             <button
//               onClick={toggleNotifications}
//               className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary position-relative"
//               style={{ color: '#495057' }}
//             >
//               <Bell size={16} />
//               <span>Notifications</span>
//               {hasNewProposals && (
//                 <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
//                   {pendingReceivedProposals.length}
//                 </span>
//               )}
//             </button>

//             {/* Notifications Dropdown */}
//             {isNotificationsOpen && (
//               <div className="position-absolute top-100 start-0 mt-2 bg-white rounded shadow-sm" style={{ width: '240px', zIndex: 1 }}>
//                 <h6 className="dropdown-header">Notifications</h6>
//                 {hasNewProposals ? (
//                   <Link
//                     href="/proposals/received"
//                     className="dropdown-item text-decoration-none"
//                     onClick={() => setIsNotificationsOpen(false)}
//                   >
//                     You have {pendingReceivedProposals.length} new proposal{pendingReceivedProposals.length > 1 ? 's' : ''}
//                   </Link>
//                 ) : (
//                   <span className="dropdown-item text-muted">No new notifications</span>
//                 )}
//               </div>
//             )}
//           </div>

//           <Link
//             href={`/profile`}
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2"
//             style={{ color: '#495057' }}
//           >
//             {session.user?.image ? (
//               <img
//                 src={session.user.image}
//                 alt="Profile"
//                 className="rounded-circle"
//                 style={{ width: '24px', height: '24px', objectFit: 'cover' }}
//               />
//             ) : (
//               <User size={16} />
//             )}
//             <span>My Profile</span>
//           </Link>
//           <Link
//             href="/proposals/sent"
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2"
//             style={{ color: '#495057' }}
//           >
//             <Heart size={16} />
//             <span>Sent Proposals</span>
//           </Link>
//           <Link
//             href="/proposals/received"
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2 position-relative"
//             style={{ color: '#495057' }}
//           >
//             <FileHeart size={16} />
//             <span>Received Proposals</span>
//             {hasNewProposals && (
//               <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
//                 {pendingReceivedProposals.length}
//               </span>
//             )}
//           </Link>
//           <button
//             onClick={() => signOut()}
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary"
//             style={{ color: '#495057' }}
//           >
//             <LogOut size={16} />
//             <span>Sign Out</span>
//           </button>
//         </div>
//       ) : (
//         <div className="p-3 border-top" style={{ backgroundColor: white }}>
//           <Link
//             href="/login"
//             className="btn btn-outline-secondary w-100 mb-2"
//             style={{ color: '#495057', borderColor: '#6c757d' }}
//           >
//             Login
//           </Link>
//           <Link
//             href="/register"
//             className="btn btn-primary w-100"
//             style={{ backgroundColor: primary, borderColor: primary }}
//           >
//             Register
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Sidebar;


// 'use client'

// import React, { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useSession, signOut } from 'next-auth/react';
// import { Bell, User, Heart, MessageSquare, LogOut, FileHeart } from 'lucide-react';
// import useProposalStore from '@/store/proposalStore';
// import { useRouter } from 'next/navigation';

// const primary = '#6a6da7';
// const secondary = '#dd90a6';
// const white = '#ffffff';

// const Sidebar: React.FC = () => {
//   const { data: session } = useSession();
//   const { pendingReceivedProposals, fetchUserProposals } = useProposalStore();
//   const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     if (session?.user?.id) {
//       fetchUserProposals(Number(session.user.id));
//     }
//   }, [session, fetchUserProposals]);

//   const hasNewProposals = pendingReceivedProposals.length > 0;

//   const toggleNotifications = () => {
//     setIsNotificationsOpen(!isNotificationsOpen);
//   };

//   return (
//     <div className="d-flex flex-column bg-light shadow-sm" style={{ width: '240px', minHeight: '100vh' }}>
//       {/* Logo */}
//       <div className="d-flex align-items-center justify-content-center py-3 border-bottom" style={{ backgroundColor: white }}>
//         <Link href="/" className="h5 mb-0 text-decoration-none" style={{ color: primary, fontWeight: 'bold' }}>
//           MatrimonyApp
//         </Link>
//       </div>

//       {/* Navigation Links */}
//       <div className="p-3 flex-grow-1" style={{ backgroundColor: white }}>
//         <ul className="nav flex-column">
//           <li className="nav-item">
//             <Link href="/profiles" className="nav-link d-flex align-items-center gap-2 text-secondary" style={{ color: '#495057' }}>
//               <User size={16} />
//               <span>Browse Profiles</span>
//             </Link>
//           </li>
//           <li className="nav-item">
//             <Link href="/proposals" className="nav-link d-flex align-items-center gap-2 text-secondary position-relative" style={{ color: '#495057' }}>
//               <FileHeart size={16} />
//               <span>Proposals</span>
//               {hasNewProposals && (
//                 <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
//                   {pendingReceivedProposals.length}
//                 </span>
//               )}
//             </Link>
//           </li>
//           <li className="nav-item">
//             <Link href="/messages" className="nav-link d-flex align-items-center gap-2 text-secondary" style={{ color: '#495057' }}>
//               <MessageSquare size={16} />
//               <span>Messages</span>
//             </Link>
//           </li>
//         </ul>
//       </div>

//       {/* User Actions */}
//       {session ? (
//         <div className="p-3 border-top" style={{ backgroundColor: white }}>
//           <div className="mb-2 position-relative">
//             <button
//               onClick={toggleNotifications}
//               className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary position-relative"
//               style={{ color: '#495057' }}
//             >
//               <Bell size={16} />
//               <span>Notifications</span>
//               {hasNewProposals && (
//                 <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
//                   {pendingReceivedProposals.length}
//                 </span>
//               )}
//             </button>

//             {/* Notifications Dropdown */}
//             {isNotificationsOpen && (
//               <div className="position-absolute top-100 start-0 mt-2 bg-white rounded shadow-sm" style={{ width: '240px', zIndex: 1 }}>
//                 <h6 className="dropdown-header">Notifications</h6>
//                 {hasNewProposals ? (
//                   <Link
//                     href="/proposals/received"
//                     className="dropdown-item text-decoration-none"
//                     onClick={() => setIsNotificationsOpen(false)}
//                   >
//                     You have {pendingReceivedProposals.length} new proposal{pendingReceivedProposals.length > 1 ? 's' : ''}
//                   </Link>
//                 ) : (
//                   <span className="dropdown-item text-muted">No new notifications</span>
//                 )}
//               </div>
//             )}
//           </div>

//           <Link
//             href={`/profile`}
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2"
//             style={{ color: '#495057' }}
//           >
//             {session.user?.image ? (
//               <img
//                 src={session.user.image}
//                 alt="Profile"
//                 className="rounded-circle"
//                 style={{ width: '24px', height: '24px', objectFit: 'cover' }}
//               />
//             ) : (
//               <User size={16} />
//             )}
//             <span>My Profile</span>
//           </Link>
//           <Link
//             href="/proposals/sent"
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2"
//             style={{ color: '#495057' }}
//           >
//             <Heart size={16} />
//             <span>Sent Proposals</span>
//           </Link>
//           <Link
//             href="/proposals/received"
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary mb-2 position-relative"
//             style={{ color: '#495057' }}
//           >
//             <FileHeart size={16} />
//             <span>Received Proposals</span>
//             {hasNewProposals && (
//               <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill bg-danger">
//                 {pendingReceivedProposals.length}
//               </span>
//             )}
//           </Link>
//           <button
//             onClick={() => signOut()}
//             className="btn btn-light w-100 d-flex align-items-center gap-2 text-secondary"
//             style={{ color: '#495057' }}
//           >
//             <LogOut size={16} />
//             <span>Sign Out</span>
//           </button>
//         </div>
//       ) : (
//         <div className="p-3 border-top" style={{ backgroundColor: white }}>
//           <Link
//             href="/login"
//             className="btn btn-outline-secondary w-100 mb-2"
//             style={{ color: '#495057', borderColor: '#6c757d' }}
//           >
//             Login
//           </Link>
//           <Link
//             href="/register"
//             className="btn btn-primary w-100"
//             style={{ backgroundColor: primary, borderColor: primary }}
//           >
//             Register
//           </Link>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Sidebar;