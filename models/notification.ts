
// src/models/notification.ts
import mongoose, { Document, Schema } from 'mongoose';

// Connect to MongoDB if the models don't exist yet
mongoose.models = mongoose.models || {};

export interface INotification extends Document {
  userId: number;  // MySQL user ID
  notifications: Array<{
    type: 'PROPOSAL' | 'MESSAGE' | 'SUBSCRIPTION' | 'PAYMENT' | 'SYSTEM';
    title: string;
    content: string;
    isRead: boolean;
    link?: string;
    relatedId?: string;
    createdAt: Date;
  }>;
  unreadCount: number;
  lastUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema({
  userId: {
    type: Number,  // MySQL user ID
    required: true,
    index: true
  },
  notifications: [{
    type: {
      type: String,
      enum: ['PROPOSAL', 'MESSAGE', 'SUBSCRIPTION', 'PAYMENT', 'SYSTEM'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String
    },
    relatedId: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  unreadCount: {
    type: Number,
    default: 0
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Create indexes for common queries
NotificationSchema.index({ userId: 1, "notifications.isRead": 1 });
NotificationSchema.index({ userId: 1, "notifications.createdAt": -1 });

// Only create the model if it doesn't exist already
export const Notification = mongoose.models.Notification || 
  mongoose.model<INotification>('Notification', NotificationSchema);