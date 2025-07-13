
// src/pages/api/notifications/mark-read.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'
import connectToDatabase from '../../../lib/mongodb';
import { Notification } from '../../../models/notification';

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

  if (req.method === 'POST') {
    try {
      const { notificationIds } = req.body;
      
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({ message: "notificationIds array is required" });
      }

      // Mark specific notifications as read
      await Notification.updateOne(
        { userId },
        { 
          $set: { 
            "notifications.$[elem].isRead": true,
            lastUpdatedAt: new Date()
          },
          $inc: { unreadCount: -notificationIds.length }
        },
        { 
          arrayFilters: [{ "elem._id": { $in: notificationIds } }]
        }
      );

      return res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      return res.status(500).json({ message: "Error updating notifications" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

