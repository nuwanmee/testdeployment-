// src/app/proposals/received/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ProposalCard from '@/components/proposals/ProposalCard';
import useProposalStore from '@/store/proposalStore';
import { Sidebar } from 'lucide-react';
import SidebarLayout from '@/components/layout/SidebarLayout';

export default function ReceivedProposalsPage() {
  const { data: session, status } = useSession();
  const { 
    receivedProposals, 
    fetchUserProposals, 
    acceptProposal, 
    rejectProposal, 
    loading 
  } = useProposalStore();
  
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('ALL');
  
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProposals(Number(session.user.id));
    }
  }, [session, fetchUserProposals]);
  
  // Filter proposals based on selected status
  const filteredProposals = filter === 'ALL' 
    ? receivedProposals 
    : receivedProposals.filter(p => p.status === filter);
  
  // Check if user is authenticated
  if (status === 'loading') {
    return <div className="container mx-auto p-6">Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    redirect('/login');
  }
  
  return (
    <SidebarLayout>
    <div className="container mx-auto p-4 md:p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Received Proposals</h2>
          
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="p-2 border rounded-md text-sm"
            >
              <option value="ALL">All Proposals</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading proposals...</div>
          ) : filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                viewMode="received"
                onAccept={proposal.status === 'PENDING' ? acceptProposal : undefined}
                onReject={proposal.status === 'PENDING' ? rejectProposal : undefined}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              You haven't received any {filter !== 'ALL' ? filter.toLowerCase() : ''} proposals yet.
            </div>
          )}
        </div>
      </div>
    </div>
    </SidebarLayout>
  );
}
