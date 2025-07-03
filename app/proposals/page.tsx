'use client'

import { useState, useEffect } from 'react';
import { Heart, TablerIconsProps } from 'lucide-react';
import ProposalCard from './ProposalCard';

interface Proposal {
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
}

type TabType = 'received' | 'sent' | 'connected';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  count?: number;
}

const Tab = ({ label, isActive, onClick, icon, count }: TabProps) => (
  <button
    onClick={onClick}
    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
      isActive 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-white text-gray-700 hover:bg-gray-100'
    }`}
  >
    {icon}
    <span className="mx-2">{label}</span>
    {count !== undefined && (
      <span className={`px-2 py-0.5 text-xs rounded-full ${
        isActive ? 'bg-blue-200' : 'bg-gray-200'
      }`}>
        {count}
      </span>
    )}
  </button>
);

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('received');
  
  // Fetch current user ID and proposals on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
          fetchProposals(data.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setIsLoading(false);
      }
    };
    
    fetchCurrentUser();
  }, []);
  
  // Fetch proposals
  const fetchProposals = async (userId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals);
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter proposals based on active tab
  const filteredProposals = proposals.filter(proposal => {
    if (activeTab === 'received') {
      return proposal.receiver.id === currentUserId && proposal.status !== 'ACCEPTED';
    } else if (activeTab === 'sent') {
      return proposal.sender.id === currentUserId && proposal.status !== 'ACCEPTED';
    } else {
      return proposal.status === 'ACCEPTED';
    }
  });
  
  // Count proposals for each tab
  const receivedCount = proposals.filter(p => p.receiver.id === currentUserId && p.status !== 'ACCEPTED').length;
  const sentCount = proposals.filter(p => p.sender.id === currentUserId && p.status !== 'ACCEPTED').length;
  const connectedCount = proposals.filter(p => p.status === 'ACCEPTED').length;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Heart className="w-6 h-6 mr-2 text-red-500" />
        <h1 className="text-2xl font-bold">Proposals</h1>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Tab 
          label="Received"
          isActive={activeTab === 'received'}
          onClick={() => setActiveTab('received')}
          icon={<span className="text-blue-500">↓</span>}
          count={receivedCount}
        />
        <Tab 
          label="Sent"
          isActive={activeTab === 'sent'}
          onClick={() => setActiveTab('sent')}
          icon={<span className="text-blue-500">↑</span>}
          count={sentCount}
        />
        <Tab 
          label="Connected"
          isActive={activeTab === 'connected'}
          onClick={() => setActiveTab('connected')}
          icon={<span className="text-green-500">✓</span>}
          count={connectedCount}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredProposals.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No {activeTab} proposals found.</p>
          {activeTab === 'sent' && (
            <p className="mt-2">Browse profiles and send proposals to potential matches.</p>
          )}
          {activeTab === 'received' && (
            <p className="mt-2">When someone sends you a proposal, it will appear here.</p>
          )}
          {activeTab === 'connected' && (
            <p className="mt-2">When you accept a proposal or someone accepts yours, they will appear here.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredProposals.map(proposal => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              viewAs={activeTab === 'sent' ? 'sender' : 'receiver'}
              currentUserId={currentUserId!}
            />
          ))}
        </div>
      )}
    </div>
  );
}