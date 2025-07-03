// components/admin/MobileSidebarToggle.tsx
'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import { AdminSidebar } from './AdminSidebar'

export function MobileSidebarToggle() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <button 
        className="btn btn-primary d-md-none"
        type="button"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={20} />
      </button>

      <div className={`offcanvas offcanvas-start ${sidebarOpen ? 'show' : ''}`} tabIndex={-1}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Admin Menu</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSidebarOpen(false)}
          ></button>
        </div>
        <div className="offcanvas-body">
          <AdminSidebar />
        </div>
      </div>
      
      {sidebarOpen && (
        <div 
          className="offcanvas-backdrop fade show"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  )
}