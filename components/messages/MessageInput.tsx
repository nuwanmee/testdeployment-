'use client';

import { useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';
import { createMessage } from '@/data/message';
import { useRouter } from 'next/navigation';

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      await createMessage(conversationId, /* senderId will come from session */ 'senderId', content);
      setContent('');
      router.refresh(); // Refresh to show new message
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
      <div className="flex space-x-2">
        <input
          ref={inputRef}
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}