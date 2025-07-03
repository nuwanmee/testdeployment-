// components/admin/ProfileListItem.tsx
'use client';

import { Profile } from '@/stores/profileStore';

interface ProfileListItemProps {
  profile: Profile;
  onApprove?: () => void;
  onReject?: () => void;
  showActions?: boolean;
}

export default function ProfileListItem({
  profile,
  onApprove,
  onReject,
  showActions = false
}: ProfileListItemProps) {
  return (
    <li className="py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{profile.name}</h3>
          <p className="text-sm text-gray-500">
            {profile.status} • {new Date(profile.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        {showActions && (
          <div className="space-x-2">
            <button
              onClick={onApprove}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Approve
            </button>
            <button
              onClick={onReject}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </li>
  );
}