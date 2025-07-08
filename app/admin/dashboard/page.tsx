// app/admin/dashboard/page.tsx
'use client';

import { useProfileStore } from '@/stores/profileStore';
import { useEffect } from 'react';
import AdminNotificationCard from '@/components/admin/AdminNotificationCard';
import ProfileApprovalLists from '@/components/admin/ProfileApprovalLIsts';


export default function AdminDashboard() {
  const { pendingProfiles, fetchProfiles, loading, error } = useProfileStore();
  
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <AdminNotificationCard count={pendingProfiles.length} />
      <ProfileApprovalLists />
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}