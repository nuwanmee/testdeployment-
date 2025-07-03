// components/ProfileItem.tsx
import { useProfileStore } from '../stores/profileStore';

interface ProfileItemProps {
  profile: {
    id: string;
    status: 'pending' | 'approved' | 'refused';
    user: {
      name?: string | null;
      email?: string | null;
      profilePicture?: string | null;
    };
    // Add other profile fields as needed
  };
}

export const ProfileItem = ({ profile }: ProfileItemProps) => {
  const { approveProfile, refuseProfile, loading } = useProfileStore();

  const handleApprove = async () => {
    try {
      await approveProfile(profile.id);
      // Optional: Show success notification
    } catch (error) {
      // Error handling is already in the store
    }
  };

  const handleRefuse = async () => {
    try {
      await refuseProfile(profile.id);
      // Optional: Show success notification
    } catch (error) {
      // Error handling is already in the store
    }
  };

  return (
    <div className="profile-item border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-4">
        {profile.user.profilePicture && (
          <img 
            src={profile.user.profilePicture} 
            alt="Profile" 
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h3 className="font-medium">
            {profile.user.name || 'Unnamed Profile'}
          </h3>
          <p className="text-sm text-gray-600">{profile.user.email}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${
            profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            profile.status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {profile.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Approve/Reject buttons (only show for pending profiles) */}
      {profile.status === 'pending' && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
          >
            {loading ? 'Processing...' : 'Approve'}
          </button>
          <button
            onClick={handleRefuse}
            disabled={loading}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
          >
            {loading ? 'Processing...' : 'Reject'}
          </button>
        </div>
      )}
    </div>
  );
};