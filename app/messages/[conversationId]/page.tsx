import { auth } from '../../../lib/auth(need to remove)';
import ChatHeader from '@/components/messages/ChatHeader';
import MessageInput from '@/components/messages/MessageInput';
import MessagesContainer from '@/components/messages/MessagesContainer';
import { getConversation } from '@/data/message';

export default async function ConversationPage({
  params,
}: {
  params: { conversationId: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Please login to view messages</div>;
  }

  const conversation = await getConversation(params.conversationId, session.user.id);

  if (!conversation) {
    return <div>Conversation not found</div>;
  }

  // Determine the other user in the conversation
  const otherUser =
    conversation.user1.id === session.user.id ? conversation.user2 : conversation.user1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-200px)]">
          {/* Conversation list sidebar would be here in a layout */}

          {/* Main chat area */}
          <div className="md:col-span-3 flex flex-col">
            <ChatHeader user={otherUser} />

            <MessagesContainer
              initialMessages={conversation.messages}
              conversationId={params.conversationId}
              userId={session.user.id}
            />

            <MessageInput conversationId={params.conversationId} />
          </div>
        </div>
      </div>
    </div>
  );
}