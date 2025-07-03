// src/pages/api/notifications/create.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectToDatabase from '../../../lib/mongodb';
import { Notification } from '../../../models/notification';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Connect to MongoDB
  await connectToDatabase();

  if (req.method === 'POST') {
    try {
      const { userId, type, title, content, link, relatedId } = req.body;
      
      if (!userId || !type || !title || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const userIdNum = parseInt(userId, 10);
      
      // Find or create notification document for user
      let notification = await Notification.findOne({ userId: userIdNum });

      if (!notification) {
        notification = await Notification.create({
          userId: userIdNum,
          notifications: [],
          unreadCount: 0,
          lastUpdatedAt: new Date()
        });
      }

      // Add new notification
      const newNotification = {
        type,
        title,
        content,
        isRead: false,
        link,
        relatedId,
        createdAt: new Date()
      };

      notification.notifications.push(newNotification);
      notification.unreadCount += 1;
      notification.lastUpdatedAt = new Date();
      
      await notification.save();

      return res.status(201).json({ message: "Notification created" });
    } catch (error) {
      console.error('Error creating notification:', error);
      return res.status(500).json({ message: "Error creating notification" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}