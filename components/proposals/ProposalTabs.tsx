// src/components/proposals/ProposalTabs.tsx
import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import useProposalStore from '@/store/useProposalStore';
import ProposalCard from './ProposalCard';
import { useSession } from 'next-auth/react';
import { classNames } from '@/utils/classNames';

function ProposalTabs() {
  const { data: session } = useSession();
  const {
    pendingSentProposals,
    pendingReceivedProposals,
    acceptedProposals,
    rejectedSentProposals,
    rejectedReceivedProposals,
    fetchUserProposals,
    acceptProposal,
    rejectProposal,
    withdrawProposal,
    loading
  } = useProposalStore();
  
  const [viewMode, setViewMode] = useState<'sent' | 'received'>('received');
  
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProposals(Number(session.user.id));
    }
  }, [session, fetchUserProposals]);
  
  const tabCategories = [
    { name: 'Pending', count: viewMode === 'sent' ? pendingSentProposals.length : pendingReceivedProposals.length },
    { name: 'Accepted', count: acceptedProposals.length },
    { name: 'Rejected', count: viewMode === 'sent' ? rejectedSentProposals.length : rejectedReceivedProposals.length }
  ];
  
  return (
    <div className="w-full px-2 py-4 sm:px-0">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold">Proposals</h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">View:</span>
          <div className="bg-gray-100 rounded-md p-1 flex space-x-1">
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'received' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('received')}
            >
              Received
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-md ${
                viewMode === 'sent' ? 'bg-white shadow' : 'hover:bg-gray-200'
              }`}
              onClick={() => setViewMode('sent')}
            >
              Sent
            </button>
          </div>
        </div>
      </div>
      
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1">
          {tabCategories.map((category) => (
            <Tab
              key={category.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-md py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white shadow'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                )
              }
            >
              {category.name} ({category.count})
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-4">
          {/* Pending Proposals */}
          <Tab.Panel className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading proposals...</div>
            ) : viewMode === 'sent' ? (
              pendingSentProposals.length > 0 ? (
                pendingSentProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    viewMode="sent"
                    onWithdraw={withdrawProposal}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  You haven't sent any pending proposals.
                </div>
              )
            ) : pendingReceivedProposals.length > 0 ? (
              pendingReceivedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  viewMode="received"
                  onAccept={acceptProposal}
                  onReject={rejectProposal}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                You don't have any pending proposals.
              </div>
            )}
          </Tab.Panel>
          
          {/* Accepted Proposals */}
          <Tab.Panel className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading proposals...</div>
            ) : acceptedProposals.length > 0 ? (
              acceptedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  viewMode={proposal.senderId === Number(session?.user?.id) ? 'sent' : 'received'}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                You don't have any accepted proposals yet.
              </div>
            )}
          </Tab.Panel>
          
          {/* Rejected Proposals */}
          <Tab.Panel className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Loading proposals...</div>
            ) : viewMode === 'sent' ? (
              rejectedSentProposals.length > 0 ? (
                rejectedSentProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    viewMode="sent"
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  None of your proposals have been rejected.
                </div>
              )
            ) : rejectedReceivedProposals.length > 0 ? (
              rejectedReceivedProposals.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  viewMode="received"
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                You haven't rejected any proposals.
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default ProposalTabs;
