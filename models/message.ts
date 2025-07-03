// src/models/message.ts
import mongoose, { Document, Schema } from 'mongoose';

// Connect to MongoDB if the models don't exist yet
mongoose.models = mongoose.models || {};

export interface IMessage extends Document {
  conversationId: string;
  participants: number[];  // MySQL user IDs
  messages: Array<{
    senderId: number;  // MySQL user ID
    content: string;
    attachments?: Array<{
      type: string;
      url: string;
      name: string;
    }>;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
  }>;
  lastMessageAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema({
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  participants: [{
    type: Number,  // MySQL user IDs
    required: true,
    index: true
  }],
  messages: [{
    senderId: {
      type: Number,  // MySQL user ID
      required: true
    },
    content: {
      type: String,
      required: true
    },
    attachments: [{
      type: String,
      url: String,
      name: String
    }],
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true 
});

// Create indexes for common queries
MessageSchema.index({ participants: 1, lastMessageAt: -1 });
MessageSchema.index({ "messages.createdAt": -1 });

// Only create the model if it doesn't exist already
export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);


