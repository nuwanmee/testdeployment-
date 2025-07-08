import { Message } from '@prisma/client';
import { format } from 'date-fns';
import Avatar from '../ui/Avatar';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} space-x-2`}
    >
      {!isCurrentUser && (
        <Avatar
          // You might want to pass the sender's avatar here
          name={message.senderId}
          className="h-8 w-8 self-end"
        />
      )}
      <div
        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
          isCurrentUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-900 rounded-bl-none'
        }`}
      >
        <p>{message.content}</p>
        <p
          className={`text-xs mt-1 ${
            isCurrentUser ? 'text-blue-100' : 'text-gray-500'
          }`}
        >
          {format(new Date(message.createdAt), 'h:mm a')}
        </p>
      </div>
    </div>
  );
}