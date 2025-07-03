// src/app/api/proposals/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { senderId, receiverId, message, status } = body;
    
    // Validate required fields
    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: 'Sender ID and Receiver ID are required' },
        { status: 400 }
      );
    }
    
    // Check if a proposal already exists between these users
    const existingProposal = await prisma.proposal.findFirst({
      where: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        NOT: {
          status: 'REJECTED'
        }
      }
    });
    
    if (existingProposal) {
      return NextResponse.json(
        { error: 'A proposal already exists between these users' },
        { status: 400 }
      );
    }
    
    // Create new proposal
    const newProposal = await prisma.proposal.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        message: message || '',
        status: status || 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicture: true,
          }
        }
      }
    });
    
    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: parseInt(receiverId),
        type: 'PROPOSAL',
        content: `You have received a new proposal`,
        link: `/proposals/received/${newProposal.id}`
      }
    });
    
    return NextResponse.json(newProposal);
  } catch (error) {
    console.error('Error sending proposal:', error);
    return NextResponse.json(
      { error: 'Failed to send proposal' },
      { status: 500 }
    );
  }
}