// src/components/proposals/ProposalSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Send, Inbox, Check, X } from 'lucide-react';
import useProposalStore from '@/store/proposalStore';

const ProposalSidebar: React.FC = () => {
  const pathname = usePathname();
  const {
    pendingSentProposals,
    pendingReceivedProposals,
    acceptedProposals,
    rejectedSentProposals,
    rejectedReceivedProposals
  } = useProposalStore();

  const navItems = [
    {
      title: 'All Proposals',
      href: '/proposals',
      icon: <Inbox size={18} />,
      count: pendingSentProposals.length + pendingReceivedProposals.length + acceptedProposals.length + rejectedSentProposals.length + rejectedReceivedProposals.length
    },
    {
      title: 'Sent Proposals',
      href: '/proposals/sent',
      icon: <Send size={18} />,
      count: pendingSentProposals.length + rejectedSentProposals.length
    },
    {
      title: 'Received Proposals',
      href: '/proposals/received',
      icon: <Inbox size={18} />,
      count: pendingReceivedProposals.length + rejectedReceivedProposals.length,
      notification: pendingReceivedProposals.length > 0 ? pendingReceivedProposals.length : null
    },
    {
      title: 'Accepted Matches',
      href: '/proposals/accepted',
      icon: <Check size={18} />,
      count: acceptedProposals.length
    }
  ];

  return (
    <div className="w-full md:w-64 bg-white shadow-sm rounded-lg p-4">
      <h3 className="font-medium text-lg mb-4">Proposals</h3>
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 rounded-md ${
              pathname === item.href
                ? 'bg-primary text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </div>
            <div className="flex items-center">
              {item.notification && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white rounded-full text-xs mr-2">
                  {item.notification}
                </span>
              )}
              <span className="text-sm">{item.count}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default ProposalSidebar;