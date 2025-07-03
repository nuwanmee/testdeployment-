// src/utils/userUtils.ts
import { prisma } from '../lib/prisma';
import connectToDatabase from '../lib/mongodb';
import { Message } from '../models/message';
import { Notification } from '../models/notification';
import { ActivityLog } from '../models/activityLog';

// Utility to get user data from MySQL with MongoDB message/notification counts
export async function getUserWithMessageCounts(userId: number) {
  // Get user from MySQL
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      sentProposals: true,
      receivedProposals: true,
    },
  });

  if (!user) return null;

  // Connect to MongoDB to get message and notification counts
  await connectToDatabase();

  // Get unread message count
  const conversations = await Message.find({ participants: userId });
  let unreadMessageCount = 0;
  
  conversations.forEach(conversation => {
    unreadMessageCount += conversation.messages.filter(
      msg => !msg.isRead && msg.senderId !== userId
    ).length;
  });

  // Get notification count
  const userNotifications = await Notification.findOne({ userId });
  const unreadNotificationCount = userNotifications?.unreadCount || 0;

  return {
    ...user,
    unreadMessageCount,
    unreadNotificationCount,
  };
}

// Create a notification in MongoDB
export async function createNotification({
  userId,
  type,
  title,
  content,
  link,
  relatedId
}: {
  userId: number;
  type: 'PROPOSAL' | 'MESSAGE' | 'SUBSCRIPTION' | 'PAYMENT' | 'SYSTEM';
  title: string;
  content: string;
  link?: string;
  relatedId?: string;
}) {
  // Connect to MongoDB
  await connectToDatabase();
  
  // Find or create notification document
  let notification = await Notification.findOne({ userId });

  if (!notification) {
    notification = await Notification.create({
      userId,
      notifications: [],
      unreadCount: 0,
      lastUpdatedAt: new Date()
    });
  }

  // Add the notification
  notification.notifications.push({
    type,
    title,
    content,
    isRead: false,
    link,
    relatedId,
    createdAt: new Date()
  });

  notification.unreadCount += 1;
  notification.lastUpdatedAt = new Date();
  
  await notification.save();
  return notification;
}

// Log an activity
export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
  userAgent
}: {
  userId: number;
  action: string;
  entityType: string;
  entityId?: string | number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  // Connect to MongoDB
  await connectToDatabase();
  
  // Create activity log
  return ActivityLog.create({
    userId,
    action,
    entityType,
    entityId,
    details,
    ipAddress,
    userAgent,
  });
}