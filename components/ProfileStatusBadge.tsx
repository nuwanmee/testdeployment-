// components/ProfileStatusBadge.tsx
'use client';

import type { ProfileStatus } from '@/types';

interface Props {
  status: ProfileStatus;
}

const statusColors: Record<ProfileStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
};

export default function ProfileStatusBadge({ status }: Props) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
      {status.toLowerCase()}
    </span>
  );
}