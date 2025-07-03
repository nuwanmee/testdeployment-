// src/models/activityLog.ts
import mongoose, { Document, Schema } from 'mongoose';

// Connect to MongoDB if the models don't exist yet
mongoose.models = mongoose.models || {};

export interface IActivityLog extends Document {
  userId: number;  // MySQL user ID
  action: string;
  entityType: string;
  entityId?: string | number;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema({
  userId: {
    type: Number,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    index: true
  },
  entityId: {
    type: Schema.Types.Mixed,
    index: true
  },
  details: {
    type: Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Only create the model if it doesn't exist already
export const ActivityLog = mongoose.models.ActivityLog || 
  mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);