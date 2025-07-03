// app/saved/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { User } from '@prisma/client';
import ProfileCard from '@/app/profiles/ProfileCard';
import BackButton from '@/components/ui/BackButton';
import Navbar from '@/components/layout/Navbar';

interface ProfileWithDetails extends User {
  profile?: {
    id: number;
    familyDetails?: string | null;
    hobbies?: string | null;
    expectations?: string | null;
    photos?: {
      id: number;
      url: string;
      isMain: boolean;
    }[];
  } | null;
}

export default function SavedProfilesPage() {
  const [SavedProfiles, setSavedProfiles] = useState<ProfileWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/session'); // Create this API endpoint
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data?.user?.id || null);
        } else {
          console.error('Failed to fetch session data');
        }
      } catch (error) {
        console.error('Error fetching session data:', error);
      }
    };

    const fetchSavedProfiles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/users/saved');
        if (!response.ok) {
          const message = await response.text();
          throw new Error(`Failed to fetch saved profiles: ${message}`);
        }
        const data: ProfileWithDetails[] = await response.json();
        setSavedProfiles(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchSavedProfiles();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading saved profiles...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (SavedProfiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium">No profiles saved yet</h3>
        <p className="text-gray-500 mt-2">Start saving profiles you like!</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Navbar />  
       <h2 className="text-2xl font-semibold mb-6">Saved Profiles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SavedProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isCurrentUser={false} // This is always false on the saved profiles page
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
}