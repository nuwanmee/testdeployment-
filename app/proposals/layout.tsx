// src/app/proposals/layout.tsx
import React from 'react';
import ProposalSidebar from '@/components/proposals/ProposalSidebar';

export default function ProposalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64">
          <ProposalSidebar />
        </div>
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}