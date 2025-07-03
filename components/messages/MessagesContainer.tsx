'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@prisma/client';
import MessageBubble from './MessageBubble';

interface MessagesContainerProps {
  initialMessages: Message[];
  conversationId: string;
  userId: string;
}

export default function MessagesContainer({
  initialMessages,
  conversationId,
  userId,
}: MessagesContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {initialMessages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isCurrentUser={message.senderId === userId}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}