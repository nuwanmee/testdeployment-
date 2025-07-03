'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Heart, Mail, User, X, Check, Calendar, ExternalLink } from 'lucide-react';

interface ProposalCardProps {
  proposal: {
    id: number;
    status: string;
    createdAt: string;
    sender: {
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
    receiver: {
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
  viewAs: 'sender' | 'receiver';
  currentUserId: number;
}

export default function ProposalCard({ proposal, viewAs, currentUserId }: ProposalCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(proposal.status);
  
  // Determine which profile to display based on viewAs
  const profile = viewAs === 'sender' ? proposal.receiver : proposal.sender;
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Calculate age from birthday
  const calculateAge = (birthday?: string) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Handle proposal response (accept/reject)
  const handleProposalResponse = async (action: 'ACCEPT' | 'REJECT') => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Optimistic UI update
      setStatus(action);
      
      // API call to update proposal
      const response = await fetch(`/api/proposals/${proposal.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: action
        }),
      });
      
      if (!response.ok) {
        // Revert on failure
        setStatus(proposal.status);
        console.error(`Failed to ${action.toLowerCase()} proposal`);
      }
    } catch (error) {
      // Revert on error
      setStatus(proposal.status);
      console.error(`Error ${action.toLowerCase()}ing proposal:`, error);
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

  // Get status badge
  const getStatusBadge = () => {
    const badgeClasses = {
      'SENT': 'bg-yellow-200 text-yellow-800',
      'RECEIVED': 'bg-blue-200 text-blue-800',
      'ACCEPT': 'bg-green-200 text-green-800',
      'ACCEPTED': 'bg-green-200 text-green-800',
      'REJECT': 'bg-red-200 text-red-800',
      'REJECTED': 'bg-red-200 text-red-800'
    };
    
    const badgeText = {
      'SENT': 'Sent',
      'RECEIVED': 'Received',
      'ACCEPT': 'Accepted',
      'ACCEPTED': 'Accepted',
      'REJECT': 'Rejected',
      'REJECTED': 'Rejected'
    };
    
    const statusKey = status as keyof typeof badgeClasses;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClasses[statusKey] || 'bg-gray-200 text-gray-800'}`}>
        {badgeText[statusKey] || status}
      </span>
    );
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
          )}
        </Link>
      </div>
      
      {/* Profile info and actions */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Link href={`/profiles/${profile.id}`} className="hover:underline">
              <h3 className="text-lg font-semibold">{profile.profileId}</h3>
            </Link>
            {getStatusBadge()}
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
            {profile.profile?.occupation && (
              <p className="text-sm"><span className="font-medium">Occupation:</span> {profile.profile.occupation}</p>
            )}
            {profile.profile?.birthday && (
              <p className="text-sm"><span className="font-medium">Age:</span> {calculateAge(profile.profile.birthday)} years</p>
            )}
            {profile.profile?.district && (
              <p className="text-sm"><span className="font-medium">District:</span> {profile.profile.district}</p>
            )}
            {profile.profile?.religion && (
              <p className="text-sm"><span className="font-medium">Religion:</span> {profile.profile.religion}</p>
            )}
            {profile.profile?.caste && (
              <p className="text-sm"><span className="font-medium">Caste:</span> {profile.profile.caste}</p>
            )}
          </div>
          
          <p className="text-xs text-gray-500 flex items-center mt-1">
            <Calendar className="w-3 h-3 mr-1" />
            {viewAs === 'sender' ? 'Sent' : 'Received'} on {formatDate(proposal.createdAt)}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="mt-4 flex gap-2 flex-wrap">
          {viewAs === 'receiver' && status === 'RECEIVED' && (
            <>
              <button 
                onClick={() => handleProposalResponse('ACCEPT')}
                disabled={isLoading}
                className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-1" />
                {isLoading ? 'Processing...' : 'Accept'}
              </button>
              <button 
                onClick={() => handleProposalResponse('REJECT')}
                disabled={isLoading}
                className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                {isLoading ? 'Processing...' : 'Reject'}
              </button>
            </>
          )}
          
          {(status === 'ACCEPTED' || status === 'ACCEPT') && (
            <Link 
              href={`/messages/${profile.id}`} 
              className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Mail className="w-4 h-4 mr-1" />
              Message
            </Link>
          )}
          
          <Link 
            href={`/profiles/${profile.id}`} 
            className="flex items-center px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            View Profile
          </Link>
        </div>
      </div>
    </div>
  );
}