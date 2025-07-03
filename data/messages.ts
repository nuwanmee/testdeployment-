import {prisma} from '../lib/prisma';
import { User, Conversation, Message } from '@prisma/client';

export type ConversationWithUsersAndMessages = Conversation & {
  user1: User;
  user2: User;
  messages: Message[];
};

export async function getConversations(userId: string): Promise<ConversationWithUsersAndMessages[]> {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: {
          include: {
            profile: true // Include profile data for user1
          }
        },
        user2: {
          include: {
            profile: true // Include profile data for user2
          }
        },
        messages: {
          take: 1, // Only get the most recent message
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        updatedAt: 'desc' // Sort by most recently updated
      }
    });

    return conversations.map(conversation => ({
      ...conversation,
      // Ensure we always have at least an empty array for messages
      messages: conversation.messages || []
    }));
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw new Error('Failed to fetch conversations');
  }
}

// Utility function to get the other user in a conversation
export function getOtherUser(
  conversation: ConversationWithUsersAndMessages,
  currentUserId: string
): User & { profile?: { photo?: string | null } } {
  return conversation.user1Id === currentUserId ? conversation.user2 : conversation.user1;
}