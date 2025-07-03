

// components/layout/SidebarLayout.tsx
'use client'

import { ReactNode, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Menu } from 'lucide-react';

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex">
      {/* Sidebar */}
      <div 
        className={`bg-light shadow-sm ${isSidebarOpen ? 'd-block' : 'd-none'}`}
        style={{ width: '240px', minHeight: '100vh', transition: 'all 0.3s' }}
      >
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-grow-1">
        {/* Toggle Button */}
        <button 
          onClick={toggleSidebar}
          className="btn btn-light m-2 position-fixed"
          style={{ zIndex: 1000 }}
        >
          <Menu size={20} />
        </button>
        
        {/* Content */}
        <div style={{ marginLeft: isSidebarOpen ? '0' : '0', transition: 'margin 0.3s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// // components/layout/SidebarLayout.tsx
// import { ReactNode } from 'react';
// import Sidebar from '@/components/layout/Sidebar';

// export default function SidebarLayout({ children }: { children: ReactNode }) {
//   return (
//     <div className="d-flex">
//       <Sidebar />
//       <div className="flex-grow-1">
//         {children}
//       </div>
//     </div>
//   );
// }

// // components/Layout.js
// import Sidebar from './Sidebar';
// import styles from './Layout.module.css'; // Optional: for styling the layout

// const SidebarLayout = ({ children }) => {
//   return (
//     <div className={styles.container}>
//       <Sidebar />
//       <main className={styles.mainContent}>
//         {children}
//       </main>
//     </div>
//   );
// };

// export default SidebarLayout;