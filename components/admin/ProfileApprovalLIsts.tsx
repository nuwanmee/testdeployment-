// components/admin/ProfileApprovalLists.tsx
'use client';

import { useProfileStore } from '@/stores/profileStore';
import ProfileListItem from './ProfileListItem';

export default function ProfileApprovalLists() {
  const {
    pendingProfiles,
    approvedProfiles,
    rejectedProfiles,
    approveProfile,
    rejectProfile
  } = useProfileStore();
  
  return (
    <div className="space-y-8">
      <section id="pending-profiles">
        <h2 className="text-xl font-semibold mb-4">Pending Approval ({pendingProfiles.length})</h2>
        <div className="bg-white shadow rounded-lg p-4">
          {pendingProfiles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {pendingProfiles.map((profile) => (
                <ProfileListItem 
                  key={profile.id}
                  profile={profile}
                  onApprove={() => approveProfile(profile.id)}
                  onReject={() => rejectProfile(profile.id)}
                  showActions
                />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No profiles pending approval</p>
          )}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Approved Profiles ({approvedProfiles.length})</h2>
        <div className="bg-white shadow rounded-lg p-4">
          {approvedProfiles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {approvedProfiles.map((profile) => (
                <ProfileListItem key={profile.id} profile={profile} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No approved profiles</p>
          )}
        </div>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">Rejected Profiles ({rejectedProfiles.length})</h2>
        <div className="bg-white shadow rounded-lg p-4">
          {rejectedProfiles.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {rejectedProfiles.map((profile) => (
                <ProfileListItem key={profile.id} profile={profile} />
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No rejected profiles</p>
          )}
        </div>
      </section>
    </div>
  );
}