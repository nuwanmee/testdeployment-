'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Heart, BookmarkX, User, ExternalLink } from 'lucide-react';

interface SavedProfileCardProps {
  SavedProfile: {
    id: number;
    createdAt: string;
    profile: {
      id: number;
      profileId: string;
      profile?: {
        photos?: { id: number; url: string; isMain: boolean }[];
        sex?: string;
        birthday?: string;
        district?: string;
        religion?: string;
        caste?: string;
        occupation?: string;
      };
    };
  };
  currentUserId: number;
  onRemove?: (SavedProfileId: number) => void;
}

export default function SavedProfileCard({ SavedProfile, currentUserId, onRemove }: SavedProfileCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const profile = SavedProfile.profile;
  
  // Calculate age from birthday
  const calculateAge = (birthday?: string) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Handle send proposal
  const handleSendProposal = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // API call to send proposal
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: profile.id,
          senderId: currentUserId
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to send proposal');
      }
    } catch (error) {
      console.error('Error sending proposal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle remove from saved
  const handleRemove = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // API call to remove from saved
      const response = await fetch('/api/saved-profiles', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          SavedProfileId: SavedProfile.id
        }),
      });
      
      if (response.ok && onRemove) {
        onRemove(SavedProfile.id);
      } else {
        console.error('Failed to remove from saved profiles');
      }
    } catch (error) {
      console.error('Error removing from saved profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get appropriate placeholder image based on gender
  const getPlaceholderImage = () => {
    const gender = profile.profile?.sex?.toLowerCase() || 'other';
    
    if (gender === 'male') {
      return '/images/placeholder-male.png';
    } else if (gender === 'female') {
      return '/images/placeholder-female.png';
    } else {
      return '/images/placeholder-other.png';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
      {/* Profile photo */}
      <div className="md:w-1/4 w-full">
        <Link href={`/profiles/${profile.id}`} className="block">
          {profile.profile?.photos?.find((p) => p.isMain) ? (
            <img 
              src={profile.profile.photos.find((p) => p.isMain)?.url}
              alt={profile.profileId}
              className="w-full h-40 object-cover"
            />
          ) : (
            <img 
              src={getPlaceholderImage()}
              alt={profile.profileId}
              className="w-full h-40 object-cover"
            />