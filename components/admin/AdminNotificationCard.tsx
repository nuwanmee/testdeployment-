// components/admin/AdminNotificationCard.tsx
'use client';

import Link from 'next/link';

export default function AdminNotificationCard({ count }: { count: number }) {
  if (count === 0) return null;
  
  return (
    <Link href="#pending-profiles">
      <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 cursor-pointer hover:bg-blue-200 transition">
        <div className="flex items-center">
          <div className="mr-4">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              {count}
            </div>
          </div>
          <div>
            <p className="font-bold">Pending Profiles</p>
            <p>{count} profile(s) need your approval</p>
          </div>
        </div>
      </div>
    </Link>
  );
}