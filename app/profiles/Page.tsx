// app/profiles/page.tsx
'use client';

import { useProfileStore } from '@/stores/profileStore';
import { useEffect } from 'react';

export default function ProfilesPage() {
  const { approvedProfiles, fetchProfiles, loading, error } = useProfileStore();
  
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Browse Profiles</h1>
      
      {loading && <p>Loading profiles...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {approvedProfiles.map((profile) => (
          <div key={profile.id} className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold">{profile.name}</h2>
            {/* Render other profile details */}
          </div>
        ))}
      </div>
      
      {approvedProfiles.length === 0 && !loading && (
        <p className="text-gray-500">No profiles available</p>
      )}
    </div>
  );
}