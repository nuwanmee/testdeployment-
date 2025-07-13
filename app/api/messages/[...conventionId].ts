// src/pages/api/messages/[conversationId].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'
import connectToDatabase from '../../../lib/mongodb';
import { Message } from '../../../models/message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ message: "You must be logged in." });
  }

  // Connect to MongoDB
  await connectToDatabase();

  const userId = parseInt(session.user.id, 10);
  const { conversationId } = req.query;

  if (req.method === 'GET') {
    try {
      // Get conversation by ID
      const conversation = await Message.findOne({
        conversationId: conversationId as string,
        participants: userId
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Mark messages as read if you're the recipient
      if (conversation.messages.length > 0) {
        const unreadMessages = conversation.messages.filter(
          msg => !msg.isRead && msg.senderId !== userId
        );

        if (unreadMessages.length > 0) {
          await Message.updateOne(
            { 
              _id: conversation._id,
              "messages._id": { $in: unreadMessages.map(msg => msg._id) }
            },
            { 
              $set: { 
                "messages.$[elem].isRead": true,
                "messages.$[elem].readAt": new Date()
              }
            },
            { 
              arrayFilters: [{ "elem._id": { $in: unreadMessages.map(msg => msg._id) } }]
            }
          );
        }
      }

      return res.status(200).json(conversation);
    } catch (error) {
      console.error('Error getting conversation:', error);
      return res.status(500).json({ message: "Error fetching conversation" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}