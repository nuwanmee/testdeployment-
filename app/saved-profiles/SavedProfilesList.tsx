'use client';

import { useState, useEffect } from 'react';
import ProfileCard from '@/components/ProfileCard'; // Use the same ProfileCard component
import Pagination from '@/components/Pagination';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface ProfileWithDetails {
  id: number;
  profileId: string;
  email?: string;
  phone?: string;
  profile?: {
    photos?: { id: number; url: string; isMain: boolean }[];
    sex?: string;
    birthday?: string;
    district?: string;
    maritalStatus?: string;
    religion?: string;
    caste?: string;
    height?: number;
    motherTongue?: string;
    education?: string;
    occupation?: string;
    annualIncome?: string;
    aboutMe?: string;
    familyDetails?: string;
    hobbies?: string;
    expectations?: string;
  };
}

interface SavedProfilesListProps {
  initialProfiles: ProfileWithDetails[];
  totalProfiles: number;
  page: number;
  perPage: number;
  currentUserId: number;
}

export default function SavedProfilesList({
  initialProfiles,
  totalProfiles,
  page,
  perPage,
  currentUserId,
}: SavedProfilesListProps) {
  const [profiles, setProfiles] = useState<ProfileWithDetails[]>(initialProfiles);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Update profiles when initial data changes
  useEffect(() => {
    setProfiles(initialProfiles);
  }, [initialProfiles]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Handle removing profile from saved list (client-side)
  const handleRemoveProfile = (profileId: number) => {
    setProfiles(profiles.filter(profile => profile.id !== profileId));
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium">You haven't saved any profiles yet</h3>
        <p className="text-gray-500 mt-2">
          Browse profiles and click the bookmark icon to save them for later.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard 
            key={profile.id} 
            profile={profile} 
            isCurrentUser={profile.id === currentUserId}
            currentUserId={currentUserId} 
          />
        ))}
      </div>

      {totalProfiles > perPage && (
        <div className="mt-8">
          <Pagination
            totalItems={totalProfiles}
            itemsPerPage={perPage}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}