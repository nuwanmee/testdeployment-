// src/app/api/proposals/[id]/reject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma }from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const proposalId = parseInt(params.id);
    
    // Find the proposal
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId }
    });
    
    if (!proposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    // Update proposal status
    const updatedProposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: { status: 'REJECTED' },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true
          }
        }
      }
    });
    
    // Create notification for sender
    await prisma.notification.create({
      data: {
        userId: proposal.senderId,
        type: 'PROPOSAL',
        content: `Your proposal has been declined`,
        link: `/proposals/sent/${proposalId}`
      }
    });
    
    return NextResponse.json(updatedProposal);
  } catch (error) {
    console.error('Error rejecting proposal:', error);
    return NextResponse.json(
      { error: 'Failed to reject proposal' },
      { status: 500 }
    );
  }
}