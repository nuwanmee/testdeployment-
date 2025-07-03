"use client";

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ProposalCard from '@/components/proposals/ProposalCard';
import useProposalStore from '@/store/proposalStore';

export default function AcceptedProposalsPage() {
  const { data: session, status } = useSession();
  const { acceptedProposals, fetchUserProposals, loading } = useProposalStore();

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserProposals(Number(session.user.id));
    }
  }, [session, fetchUserProposals]);

  // Check if user is authenticated
  if (status === 'loading') {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Accepted Proposals</h1>
        <div className="text-sm text-gray-500">
          {acceptedProposals.length} {acceptedProposals.length === 1 ? 'proposal' : 'proposals'} accepted
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : acceptedProposals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {acceptedProposals.map((proposal) => (
            <ProposalCard key={proposal.id} proposal={proposal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No accepted proposals</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any accepted proposals yet.
          </p>
        </div>
      )}
    </div>
  );
}