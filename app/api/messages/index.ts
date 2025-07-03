// src/pages/api/messages/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
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

  if (req.method === 'GET') {
    try {
      // Get all conversations for the current user
      const conversations = await Message.find({
        participants: userId
      })
      .sort({ lastMessageAt: -1 })
      .limit(20);

      return res.status(200).json(conversations);
    } catch (error) {
      console.error('Error getting conversations:', error);
      return res.status(500).json({ message: "Error fetching conversations" });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const { recipientId, message } = req.body;
      
      if (!recipientId || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const recipientIdNum = parseInt(recipientId, 10);
      
      // Check if conversation exists
      let conversation = await Message.findOne({
        participants: { $all: [userId, recipientIdNum] }
      });

      if (!conversation) {
        // Create new conversation
        conversation = await Message.create({
          conversationId: `${userId}-${recipientIdNum}`,
          participants: [userId, recipientIdNum],
          messages: [],
          lastMessageAt: new Date()
        });
      }

      // Add message to conversation
      conversation.messages.push({
        senderId: userId,
        content: message,
        isRead: false,
        createdAt: new Date()
      });

      conversation.lastMessageAt = new Date();
      await conversation.save();

      return res.status(201).json(conversation);
    } catch (error) {
      console.error('Error sending message:', error);
      return res.status(500).json({ message: "Error sending message" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

