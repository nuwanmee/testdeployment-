// src/pages/api/logs/activity.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'
import connectToDatabase from '../../../lib/mongodb';
import { ActivityLog } from  '../../../models/activityLog'

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
      const { action, entityType, entityId, details } = req.body;
      
      if (!action || !entityType) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Create activity log
      const log = await ActivityLog.create({
        userId,
        action,
        entityType,
        entityId,
        details,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      return res.status(201).json({ message: "Activity logged", id: log._id });
    } catch (error) {
      console.error('Error logging activity:', error);
      return res.status(500).json({ message: "Error logging activity" });
    }
  } 
  
  else if (req.method === 'GET') {
    // Only admins can retrieve logs
    if (session.user.role !== 'ADMIN') {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const { user, type, action, startDate, endDate, page = '1', limit = '20' } = req.query;
      
      // Build query
      const query: any = {};
      
      if (user) query.userId = parseInt(user as string, 10);
      if (type) query.entityType = type;
      if (action) query.action = action;
      
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate as string);
        if (endDate) query.createdAt.$lte = new Date(endDate as string);
      }

      // Pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;
      
      // Execute query
      const logs = await ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);
        
      const total = await ActivityLog.countDocuments(query);
      
      return res.status(200).json({
        logs,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalLogs: total
      });
    } catch (error) {
      console.error('Error retrieving activity logs:', error);
      return res.status(500).json({ message: "Error retrieving activity logs" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}