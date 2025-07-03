// components/RealTimeListener.tsx
'use client';

import { useEffect } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import Pusher from 'pusher-js';

export default function RealTimeListener() {
  const { fetchProfiles } = useProfileStore();
  
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    
    const channel = pusher.subscribe('admin-channel');
    channel.bind('profile-notification', () => {
      fetchProfiles();
    });
    
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [fetchProfiles]);
  
  return null;
}