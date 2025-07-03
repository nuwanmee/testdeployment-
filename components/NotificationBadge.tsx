'use client';
import { useNotifications } from '@/stores/proposal';

export default function NotificationBadge() {
  const { count, lastUpdate } = useNotifications();

  return (
    <div className="relative">
      <BellIcon className="w-6 h-6" />
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {count}
        </span>
      )}
    </div>
  );
}