import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'
import { prisma } from '../../../lib/prisma';
import { createNotification, logActivity } from '../../../utils/userUtils';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "You must be logged in." });
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const userId = parseInt(session.user.id, 10);
  const { receiverId, message } = req.body;
  
  if (!receiverId) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    // 1. Store the proposal in MySQL using Prisma
    const proposal = await prisma.proposal.create({
      data: {
        senderId: userId,
        receiverId: parseInt(receiverId, 10),
        status: 'SENT',
        message: message || '',
      },
    });
    // 2. Create a notification in MongoDB
    const receiver = await prisma.user.findUnique({
      where: { id: parseInt(receiverId, 10) },
      select: { firstName: true, lastName: true }
    });
    const senderUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true }
    });
    const senderName = `${senderUser?.firstName || ''} ${senderUser?.lastName || ''}`.trim();
    
    await createNotification({
      userId: parseInt(receiverId, 10),
      type: 'PROPOSAL_RECEIVED',
      message: `${senderName} has sent you a proposal`,
      data: {
        proposalId: proposal.id,
        senderId: userId,
      },
      read: false
    });

    // 3. Log activity for the sender
    await logActivity({
      userId,
      type: 'PROPOSAL_SENT',
      description: `You sent a proposal to ${receiver?.firstName || ''} ${receiver?.lastName || ''}`.trim(),
      metadata: {
        proposalId: proposal.id,
        receiverId: parseInt(receiverId, 10)
      }
    });

    return res.status(200).json({ 
      success: true, 
      proposal 
    });
  } catch (error) {
    console.error('Error sending proposal:', error);
    return res.status(500).json({ 
      message: "Failed to send proposal", 
      error: error.message 
    });
  }
}