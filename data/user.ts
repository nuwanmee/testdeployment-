import {prisma} from '../lib/prisma';
import { User } from '@prisma/client';

export type ConversationWithUsersAndMessages = Awaited<
  ReturnType<typeof getConversation>
>;

export async function getConversations(userId: string) {
  return await prisma.conversation.findMany({
    where: {
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: true,
      user2: true,
      messages: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

export async function getConversation(conversationId: string, userId: string) {
  return await prisma.conversation.findUnique({
    where: {
      id: conversationId,
      OR: [{ user1Id: userId }, { user2Id: userId }],
    },
    include: {
      user1: true,
      user2: true,
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
}

export async function createMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  return await prisma.$transaction([
    prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
}