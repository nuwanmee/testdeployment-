// app/saved-profiles/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation';
import SavedProfilesList from './SavedProfilesList';
import prisma from '@/lib/db';
import Navbar from '@/components/layout/Navbar';
import BackButton from '@/components/ui/BackButton';
import { Sidebar } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';

async function getSavedProfiles(userId: number, page: number = 1, perPage: number = 9) {
  // Get saved profiles with related data
  const savedProfiles = await prisma.savedProfile.findMany({
    where: { userId },
    include: {
      profile: {
        include: {
          photos: true,
          user: {
            select: {
              id: true,
              email: true,
              // Removed phone and profileId as they don't exist in the User model
            },
          },
        },
      },
    },
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { id: 'desc' },
  });

  // Get total count
  const totalProfiles = await prisma.savedProfile.count({
    where: { userId },
  });

  return {
    profiles: savedProfiles.map(saved => {
      // Return the profile data with user data combined for the ProfileCard component
      return {
        id: saved.profile.user.id,
        email: saved.profile.user.email,
        // Removed phone as it doesn't exist in the User model
        profile: {
          ...saved.profile,
          photos: saved.profile.photos || [],
        },
      };
    }),
    totalProfiles,
  };
}

export default async function SavedProfilesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login?returnUrl=/saved-profiles');
  }

  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const perPage = 9; // Profiles per page
  const userId = parseInt(session.user.id);

  const { profiles, totalProfiles } = await getSavedProfiles(userId, page, perPage);

  return (
    <SidebarLayout>
    <div className="container mx-auto py-8">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">Saved Profiles</h1>
      
      <SavedProfilesList 
        initialProfiles={profiles}
        totalProfiles={totalProfiles}
        page={page}
        perPage={perPage}
        currentUserId={userId}
      />
    </div>
    </SidebarLayout>
  );
}