// src/pages/api/notifications/index.ts
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

  if (!session) {
    return res.status(401).json({ message: "You must be logged in." });
  }

  // Connect to MongoDB
  await connectToDatabase();

  const userId = parseInt(session.user.id, 10);

  if (req.method === 'GET') {
    try {
      // Get user's notification document
      let userNotification = await Notification.findOne({ userId });

      if (!userNotification) {
        userNotification = await Notification.create({
          userId,
          notifications: [],
          unreadCount: 0,
          lastUpdatedAt: new Date()
        });
      }

      // Get query parameters for pagination
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '20', 10);
      
      // Extract just the notifications array with pagination logic
      const startIdx = (page - 1) * limit;
      const paginatedNotifications = userNotification.notifications
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(startIdx, startIdx + limit);

      return res.status(200).json({
        notifications: paginatedNotifications,
        unreadCount: userNotification.unreadCount,
        page,
        totalNotifications: userNotification.notifications.length
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      return res.status(500).json({ message: "Error fetching notifications" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
