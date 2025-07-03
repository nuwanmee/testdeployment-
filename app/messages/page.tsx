import { auth } from '../../lib/auth(need to remove)';
import MessageList from '@/components/messages/MessageList';
import NewMessageButton from '@/components/messages/NewMessageButton';
import { getConversations } from '@/data/messages';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages - Matrimony App',
  description: 'Connect with your potential matches',
};

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <div>Please login to view messages</div>;
  }

  const conversations = await getConversations(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Your Messages</h1>
        <NewMessageButton />
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 h-[calc(100vh-200px)]">
          {/* Conversation list sidebar */}
          <div className="border-r border-gray-200 md:col-span-1 overflow-y-auto">
            <MessageList conversations={conversations} userId={session.user.id} />
          </div>

          {/* Main chat area */}
          <div className="md:col-span-3 flex flex-col">
            <div className="flex-1 p-6 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Choose an existing conversation or start a new one
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}