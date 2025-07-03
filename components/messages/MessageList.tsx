import Link from 'next/link';
import { ConversationWithUsersAndMessages } from '@/types';
import Avatar from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  conversations: ConversationWithUsersAndMessages[];
  userId: string;
}

export default function MessageList({ conversations, userId }: MessageListProps) {
  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherUser = conversation.user1.id === userId ? conversation.user2 : conversation.user1;
        const lastMessage = conversation.messages[0];

        return (
          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className="block p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Avatar
                src={otherUser.profile?.photo}
                name={otherUser.name}
                className="h-12 w-12"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {otherUser.name}
                  </p>
                  {lastMessage && (
                    <time
                      dateTime={lastMessage.createdAt.toISOString()}
                      className="text-xs text-gray-500"
                    >
                      {formatDistanceToNow(lastMessage.createdAt, { addSuffix: true })}
                    </time>
                  )}
                </div>
                {lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage.senderId === userId
                      ? `You: ${lastMessage.content}`
                      : lastMessage.content}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}