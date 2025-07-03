import Avatar from '../ui/Avatar';

interface ChatHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    profile?: {
      photo?: string | null;
      age?: number | null;
      location?: string | null;
    } | null;
  };
}

export default function ChatHeader({ user }: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center space-x-3">
        <Avatar
          src={user.profile?.photo}
          name={user.name}
          className="h-10 w-10"
        />
        <div>
          <h2 className="text-lg font-medium text-gray-900">{user.name}</h2>
          {user.profile?.age && user.profile?.location && (
            <p className="text-sm text-gray-500">
              {user.profile.age} • {user.profile.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}