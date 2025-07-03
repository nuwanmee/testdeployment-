'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Button, Badge, Stack, Tooltip, OverlayTrigger } from 'react-bootstrap';
import SendProposalButton from './proposals/SendProposalButton';
import { useHasAcceptedProposal } from '@/stores/proposal';

interface ProfileCardProps {
  profile: {
    id: number;
    profileId: string;
    lastLogin?: string;
    isVerified?: boolean;
    isProfileComplete?: boolean;
    email?: string;
    phone?: string;
    profile?: {
      id: number;
      status?: 'pending' | 'approved' | 'refused';
      photos?: { id: number; url: string; isMain: boolean }[];
      sex?: string;
      birthday?: string;
      district?: string;
      maritalStatus?: string;
      religion?: string;
      caste?: string;
      height?: number;
      motherTongue?: string;
      education?: string;
      occupation?: string;
      annualIncome?: string;
      aboutMe?: string;
      familyDetails?: string;
      hobbies?: string;
      expectations?: string;
    };
  };
  isCurrentUser: boolean;
  proposalStatus?: string | null;
  currentUserId?: number | null;
  isAdmin?: boolean;
  onApprove?: () => Promise<void>;
  onRefuse?: () => Promise<void>;
  adminLoading?: boolean;
}

export default function ProfileCard({
  profile,
  isCurrentUser,
  proposalStatus: initialProposalStatus,
  currentUserId,
  isAdmin = false,
  onApprove,
  onRefuse,
  adminLoading = false,
}: ProfileCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
  const [proposalId, setProposalId] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const hasAcceptedProposal = useHasAcceptedProposal(currentUserId || 0, profile.id);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
      fetchProposalStatus();
    }
    checkIfProfileSaved();
  }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

  const fetchProposalStatus = async () => {
    try {
      const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.proposal) {
          setProposalStatus(data.proposal.status);
          setProposalId(data.proposal.id);
        }
      }
    } catch (error) {
      console.error('Error fetching proposal status:', error);
    }
  };

  const checkIfProfileSaved = async () => {
    if (!currentUserId || isCurrentUser || !profile.profile?.id) return;

    try {
      const response = await fetch(`/api/saved-profiles/check?profileId=${profile.profile.id}`);
      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
      }
    } catch (error) {
      console.error('Error checking saved profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (isLoading || isCurrentUser || !currentUserId || !profile.profile?.id) return;

    setIsLoading(true);
    try {
      const isCurrentlySaved = isSaved;
      setIsSaved(!isCurrentlySaved);

      const method = isCurrentlySaved ? 'DELETE' : 'POST';
      const response = await fetch('/api/saved-profiles', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: profile.profile.id,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
      } else {
        setIsSaved(isCurrentlySaved);
        toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
      }
    } catch (error) {
      setIsSaved(prev => !prev);
      toast.error('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  const getLastLoginText = () => {
    if (!profile.lastLogin) return 'Long time ago';
    
    const lastLoginDate = new Date(profile.lastLogin);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays <= 1) return 'Yesterday';
    if (diffDays <= 7) return 'This week';
    if (diffDays <= 30) return 'This month';
    return 'Long time ago';
  };

  const renderProfileStatusBadges = () => (
    <Stack direction="horizontal" gap={1} className="mt-1">
      {profile.isVerified && (
        <OverlayTrigger placement="top" overlay={<Tooltip>Verified Profile</Tooltip>}>
          <Badge bg="success" pill className="d-flex align-items-center">
            <BadgeCheck size={12} className="me-1" /> Verified
          </Badge>
        </OverlayTrigger>
      )}
      
      {profile.isProfileComplete ? (
        <OverlayTrigger placement="top" overlay={<Tooltip>Complete Profile</Tooltip>}>
          <Badge bg="info" pill className="d-flex align-items-center">
            <Check size={12} className="me-1" /> Complete
          </Badge>
        </OverlayTrigger>
      ) : (
        <OverlayTrigger placement="top" overlay={<Tooltip>Incomplete Profile</Tooltip>}>
          <Badge bg="warning" pill className="d-flex align-items-center">
            <ShieldAlert size={12} className="me-1" /> Incomplete
          </Badge>
        </OverlayTrigger>
      )}
      
      <OverlayTrigger placement="top" overlay={<Tooltip>Last Active</Tooltip>}>
        <Badge bg="secondary" pill className="d-flex align-items-center">
          <Clock size={12} className="me-1" /> {getLastLoginText()}
        </Badge>
      </OverlayTrigger>

      {isAdmin && profile.profile?.status && (
        <OverlayTrigger placement="top" overlay={<Tooltip>Admin Status</Tooltip>}>
          <Badge 
            bg={
              profile.profile.status === 'pending' ? 'warning' :
              profile.profile.status === 'approved' ? 'success' : 'danger'
            } 
            pill 
            className="d-flex align-items-center"
          >
            {profile.profile.status.toUpperCase()}
          </Badge>
        </OverlayTrigger>
      )}
    </Stack>
  );

  const renderProposalState = () => {
    if (!proposalStatus) return null;

    const stateConfig = {
      PENDING: {
        bg: 'warning',
        icon: <Heart size={14} />,
        text: 'Proposal Sent',
        tooltip: 'Waiting for response'
      },
      RECEIVED: {
        bg: 'primary',
        icon: <Mail size={14} />,
        text: 'Proposal Received',
        tooltip: 'Respond to proposal'
      },
      ACCEPTED: {
        bg: 'success',
        icon: <Check size={14} />,
        text: 'Accepted',
        tooltip: 'Proposal accepted'
      },
      REJECTED: {
        bg: 'danger',
        icon: <X size={14} />,
        text: 'Rejected',
        tooltip: 'Proposal rejected'
      }
    };

    const state = stateConfig[proposalStatus as keyof typeof stateConfig];

    return (
      <OverlayTrigger placement="top" overlay={<Tooltip>{state.tooltip}</Tooltip>}>
        <Badge bg={state.bg} pill className="d-flex align-items-center mt-1">
          {state.icon}
          <span className="ms-1">{state.text}</span>
        </Badge>
      </OverlayTrigger>
    );
  };

  const renderProfileImage = () => {
    const gender = profile.profile?.sex?.toLowerCase() || 'other';
    const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);

    const defaultImages = {
      male: '/images/default-male.png',
      female: '/images/default-female.png',
      other: '/images/default-neutral.png'
    };

    const imageUrl = (hasAcceptedProposal || isCurrentUser || isAdmin) && mainPhoto?.url 
      ? mainPhoto.url 
      : defaultImages[gender as keyof typeof defaultImages] || defaultImages.other;

    return (
      <div 
        className="position-relative"
        onMouseEnter={() => isCurrentUser && setIsHovering(true)}
        onMouseLeave={() => isCurrentUser && setIsHovering(false)}
      >
        <div className="w-100" style={{ height: '200px', overflow: 'hidden' }}>
          <img
            src={imageUrl}
            alt={profile.profileId}
            className="w-100 h-100 object-fit-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallbackDiv = document.createElement('div');
              fallbackDiv.className = `w-100 h-100 d-flex align-items-center justify-content-center ${
                gender === 'male' ? 'bg-primary' : 
                gender === 'female' ? 'bg-pink' : 'bg-secondary'
              }`;
              
              const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
              fallbackDiv.innerHTML = `<span class="text-white display-4">${placeholderText}</span>`;
              target.parentNode?.insertBefore(fallbackDiv, target);
              target.parentNode?.removeChild(target);
            }}
          />
        </div>
        
        {isCurrentUser && isHovering && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
            <Camera size={32} className="text-white" />
            <input
              type="file"
              accept="image/*"
              className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
              onChange={handleImageUpload}
            />
          </div>
        )}
      </div>
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !isCurrentUser) return;

    const file = e.target.files[0];
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profileId', profile.profile?.id?.toString() || '');

      const response = await fetch('/api/profiles/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Profile photo updated successfully!');
      } else {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsLoading(false);
      setIsHovering(false);
    }
  };

  const handleSendProposal = async () => {
    if (isLoading || isCurrentUser || !currentUserId) return;

    setIsLoading(true);
    try {
      setProposalStatus('PENDING');
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: profile.id,
          senderId: currentUserId,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setProposalId(data.id);
      }
    } catch (error) {
      setProposalStatus(initialProposalStatus);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposalResponse = async (action: 'ACCEPTED' | 'REJECTED') => {
    if (isLoading || isCurrentUser || !proposalId) return;

    setIsLoading(true);
    try {
      setProposalStatus(action);
      await fetch(`/api/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });
    } catch (error) {
      setProposalStatus('RECEIVED');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hydrated) return null;

  return (
    <Card className="h-100" style={{ maxWidth: '350px' }}>
      {renderProfileImage()}
      
      {isSaved && (
        <Badge bg="primary" className="position-absolute top-2 start-2">
          <BookmarkCheck size={14} className="me-1" />
          Saved
        </Badge>
      )}

      {!isCurrentUser && (
        <Button
          variant="light"
          onClick={handleSaveProfile}
          className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
          size="sm"
          aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
        >
          {isSaved ? (
            <BookmarkCheck size={18} className="text-primary" />
          ) : (
            <Bookmark size={18} />
          )}
        </Button>
      )}

      <Card.Body className="d-flex flex-column p-3">
        <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Card.Title className="mb-0 fs-5 d-flex align-items-center">
                {profile.profileId}
                {profile.isVerified && (
                  <BadgeCheck size={16} className="ms-1 text-success" />
                )}
              </Card.Title>
              {renderProfileStatusBadges()}
            </div>
            <Card.Subtitle className="text-muted fs-6">
              {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
            </Card.Subtitle>
          </div>

          <div className="d-flex align-items-center mb-2">
            {profile.profile?.sex && (
              <small className="me-2">{profile.profile.sex}</small>
            )}
            {profile.profile?.height && (
              <small className="me-2">• {profile.profile.height}cm</small>
            )}
            {profile.profile?.district && (
              <small>• {profile.profile.district}</small>
            )}
          </div>

          {profile.profile?.occupation && (
            <div className="mb-2">
              <small className="text-muted">Works as</small>
              <div>{profile.profile.occupation}</div>
            </div>
          )}

          {profile.profile?.education && (
            <div className="mb-2">
              <small className="text-muted">Education</small>
              <div>{profile.profile.education}</div>
            </div>
          )}

          {profile.profile?.aboutMe && (
            <div className="mb-2">
              <small className="text-muted">About</small>
              <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
            </div>
          )}

          {renderProposalState()}
        </Link>

        <div className="mt-auto pt-2">
          <Stack gap={2}>
            {isAdmin && profile.profile?.status === 'pending' && (
              <Stack direction="horizontal" gap={2}>
                <Button
                  variant="success"
                  size="sm"
                  onClick={onApprove}
                  disabled={adminLoading}
                >
                  <Check size={14} className="me-1" />
                  {adminLoading ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={onRefuse}
                  disabled={adminLoading}
                >
                  <X size={14} className="me-1" />
                  {adminLoading ? 'Rejecting...' : 'Reject'}
                </Button>
              </Stack>
            )}

            {!isAdmin && !isCurrentUser && (
              <>
                {proposalStatus === null && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSendProposal}
                    disabled={isLoading}
                  >
                    <Heart size={14} className="me-1" />
                    {isLoading ? 'Sending...' : 'Send Proposal'}
                  </Button>
                )}

                {proposalStatus === 'PENDING' && (
                  <Button variant="outline-secondary" size="sm" disabled>
                    <Heart size={14} className="me-1" />
                    Proposal Sent
                  </Button>
                )}

                {proposalStatus === 'RECEIVED' && (
                  <Stack direction="horizontal" gap={2} className="justify-content-between">
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleProposalResponse('ACCEPTED')}
                      disabled={isLoading}
                    >
                      <Check size={14} className="me-1" />
                      {isLoading ? '...' : 'Accept'}
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleProposalResponse('REJECTED')}
                      disabled={isLoading}
                    >
                      <X size={14} className="me-1" />
                      {isLoading ? '...' : 'Reject'}
                    </Button>
                  </Stack>
                )}

                {proposalStatus === 'ACCEPTED' && (
                  <Link href={`/messages/${profile.id}`} passHref>
                    <Button
                      variant="success"
                      size="sm"
                    >
                      <Mail size={14} className="me-1" />
                      Message
                    </Button>
                  </Link>
                )}
              </>
            )}

            <Link href={`/profiles/${profile.id}`} passHref>
              <Button
                variant="outline-primary"
                size="sm"
              >
                <User size={14} className="me-1" />
                View Profile
              </Button>
            </Link>
          </Stack>
        </div>
      </Card.Body>
      {!isAdmin && <SendProposalButton receiverId={profile.id} />}
    </Card>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from './proposals/SendProposalButton';
// import { useHasAcceptedProposal } from '@/stores/proposal';

// interface ProfileCardProps {
//   profile: {
//     id: number;
//     profileId: string;
//     lastLogin?: string;
//     isVerified?: boolean;
//     isProfileComplete?: boolean;
//     email?: string;
//     phone?: string;
//     profile?: {
//       id: number;
//       status?: 'pending' | 'approved' | 'refused';
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
//   isAdmin?: boolean;
//   onApprove?: () => Promise<void>;
//   onRefuse?: () => Promise<void>;
//   adminLoading?: boolean;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
//   isAdmin = false,
//   onApprove,
//   onRefuse,
//   adminLoading = false,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);

//   const hasAcceptedProposal = useHasAcceptedProposal(currentUserId || 0, profile.id);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser || !profile.profile?.id) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId || !profile.profile?.id) return;

//     setIsLoading(true);
//     try {
//       const isCurrentlySaved = isSaved;
//       setIsSaved(!isCurrentlySaved);

//       const method = isCurrentlySaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.profile.id,
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
//       } else {
//         setIsSaved(isCurrentlySaved);
//         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//       }
//     } catch (error) {
//       setIsSaved(prev => !prev);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getLastLoginText = () => {
//     if (!profile.lastLogin) return 'Long time ago';
    
//     const lastLoginDate = new Date(profile.lastLogin);
//     const now = new Date();
//     const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays <= 1) return 'Yesterday';
//     if (diffDays <= 7) return 'This week';
//     if (diffDays <= 30) return 'This month';
//     return 'Long time ago';
//   };

//   const renderProfileStatusBadges = () => (
//     <Stack direction="horizontal" gap={1} className="mt-1">
//       {profile.isVerified && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Verified Profile</Tooltip>}>
//           <Badge bg="success" pill className="d-flex align-items-center">
//             <BadgeCheck size={12} className="me-1" /> Verified
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       {profile.isProfileComplete ? (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Complete Profile</Tooltip>}>
//           <Badge bg="info" pill className="d-flex align-items-center">
//             <Check size={12} className="me-1" /> Complete
//           </Badge>
//         </OverlayTrigger>
//       ) : (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Incomplete Profile</Tooltip>}>
//           <Badge bg="warning" pill className="d-flex align-items-center">
//             <ShieldAlert size={12} className="me-1" /> Incomplete
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       <OverlayTrigger placement="top" overlay={<Tooltip>Last Active</Tooltip>}>
//         <Badge bg="secondary" pill className="d-flex align-items-center">
//           <Clock size={12} className="me-1" /> {getLastLoginText()}
//         </Badge>
//       </OverlayTrigger>

//       {isAdmin && profile.profile?.status && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Admin Status</Tooltip>}>
//           <Badge 
//             bg={
//               profile.profile.status === 'pending' ? 'warning' :
//               profile.profile.status === 'approved' ? 'success' : 'danger'
//             } 
//             pill 
//             className="d-flex align-items-center"
//           >
//             {profile.profile.status.toUpperCase()}
//           </Badge>
//         </OverlayTrigger>
//       )}
//     </Stack>
//   );

//   const renderProposalState = () => {
//     if (!proposalStatus) return null;

//     const stateConfig = {
//       PENDING: {
//         bg: 'warning',
//         icon: <Heart size={14} />,
//         text: 'Proposal Sent',
//         tooltip: 'Waiting for response'
//       },
//       RECEIVED: {
//         bg: 'primary',
//         icon: <Mail size={14} />,
//         text: 'Proposal Received',
//         tooltip: 'Respond to proposal'
//       },
//       ACCEPTED: {
//         bg: 'success',
//         icon: <Check size={14} />,
//         text: 'Accepted',
//         tooltip: 'Proposal accepted'
//       },
//       REJECTED: {
//         bg: 'danger',
//         icon: <X size={14} />,
//         text: 'Rejected',
//         tooltip: 'Proposal rejected'
//       }
//     };

//     const state = stateConfig[proposalStatus as keyof typeof stateConfig];

//     return (
//       <OverlayTrigger placement="top" overlay={<Tooltip>{state.tooltip}</Tooltip>}>
//         <Badge bg={state.bg} pill className="d-flex align-items-center mt-1">
//           {state.icon}
//           <span className="ms-1">{state.text}</span>
//         </Badge>
//       </OverlayTrigger>
//     );
//   };

//   const renderProfileImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';
//     const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);

//     const defaultImages = {
//       male: '/images/default-male.png',
//       female: '/images/default-female.png',
//       other: '/images/default-neutral.png'
//     };

//     const imageUrl = (hasAcceptedProposal || isCurrentUser || isAdmin) && mainPhoto?.url 
//       ? mainPhoto.url 
//       : defaultImages[gender as keyof typeof defaultImages] || defaultImages.other;

//     return (
//       <div 
//         className="position-relative"
//         onMouseEnter={() => isCurrentUser && setIsHovering(true)}
//         onMouseLeave={() => isCurrentUser && setIsHovering(false)}
//       >
//         <div className="w-100" style={{ height: '200px', overflow: 'hidden' }}>
//           <img
//             src={imageUrl}
//             alt={profile.profileId}
//             className="w-100 h-100 object-fit-cover"
//             onError={(e) => {
//               const target = e.target as HTMLImageElement;
//               target.style.display = 'none';
//               const fallbackDiv = document.createElement('div');
//               fallbackDiv.className = `w-100 h-100 d-flex align-items-center justify-content-center ${
//                 gender === 'male' ? 'bg-primary' : 
//                 gender === 'female' ? 'bg-pink' : 'bg-secondary'
//               }`;
              
//               const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
//               fallbackDiv.innerHTML = `<span class="text-white display-4">${placeholderText}</span>`;
//               target.parentNode?.insertBefore(fallbackDiv, target);
//               target.parentNode?.removeChild(target);
//             }}
//           />
//         </div>
        
//         {isCurrentUser && isHovering && (
//           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
//             <Camera size={32} className="text-white" />
//             <input
//               type="file"
//               accept="image/*"
//               className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
//               onChange={handleImageUpload}
//             />
//           </div>
//         )}
//       </div>
//     );
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.length || !isCurrentUser) return;

//     const file = e.target.files[0];
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('profileId', profile.profile?.id?.toString() || '');

//       const response = await fetch('/api/profiles/upload-photo', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success('Profile photo updated successfully!');
//       } else {
//         throw new Error('Failed to upload photo');
//       }
//     } catch (error) {
//       console.error('Error uploading photo:', error);
//       toast.error('Failed to upload photo');
//     } finally {
//       setIsLoading(false);
//       setIsHovering(false);
//     }
//   };

//   const handleSendProposal = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus('PENDING');
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           receiverId: profile.id,
//           senderId: currentUserId,
//         }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setProposalId(data.id);
//       }
//     } catch (error) {
//       setProposalStatus(initialProposalStatus);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProposalResponse = async (action: 'ACCEPTED' | 'REJECTED') => {
//     if (isLoading || isCurrentUser || !proposalId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus(action);
//       await fetch(`/api/proposals/${proposalId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: action }),
//       });
//     } catch (error) {
//       setProposalStatus('RECEIVED');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!hydrated) return null;

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       {renderProfileImage()}
      
//       {isSaved && (
//         <Badge bg="primary" className="position-absolute top-2 start-2">
//           <BookmarkCheck size={14} className="me-1" />
//           Saved
//         </Badge>
//       )}

//       {!isCurrentUser && (
//         <Button
//           variant="light"
//           onClick={handleSaveProfile}
//           className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
//           size="sm"
//           aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//         >
//           {isSaved ? (
//             <BookmarkCheck size={18} className="text-primary" />
//           ) : (
//             <Bookmark size={18} />
//           )}
//         </Button>
//       )}

//       <Card.Body className="d-flex flex-column p-3">
//         <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <div>
//               <Card.Title className="mb-0 fs-5 d-flex align-items-center">
//                 {profile.profileId}
//                 {profile.isVerified && (
//                   <BadgeCheck size={16} className="ms-1 text-success" />
//                 )}
//               </Card.Title>
//               {renderProfileStatusBadges()}
//             </div>
//             <Card.Subtitle className="text-muted fs-6">
//               {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
//             </Card.Subtitle>
//           </div>

//           <div className="d-flex align-items-center mb-2">
//             {profile.profile?.sex && (
//               <small className="me-2">{profile.profile.sex}</small>
//             )}
//             {profile.profile?.height && (
//               <small className="me-2">• {profile.profile.height}cm</small>
//             )}
//             {profile.profile?.district && (
//               <small>• {profile.profile.district}</small>
//             )}
//           </div>

//           {profile.profile?.occupation && (
//             <div className="mb-2">
//               <small className="text-muted">Works as</small>
//               <div>{profile.profile.occupation}</div>
//             </div>
//           )}

//           {profile.profile?.education && (
//             <div className="mb-2">
//               <small className="text-muted">Education</small>
//               <div>{profile.profile.education}</div>
//             </div>
//           )}

//           {profile.profile?.aboutMe && (
//             <div className="mb-2">
//               <small className="text-muted">About</small>
//               <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
//             </div>
//           )}

//           {renderProposalState()}
//         </Link>

//         <div className="mt-auto pt-2">
//           <Stack gap={2}>
//             {isAdmin && profile.profile?.status === 'pending' && (
//               <Stack direction="horizontal" gap={2}>
//                 <Button
//                   variant="success"
//                   size="sm"
//                   onClick={onApprove}
//                   disabled={adminLoading}
//                 >
//                   <Check size={14} className="me-1" />
//                   {adminLoading ? 'Approving...' : 'Approve'}
//                 </Button>
//                 <Button
//                   variant="danger"
//                   size="sm"
//                   onClick={onRefuse}
//                   disabled={adminLoading}
//                 >
//                   <X size={14} className="me-1" />
//                   {adminLoading ? 'Rejecting...' : 'Reject'}
//                 </Button>
//               </Stack>
//             )}

//             {!isAdmin && !isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     onClick={handleSendProposal}
//                     disabled={isLoading}
//                   >
//                     <Heart size={14} className="me-1" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </Button>
//                 )}

//                 {proposalStatus === 'PENDING' && (
//                   <Button variant="outline-secondary" size="sm" disabled>
//                     <Heart size={14} className="me-1" />
//                     Proposal Sent
//                   </Button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <Stack direction="horizontal" gap={2} className="justify-content-between">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => handleProposalResponse('ACCEPTED')}
//                       disabled={isLoading}
//                     >
//                       <Check size={14} className="me-1" />
//                       {isLoading ? '...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleProposalResponse('REJECTED')}
//                       disabled={isLoading}
//                     >
//                       <X size={14} className="me-1" />
//                       {isLoading ? '...' : 'Reject'}
//                     </Button>
//                   </Stack>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Button
//                     variant="success"
//                     size="sm"
//                     href={`/messages/${profile.id}`}
//                     as={Link}
//                   >
//                     <Mail size={14} className="me-1" />
//                     Message
//                   </Button>
//                 )}
//               </>
//             )}

//             <Button
//               variant="outline-primary"
//               size="sm"
//               href={`/profiles/${profile.id}`}
//               as={Link}
//             >
//               <User size={14} className="me-1" />
//               View Profile
//             </Button>
//           </Stack>
//         </div>
//       </Card.Body>
//       {!isAdmin && <SendProposalButton receiverId={profile.id} />}
//     </Card>
//   );
// }



// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from './proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number; // User ID
//     profileId: string; // Public profile ID
//     lastLogin?: string;
//     isVerified?: boolean;
//     isProfileComplete?: boolean;
//     email?: string;
//     phone?: string;
//     profile?: {
//       id: number; // Profile details ID
//       status?: 'pending' | 'approved' | 'refused'; // Added status field
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
//   isAdmin?: boolean; // New prop for admin view
//   onApprove?: () => Promise<void>; // New prop for approve action
//   onRefuse?: () => Promise<void>; // New prop for refuse action
//   adminLoading?: boolean; // New prop for admin action loading state
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
//   isAdmin = false,
//   onApprove,
//   onRefuse,
//   adminLoading = false,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser || !profile.profile?.id) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId || !profile.profile?.id) return;

//     setIsLoading(true);
//     try {
//       const isCurrentlySaved = isSaved;
//       setIsSaved(!isCurrentlySaved);

//       const method = isCurrentlySaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.profile.id,
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
//       } else {
//         setIsSaved(isCurrentlySaved);
//         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//       }
//     } catch (error) {
//       setIsSaved(prev => !prev);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getLastLoginText = () => {
//     if (!profile.lastLogin) return 'Long time ago';
    
//     const lastLoginDate = new Date(profile.lastLogin);
//     const now = new Date();
//     const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays <= 1) return 'Yesterday';
//     if (diffDays <= 7) return 'This week';
//     if (diffDays <= 30) return 'This month';
//     return 'Long time ago';
//   };

//   const renderProfileStatusBadges = () => (
//     <Stack direction="horizontal" gap={1} className="mt-1">
//       {profile.isVerified && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Verified Profile</Tooltip>}>
//           <Badge bg="success" pill className="d-flex align-items-center">
//             <BadgeCheck size={12} className="me-1" /> Verified
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       {profile.isProfileComplete ? (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Complete Profile</Tooltip>}>
//           <Badge bg="info" pill className="d-flex align-items-center">
//             <Check size={12} className="me-1" /> Complete
//           </Badge>
//         </OverlayTrigger>
//       ) : (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Incomplete Profile</Tooltip>}>
//           <Badge bg="warning" pill className="d-flex align-items-center">
//             <ShieldAlert size={12} className="me-1" /> Incomplete
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       <OverlayTrigger placement="top" overlay={<Tooltip>Last Active</Tooltip>}>
//         <Badge bg="secondary" pill className="d-flex align-items-center">
//           <Clock size={12} className="me-1" /> {getLastLoginText()}
//         </Badge>
//       </OverlayTrigger>

//       {/* Admin status badge */}
//       {isAdmin && profile.profile?.status && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Admin Status</Tooltip>}>
//           <Badge 
//             bg={
//               profile.profile.status === 'pending' ? 'warning' :
//               profile.profile.status === 'approved' ? 'success' : 'danger'
//             } 
//             pill 
//             className="d-flex align-items-center"
//           >
//             {profile.profile.status.toUpperCase()}
//           </Badge>
//         </OverlayTrigger>
//       )}
//     </Stack>
//   );

//   const renderProposalState = () => {
//     if (!proposalStatus) return null;

//     const stateConfig = {
//       SENT: {
//         bg: 'warning',
//         icon: <Heart size={14} />,
//         text: 'Proposal Sent',
//         tooltip: 'Waiting for response'
//       },
//       RECEIVED: {
//         bg: 'primary',
//         icon: <Mail size={14} />,
//         text: 'Proposal Received',
//         tooltip: 'Respond to proposal'
//       },
//       ACCEPTED: {
//         bg: 'success',
//         icon: <Check size={14} />,
//         text: 'Accepted',
//         tooltip: 'Proposal accepted'
//       },
//       REJECTED: {
//         bg: 'danger',
//         icon: <X size={14} />,
//         text: 'Rejected',
//         tooltip: 'Proposal rejected'
//       }
//     };

//     const state = stateConfig[proposalStatus as keyof typeof stateConfig];

//     return (
//       <OverlayTrigger placement="top" overlay={<Tooltip>{state.tooltip}</Tooltip>}>
//         <Badge bg={state.bg} pill className="d-flex align-items-center mt-1">
//           {state.icon}
//           <span className="ms-1">{state.text}</span>
//         </Badge>
//       </OverlayTrigger>
//     );
//   };

//   const renderProfileImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';
//     const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);

//     const defaultImages = {
//       male: '/images/default-male.png',
//       female: '/images/default-female.png',
//       other: '/images/default-neutral.png'
//     };

//     const imageUrl = mainPhoto?.url || defaultImages[gender as keyof typeof defaultImages] || defaultImages.other;

//     return (
//       <div 
//         className="position-relative"
//         onMouseEnter={() => isCurrentUser && setIsHovering(true)}
//         onMouseLeave={() => isCurrentUser && setIsHovering(false)}
//       >
//         <div className="w-100" style={{ height: '200px', overflow: 'hidden' }}>
//           <img
//             src={imageUrl}
//             alt={profile.profileId}
//             className="w-100 h-100 object-fit-cover"
//             onError={(e) => {
//               const target = e.target as HTMLImageElement;
//               target.style.display = 'none';
//               const fallbackDiv = document.createElement('div');
//               fallbackDiv.className = `w-100 h-100 d-flex align-items-center justify-content-center ${
//                 gender === 'male' ? 'bg-primary' : 
//                 gender === 'female' ? 'bg-pink' : 'bg-secondary'
//               }`;
              
//               const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
//               fallbackDiv.innerHTML = `<span class="text-white display-4">${placeholderText}</span>`;
//               target.parentNode?.insertBefore(fallbackDiv, target);
//               target.parentNode?.removeChild(target);
//             }}
//           />
//         </div>
        
//         {isCurrentUser && isHovering && (
//           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
//             <Camera size={32} className="text-white" />
//             <input
//               type="file"
//               accept="image/*"
//               className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
//               onChange={handleImageUpload}
//             />
//           </div>
//         )}
//       </div>
//     );
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.length || !isCurrentUser) return;

//     const file = e.target.files[0];
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('profileId', profile.profile?.id?.toString() || '');

//       const response = await fetch('/api/profiles/upload-photo', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success('Profile photo updated successfully!');
//       } else {
//         throw new Error('Failed to upload photo');
//       }
//     } catch (error) {
//       console.error('Error uploading photo:', error);
//       toast.error('Failed to upload photo');
//     } finally {
//       setIsLoading(false);
//       setIsHovering(false);
//     }
//   };

//   const handleSendProposal = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus('SENT');
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           receiverId: profile.id,
//           senderId: currentUserId,
//         }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setProposalId(data.id);
//       }
//     } catch (error) {
//       setProposalStatus(initialProposalStatus);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProposalResponse = async (action: 'ACCEPT' | 'REJECT') => {
//     if (isLoading || isCurrentUser || !proposalId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus(action);
//       await fetch(`/api/proposals/${proposalId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: action }),
//       });
//     } catch (error) {
//       setProposalStatus('RECEIVED');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!hydrated) return null;

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       {renderProfileImage()}
      
//       {isSaved && (
//         <Badge bg="primary" className="position-absolute top-2 start-2">
//           <BookmarkCheck size={14} className="me-1" />
//           Saved
//         </Badge>
//       )}

//       {!isCurrentUser && (
//         <Button
//           variant="light"
//           onClick={handleSaveProfile}
//           className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
//           size="sm"
//           aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//         >
//           {isSaved ? (
//             <BookmarkCheck size={18} className="text-primary" />
//           ) : (
//             <Bookmark size={18} />
//           )}
//         </Button>
//       )}

//       <Card.Body className="d-flex flex-column p-3">
//         <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <div>
//               <Card.Title className="mb-0 fs-5 d-flex align-items-center">
//                 {profile.profileId}
//                 {profile.isVerified && (
//                   <BadgeCheck size={16} className="ms-1 text-success" />
//                 )}
//               </Card.Title>
//               {renderProfileStatusBadges()}
//             </div>
//             <Card.Subtitle className="text-muted fs-6">
//               {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
//             </Card.Subtitle>
//           </div>

//           <div className="d-flex align-items-center mb-2">
//             {profile.profile?.sex && (
//               <small className="me-2">{profile.profile.sex}</small>
//             )}
//             {profile.profile?.height && (
//               <small className="me-2">• {profile.profile.height}cm</small>
//             )}
//             {profile.profile?.district && (
//               <small>• {profile.profile.district}</small>
//             )}
//           </div>

//           {profile.profile?.occupation && (
//             <div className="mb-2">
//               <small className="text-muted">Works as</small>
//               <div>{profile.profile.occupation}</div>
//             </div>
//           )}

//           {profile.profile?.education && (
//             <div className="mb-2">
//               <small className="text-muted">Education</small>
//               <div>{profile.profile.education}</div>
//             </div>
//           )}

//           {profile.profile?.aboutMe && (
//             <div className="mb-2">
//               <small className="text-muted">About</small>
//               <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
//             </div>
//           )}

//           {renderProposalState()}
//         </Link>

//         <div className="mt-auto pt-2">
//           <Stack gap={2}>
//             {/* Admin actions */}
//             {isAdmin && profile.profile?.status === 'pending' && (
//               <Stack direction="horizontal" gap={2}>
//                 <Button
//                   variant="success"
//                   size="sm"
//                   onClick={onApprove}
//                   disabled={adminLoading}
//                 >
//                   <Check size={14} className="me-1" />
//                   {adminLoading ? 'Approving...' : 'Approve'}
//                 </Button>
//                 <Button
//                   variant="danger"
//                   size="sm"
//                   onClick={onRefuse}
//                   disabled={adminLoading}
//                 >
//                   <X size={14} className="me-1" />
//                   {adminLoading ? 'Rejecting...' : 'Reject'}
//                 </Button>
//               </Stack>
//             )}

//             {/* Regular user actions */}
//             {!isAdmin && !isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     onClick={handleSendProposal}
//                     disabled={isLoading}
//                   >
//                     <Heart size={14} className="me-1" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </Button>
//                 )}

//                 {proposalStatus === 'SENT' && (
//                   <Button variant="outline-secondary" size="sm" disabled>
//                     <Heart size={14} className="me-1" />
//                     Proposal Sent
//                   </Button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <Stack direction="horizontal" gap={2} className="justify-content-between">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => handleProposalResponse('ACCEPT')}
//                       disabled={isLoading}
//                     >
//                       <Check size={14} className="me-1" />
//                       {isLoading ? '...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleProposalResponse('REJECT')}
//                       disabled={isLoading}
//                     >
//                       <X size={14} className="me-1" />
//                       {isLoading ? '...' : 'Reject'}
//                     </Button>
//                   </Stack>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Button
//                     variant="success"
//                     size="sm"
//                     href={`/messages/${profile.id}`}
//                     as={Link}
//                   >
//                     <Mail size={14} className="me-1" />
//                     Message
//                   </Button>
//                 )}
//               </>
//             )}

//             <Button
//               variant="outline-primary"
//               size="sm"
//               href={`/profiles/${profile.id}`}
//               as={Link}
//             >
//               <User size={14} className="me-1" />
//               View Profile
//             </Button>
//           </Stack>
//         </div>
//       </Card.Body>
//       {!isAdmin && <SendProposalButton receiverId={profile.id} />}
//     </Card>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from './proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number; // User ID
//     profileId: string; // Public profile ID
//     lastLogin?: string;
//     isVerified?: boolean;
//     isProfileComplete?: boolean;
//     email?: string;
//     phone?: string;
//     profile?: {
//       id: number; // Profile details ID
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser || !profile.profile?.id) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId || !profile.profile?.id) return;

//     setIsLoading(true);
//     try {
//       const isCurrentlySaved = isSaved;
//       setIsSaved(!isCurrentlySaved);

//       const method = isCurrentlySaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.profile.id,
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
//       } else {
//         setIsSaved(isCurrentlySaved);
//         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//       }
//     } catch (error) {
//       setIsSaved(prev => !prev);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getLastLoginText = () => {
//     if (!profile.lastLogin) return 'Long time ago';
    
//     const lastLoginDate = new Date(profile.lastLogin);
//     const now = new Date();
//     const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays <= 1) return 'Yesterday';
//     if (diffDays <= 7) return 'This week';
//     if (diffDays <= 30) return 'This month';
//     return 'Long time ago';
//   };

//   const renderProfileStatusBadges = () => (
//     <Stack direction="horizontal" gap={1} className="mt-1">
//       {profile.isVerified && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Verified Profile</Tooltip>}>
//           <Badge bg="success" pill className="d-flex align-items-center">
//             <BadgeCheck size={12} className="me-1" /> Verified
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       {profile.isProfileComplete ? (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Complete Profile</Tooltip>}>
//           <Badge bg="info" pill className="d-flex align-items-center">
//             <Check size={12} className="me-1" /> Complete
//           </Badge>
//         </OverlayTrigger>
//       ) : (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Incomplete Profile</Tooltip>}>
//           <Badge bg="warning" pill className="d-flex align-items-center">
//             <ShieldAlert size={12} className="me-1" /> Incomplete
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       <OverlayTrigger placement="top" overlay={<Tooltip>Last Active</Tooltip>}>
//         <Badge bg="secondary" pill className="d-flex align-items-center">
//           <Clock size={12} className="me-1" /> {getLastLoginText()}
//         </Badge>
//       </OverlayTrigger>
//     </Stack>
//   );

//   const renderProposalState = () => {
//     if (!proposalStatus) return null;

//     const stateConfig = {
//       SENT: {
//         bg: 'warning',
//         icon: <Heart size={14} />,
//         text: 'Proposal Sent',
//         tooltip: 'Waiting for response'
//       },
//       RECEIVED: {
//         bg: 'primary',
//         icon: <Mail size={14} />,
//         text: 'Proposal Received',
//         tooltip: 'Respond to proposal'
//       },
//       ACCEPTED: {
//         bg: 'success',
//         icon: <Check size={14} />,
//         text: 'Accepted',
//         tooltip: 'Proposal accepted'
//       },
//       REJECTED: {
//         bg: 'danger',
//         icon: <X size={14} />,
//         text: 'Rejected',
//         tooltip: 'Proposal rejected'
//       }
//     };

//     const state = stateConfig[proposalStatus as keyof typeof stateConfig];

//     return (
//       <OverlayTrigger placement="top" overlay={<Tooltip>{state.tooltip}</Tooltip>}>
//         <Badge bg={state.bg} pill className="d-flex align-items-center mt-1">
//           {state.icon}
//           <span className="ms-1">{state.text}</span>
//         </Badge>
//       </OverlayTrigger>
//     );
//   };

//   const renderProfileImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';
//     const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);

//     const defaultImages = {
//       male: '/images/default-male.png',
//       female: '/images/default-female.png',
//       other: '/images/default-neutral.png'
//     };

//     const imageUrl = mainPhoto?.url || defaultImages[gender as keyof typeof defaultImages] || defaultImages.other;

//     return (
//       <div 
//         className="position-relative"
//         onMouseEnter={() => isCurrentUser && setIsHovering(true)}
//         onMouseLeave={() => isCurrentUser && setIsHovering(false)}
//       >
//         <div className="w-100" style={{ height: '200px', overflow: 'hidden' }}>
//           <img
//             src={imageUrl}
//             alt={profile.profileId}
//             className="w-100 h-100 object-fit-cover"
//             onError={(e) => {
//               const target = e.target as HTMLImageElement;
//               target.style.display = 'none';
//               const fallbackDiv = document.createElement('div');
//               fallbackDiv.className = `w-100 h-100 d-flex align-items-center justify-content-center ${
//                 gender === 'male' ? 'bg-primary' : 
//                 gender === 'female' ? 'bg-pink' : 'bg-secondary'
//               }`;
              
//               const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
//               fallbackDiv.innerHTML = `<span class="text-white display-4">${placeholderText}</span>`;
//               target.parentNode?.insertBefore(fallbackDiv, target);
//               target.parentNode?.removeChild(target);
//             }}
//           />
//         </div>
        
//         {isCurrentUser && isHovering && (
//           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
//             <Camera size={32} className="text-white" />
//             <input
//               type="file"
//               accept="image/*"
//               className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
//               onChange={handleImageUpload}
//             />
//           </div>
//         )}
//       </div>
//     );
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.length || !isCurrentUser) return;

//     const file = e.target.files[0];
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('profileId', profile.profile?.id?.toString() || '');

//       const response = await fetch('/api/profiles/upload-photo', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success('Profile photo updated successfully!');
//       } else {
//         throw new Error('Failed to upload photo');
//       }
//     } catch (error) {
//       console.error('Error uploading photo:', error);
//       toast.error('Failed to upload photo');
//     } finally {
//       setIsLoading(false);
//       setIsHovering(false);
//     }
//   };

//   const handleSendProposal = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus('SENT');
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           receiverId: profile.id,
//           senderId: currentUserId,
//         }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setProposalId(data.id);
//       }
//     } catch (error) {
//       setProposalStatus(initialProposalStatus);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProposalResponse = async (action: 'ACCEPT' | 'REJECT') => {
//     if (isLoading || isCurrentUser || !proposalId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus(action);
//       await fetch(`/api/proposals/${proposalId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: action }),
//       });
//     } catch (error) {
//       setProposalStatus('RECEIVED');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!hydrated) return null;

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       {renderProfileImage()}
      
//       {isSaved && (
//         <Badge bg="primary" className="position-absolute top-2 start-2">
//           <BookmarkCheck size={14} className="me-1" />
//           Saved
//         </Badge>
//       )}

//       {!isCurrentUser && (
//         <Button
//           variant="light"
//           onClick={handleSaveProfile}
//           className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
//           size="sm"
//           aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//         >
//           {isSaved ? (
//             <BookmarkCheck size={18} className="text-primary" />
//           ) : (
//             <Bookmark size={18} />
//           )}
//         </Button>
//       )}

//       <Card.Body className="d-flex flex-column p-3">
//         <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <div>
//               <Card.Title className="mb-0 fs-5 d-flex align-items-center">
//                 {profile.profileId}
//                 {profile.isVerified && (
//                   <BadgeCheck size={16} className="ms-1 text-success" />
//                 )}
//               </Card.Title>
//               {renderProfileStatusBadges()}
//             </div>
//             <Card.Subtitle className="text-muted fs-6">
//               {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
//             </Card.Subtitle>
//           </div>

//           <div className="d-flex align-items-center mb-2">
//             {profile.profile?.sex && (
//               <small className="me-2">{profile.profile.sex}</small>
//             )}
//             {profile.profile?.height && (
//               <small className="me-2">• {profile.profile.height}cm</small>
//             )}
//             {profile.profile?.district && (
//               <small>• {profile.profile.district}</small>
//             )}
//           </div>

//           {profile.profile?.occupation && (
//             <div className="mb-2">
//               <small className="text-muted">Works as</small>
//               <div>{profile.profile.occupation}</div>
//             </div>
//           )}

//           {profile.profile?.education && (
//             <div className="mb-2">
//               <small className="text-muted">Education</small>
//               <div>{profile.profile.education}</div>
//             </div>
//           )}

//           {profile.profile?.aboutMe && (
//             <div className="mb-2">
//               <small className="text-muted">About</small>
//               <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
//             </div>
//           )}

//           {renderProposalState()}
//         </Link>

//         <div className="mt-auto pt-2">
//           <Stack gap={2}>
//             {!isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     onClick={handleSendProposal}
//                     disabled={isLoading}
//                   >
//                     <Heart size={14} className="me-1" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </Button>
//                 )}

//                 {proposalStatus === 'SENT' && (
//                   <Button variant="outline-secondary" size="sm" disabled>
//                     <Heart size={14} className="me-1" />
//                     Proposal Sent
//                   </Button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <Stack direction="horizontal" gap={2} className="justify-content-between">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => handleProposalResponse('ACCEPT')}
//                       disabled={isLoading}
//                     >
//                       <Check size={14} className="me-1" />
//                       {isLoading ? '...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleProposalResponse('REJECT')}
//                       disabled={isLoading}
//                     >
//                       <X size={14} className="me-1" />
//                       {isLoading ? '...' : 'Reject'}
//                     </Button>
//                   </Stack>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Button
//                     variant="success"
//                     size="sm"
//                     href={`/messages/${profile.id}`}
//                     as={Link}
//                   >
//                     <Mail size={14} className="me-1" />
//                     Message
//                   </Button>
//                 )}
//               </>
//             )}
// <Button
//   variant="outline-primary"
//   size="sm"
//   href={`/profiles/${profile.profile?.id}`}  // Now using profile ID
//   as={Link}
// >
//               <User size={14} className="me-1" />
//               View Profile
//             </Button>
//           </Stack>
//         </div>
//       </Card.Body>
//       <SendProposalButton receiverId={profile.id} />
//     </Card>
//   );
// }


// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from './proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number; // User ID
//     profileId: string; // Public profile ID
//     lastLogin?: string;
//     isVerified?: boolean;
//     isProfileComplete?: boolean;
//     email?: string;
//     phone?: string;
//     profile?: {
//       id: number; // PROFILE ID - CRITICAL ADDITION
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser || !profile.profile?.id) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId || !profile.profile?.id) return;

//     setIsLoading(true);
//     try {
//       const isCurrentlySaved = isSaved;
//       setIsSaved(!isCurrentlySaved);

//       const method = isCurrentlySaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.profile.id,
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
//       } else {
//         setIsSaved(isCurrentlySaved);
//         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//       }
//     } catch (error) {
//       setIsSaved(prev => !prev);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getLastLoginText = () => {
//     if (!profile.lastLogin) return 'Long time ago';
    
//     const lastLoginDate = new Date(profile.lastLogin);
//     const now = new Date();
//     const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays <= 1) return 'Yesterday';
//     if (diffDays <= 7) return 'This week';
//     if (diffDays <= 30) return 'This month';
//     return 'Long time ago';
//   };

//   const renderProfileStatusBadges = () => (
//     <Stack direction="horizontal" gap={1} className="mt-1">
//       {profile.isVerified && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Verified Profile</Tooltip>}>
//           <Badge bg="success" pill className="d-flex align-items-center">
//             <BadgeCheck size={12} className="me-1" /> Verified
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       {profile.isProfileComplete ? (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Complete Profile</Tooltip>}>
//           <Badge bg="info" pill className="d-flex align-items-center">
//             <Check size={12} className="me-1" /> Complete
//           </Badge>
//         </OverlayTrigger>
//       ) : (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Incomplete Profile</Tooltip>}>
//           <Badge bg="warning" pill className="d-flex align-items-center">
//             <ShieldAlert size={12} className="me-1" /> Incomplete
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       <OverlayTrigger placement="top" overlay={<Tooltip>Last Active</Tooltip>}>
//         <Badge bg="secondary" pill className="d-flex align-items-center">
//           <Clock size={12} className="me-1" /> {getLastLoginText()}
//         </Badge>
//       </OverlayTrigger>
//     </Stack>
//   );

//   const renderProposalState = () => {
//     if (!proposalStatus) return null;

//     const stateConfig = {
//       SENT: {
//         bg: 'warning',
//         icon: <Heart size={14} />,
//         text: 'Proposal Sent',
//         tooltip: 'Waiting for response'
//       },
//       RECEIVED: {
//         bg: 'primary',
//         icon: <Mail size={14} />,
//         text: 'Proposal Received',
//         tooltip: 'Respond to proposal'
//       },
//       ACCEPTED: {
//         bg: 'success',
//         icon: <Check size={14} />,
//         text: 'Accepted',
//         tooltip: 'Proposal accepted'
//       },
//       REJECTED: {
//         bg: 'danger',
//         icon: <X size={14} />,
//         text: 'Rejected',
//         tooltip: 'Proposal rejected'
//       }
//     };

//     const state = stateConfig[proposalStatus as keyof typeof stateConfig];

//     return (
//       <OverlayTrigger placement="top" overlay={<Tooltip>{state.tooltip}</Tooltip>}>
//         <Badge bg={state.bg} pill className="d-flex align-items-center mt-1">
//           {state.icon}
//           <span className="ms-1">{state.text}</span>
//         </Badge>
//       </OverlayTrigger>
//     );
//   };

//   const renderProfileImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';
//     const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);

//     // Default image URLs based on gender
//     const defaultImages = {
//       male: '/images/default-male.png',
//       female: '/images/default-female.png',
//       other: '/images/default-neutral.png'
//     };

//     // Use the appropriate default image if no photo exists
//     const imageUrl = mainPhoto?.url || defaultImages[gender as keyof typeof defaultImages] || defaultImages.other;

//     return (
//       <div 
//         className="position-relative"
//         onMouseEnter={() => isCurrentUser && setIsHovering(true)}
//         onMouseLeave={() => isCurrentUser && setIsHovering(false)}
//       >
//         <div className="w-100" style={{ height: '200px', overflow: 'hidden' }}>
//           <img
//             src={imageUrl}
//             alt={profile.profileId}
//             className="w-100 h-100 object-fit-cover"
//             onError={(e) => {
//               // Fallback to gender-specific background color if image fails to load
//               const target = e.target as HTMLImageElement;
//               target.style.display = 'none';
//               const fallbackDiv = document.createElement('div');
//               fallbackDiv.className = `w-100 h-100 d-flex align-items-center justify-content-center ${
//                 gender === 'male' ? 'bg-primary' : 
//                 gender === 'female' ? 'bg-pink' : 'bg-secondary'
//               }`;
              
//               const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
//               fallbackDiv.innerHTML = `<span class="text-white display-4">${placeholderText}</span>`;
//               target.parentNode?.insertBefore(fallbackDiv, target);
//               target.parentNode?.removeChild(target);
//             }}
//           />
//         </div>
        
//         {isCurrentUser && isHovering && (
//           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
//             <Camera size={32} className="text-white" />
//             <input
//               type="file"
//               accept="image/*"
//               className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
//               onChange={handleImageUpload}
//             />
//           </div>
//         )}
//       </div>
//     );
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.length || !isCurrentUser) return;

//     const file = e.target.files[0];
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('profileId', profile.id.toString());

//       const response = await fetch('/api/profiles/upload-photo', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success('Profile photo updated successfully!');
//         // You would typically update the profile state here with the new photo
//       } else {
//         throw new Error('Failed to upload photo');
//       }
//     } catch (error) {
//       console.error('Error uploading photo:', error);
//       toast.error('Failed to upload photo');
//     } finally {
//       setIsLoading(false);
//       setIsHovering(false);
//     }
//   };

//   const handleSendProposal = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus('SENT');
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           receiverId: profile.id,
//           senderId: currentUserId,
//         }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setProposalId(data.id);
//       }
//     } catch (error) {
//       setProposalStatus(initialProposalStatus);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProposalResponse = async (action: 'ACCEPT' | 'REJECT') => {
//     if (isLoading || isCurrentUser || !proposalId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus(action);
//       await fetch(`/api/proposals/${proposalId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: action }),
//       });
//     } catch (error) {
//       setProposalStatus('RECEIVED');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!hydrated) return null;

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       {renderProfileImage()}
      
//       {isSaved && (
//         <Badge bg="primary" className="position-absolute top-2 start-2">
//           <BookmarkCheck size={14} className="me-1" />
//           Saved
//         </Badge>
//       )}

//       {!isCurrentUser && (
//         <Button
//           variant="light"
//           onClick={handleSaveProfile}
//           className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
//           size="sm"
//           aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//         >
//           {isSaved ? (
//             <BookmarkCheck size={18} className="text-primary" />
//           ) : (
//             <Bookmark size={18} />
//           )}
//         </Button>
//       )}

//       <Card.Body className="d-flex flex-column p-3">
//         <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <div>
//               <Card.Title className="mb-0 fs-5 d-flex align-items-center">
//                 {profile.profileId}
//                 {profile.isVerified && (
//                   <BadgeCheck size={16} className="ms-1 text-success" />
//                 )}
//               </Card.Title>
//               {renderProfileStatusBadges()}
//             </div>
//             <Card.Subtitle className="text-muted fs-6">
//               {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
//             </Card.Subtitle>
//           </div>

//           <div className="d-flex align-items-center mb-2">
//             {profile.profile?.sex && (
//               <small className="me-2">{profile.profile.sex}</small>
//             )}
//             {profile.profile?.height && (
//               <small className="me-2">• {profile.profile.height}cm</small>
//             )}
//             {profile.profile?.district && (
//               <small>• {profile.profile.district}</small>
//             )}
//           </div>

//           {profile.profile?.occupation && (
//             <div className="mb-2">
//               <small className="text-muted">Works as</small>
//               <div>{profile.profile.occupation}</div>
//             </div>
//           )}

//           {profile.profile?.education && (
//             <div className="mb-2">
//               <small className="text-muted">Education</small>
//               <div>{profile.profile.education}</div>
//             </div>
//           )}

//           {profile.profile?.aboutMe && (
//             <div className="mb-2">
//               <small className="text-muted">About</small>
//               <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
//             </div>
//           )}

//           {renderProposalState()}
//         </Link>

//         <div className="mt-auto pt-2">
//           <Stack gap={2}>
//             {!isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     onClick={handleSendProposal}
//                     disabled={isLoading}
//                   >
//                     <Heart size={14} className="me-1" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </Button>
//                 )}

//                 {proposalStatus === 'SENT' && (
//                   <Button variant="outline-secondary" size="sm" disabled>
//                     <Heart size={14} className="me-1" />
//                     Proposal Sent
//                   </Button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <Stack direction="horizontal" gap={2} className="justify-content-between">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => handleProposalResponse('ACCEPT')}
//                       disabled={isLoading}
//                     >
//                       <Check size={14} className="me-1" />
//                       {isLoading ? '...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleProposalResponse('REJECT')}
//                       disabled={isLoading}
//                     >
//                       <X size={14} className="me-1" />
//                       {isLoading ? '...' : 'Reject'}
//                     </Button>
//                   </Stack>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Button
//                     variant="success"
//                     size="sm"
//                     href={`/messages/${profile.id}`}
//                     as={Link}
//                   >
//                     <Mail size={14} className="me-1" />
//                     Message
//                   </Button>
//                 )}
//               </>
//             )}

//             <Button
//               variant="outline-primary"
//               size="sm"
//               href={`/profiles/${profile.id}`}
//               as={Link}
//             >
//               <User size={14} className="me-1" />
//               View Profile
//             </Button>
//           </Stack>
//         </div>
//       </Card.Body>
//       <SendProposalButton receiverId={profile.id} />
//     </Card>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from './proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number; // User ID
//     profileId: string; // Public profile ID
//     lastLogin?: string;
//     isVerified?: boolean;
//     isProfileComplete?: boolean;
//     email?: string;
//     phone?: string;
//     profile?: {
//       id: number; // PROFILE ID - CRITICAL ADDITION
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);
//   const [isHovering, setIsHovering] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser || !profile.profile?.id) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId || !profile.profile?.id) return;

//     setIsLoading(true);
//     try {
//       const method = isSaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           profileId: profile.profile.id, // ✅ Correct ID used here
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         setIsSaved(!isSaved);
//         toast.success(isSaved ? 'Removed from saved!' : 'Profile saved!');
//       } else {
//         throw new Error("Failed to save");
//       }
//     } catch (error) {
//       toast.error("Failed to update save status");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // ... (rest of the component remains unchanged)
// }s

// // 'use client';

// // import { useState, useEffect } from 'react';
// // import Link from 'next/link';
// // import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// // import { toast } from 'react-hot-toast';
// // import { Card, Button, Badge, Stack, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
// // import SendProposalButton from './proposals/SendProposalButton';

// // interface ProfileCardProps {
// //   profile: {
// //     id: number;
// //     profileId: string;
// //     lastLogin?: string;
// //     isVerified?: boolean;
// //     isProfileComplete?: boolean;
// //     email?: string;
// //     phone?: string;
// //     profile?: {
// //       photos?: { id: number; url: string; isMain: boolean }[];
// //       sex?: string;
// //       birthday?: string;
// //       district?: string;
// //       maritalStatus?: string;
// //       religion?: string;
// //       caste?: string;
// //       height?: number;
// //       motherTongue?: string;
// //       education?: string;
// //       occupation?: string;
// //       annualIncome?: string;
// //       aboutMe?: string;
// //       familyDetails?: string;
// //       hobbies?: string;
// //       expectations?: string;
// //     };
// //   };
// //   isCurrentUser: boolean;
// //   proposalStatus?: string | null;
// //   currentUserId?: number | null;
// // }

// // export default function ProfileCard({
// //   profile,
// //   isCurrentUser,
// //   proposalStatus: initialProposalStatus,
// //   currentUserId,
// // }: ProfileCardProps) {
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
// //   const [proposalId, setProposalId] = useState<number | null>(null);
// //   const [isSaved, setIsSaved] = useState(false);
// //   const [hydrated, setHydrated] = useState(false);
// //   const [isHovering, setIsHovering] = useState(false);

// //   useEffect(() => {
// //     setHydrated(true);
// //   }, []);

// //   useEffect(() => {
// //     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
// //       fetchProposalStatus();
// //     }
// //     checkIfProfileSaved();
// //   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

// //   const fetchProposalStatus = async () => {
// //     try {
// //       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
// //       if (response.ok) {
// //         const data = await response.json();
// //         if (data.proposal) {
// //           setProposalStatus(data.proposal.status);
// //           setProposalId(data.proposal.id);
// //         }
// //       }
// //     } catch (error) {
// //       console.error('Error fetching proposal status:', error);
// //     }
// //   };

// //   const checkIfProfileSaved = async () => {
// //     if (!currentUserId || isCurrentUser) return;

// //     try {
// //       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.id}`);
// //       if (response.ok) {
// //         const data = await response.json();
// //         setIsSaved(data.isSaved);
// //       }
// //     } catch (error) {
// //       console.error('Error checking saved profile:', error);
// //     }
// //   };

// //  const handleSaveProfile = async () => {
// //     if (isLoading || isCurrentUser || !currentUserId) return;

// //     setIsLoading(true);
// //     try {
// //       const isCurrentlySaved = isSaved;
// //       setIsSaved(!isCurrentlySaved);

// //       const method = isCurrentlySaved ? 'DELETE' : 'POST';
// //       const response = await fetch('/api/saved-profiles', {
// //         method,
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify({
// //           profileId: profile.id,
// //           userId: currentUserId,
// //         }),
// //       });

// //       if (response.ok) {
// //         toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
// //       } else {
// //         setIsSaved(isCurrentlySaved);
// //         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
// //       }
// //     } catch (error) {
// //       setIsSaved(prev => !prev);
// //       toast.error('Something went wrong!');
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

//   // const handleSaveProfile = async () => {
//   //   if (isLoading || isCurrentUser || !currentUserId) return;

//   //   setIsLoading(true);
//   //   try {
//   //     const isCurrentlySaved = isSaved;
//   //     setIsSaved(!isCurrentlySaved);

//   //     const method = isCurrentlySaved ? 'DELETE' : 'POST';
//   //     const response = await fetch('/api/saved-profiles', {
//   //       method,
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify({
//   //         profileId: profile.id,
//   //         userId: currentUserId,
//   //       }),
//   //     });

//   //     if (response.ok) {
//   //       toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
//   //     } else {
//   //       setIsSaved(isCurrentlySaved);
//   //       toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//   //     }
//   //   } catch (error) {
//   //     setIsSaved(prev => !prev);
//   //     toast.error('Something went wrong!');
//   //   } finally {
//   //     setIsLoading(false);
//   //   }
//   // };

//   const getLastLoginText = () => {
//     if (!profile.lastLogin) return 'Long time ago';
    
//     const lastLoginDate = new Date(profile.lastLogin);
//     const now = new Date();
//     const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays <= 1) return 'Yesterday';
//     if (diffDays <= 7) return 'This week';
//     if (diffDays <= 30) return 'This month';
//     return 'Long time ago';
//   };

//   const renderProfileStatusBadges = () => (
//     <Stack direction="horizontal" gap={1} className="mt-1">
//       {profile.isVerified && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Verified Profile</Tooltip>}>
//           <Badge bg="success" pill className="d-flex align-items-center">
//             <BadgeCheck size={12} className="me-1" /> Verified
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       {profile.isProfileComplete ? (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Complete Profile</Tooltip>}>
//           <Badge bg="info" pill className="d-flex align-items-center">
//             <Check size={12} className="me-1" /> Complete
//           </Badge>
//         </OverlayTrigger>
//       ) : (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Incomplete Profile</Tooltip>}>
//           <Badge bg="warning" pill className="d-flex align-items-center">
//             <ShieldAlert size={12} className="me-1" /> Incomplete
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       <OverlayTrigger placement="top" overlay={<Tooltip>Last Active</Tooltip>}>
//         <Badge bg="secondary" pill className="d-flex align-items-center">
//           <Clock size={12} className="me-1" /> {getLastLoginText()}
//         </Badge>
//       </OverlayTrigger>
//     </Stack>
//   );

//   const renderProposalState = () => {
//     if (!proposalStatus) return null;

//     const stateConfig = {
//       SENT: {
//         bg: 'warning',
//         icon: <Heart size={14} />,
//         text: 'Proposal Sent',
//         tooltip: 'Waiting for response'
//       },
//       RECEIVED: {
//         bg: 'primary',
//         icon: <Mail size={14} />,
//         text: 'Proposal Received',
//         tooltip: 'Respond to proposal'
//       },
//       ACCEPTED: {
//         bg: 'success',
//         icon: <Check size={14} />,
//         text: 'Accepted',
//         tooltip: 'Proposal accepted'
//       },
//       REJECTED: {
//         bg: 'danger',
//         icon: <X size={14} />,
//         text: 'Rejected',
//         tooltip: 'Proposal rejected'
//       }
//     };

//     const state = stateConfig[proposalStatus as keyof typeof stateConfig];

//     return (
//       <OverlayTrigger placement="top" overlay={<Tooltip>{state.tooltip}</Tooltip>}>
//         <Badge bg={state.bg} pill className="d-flex align-items-center mt-1">
//           {state.icon}
//           <span className="ms-1">{state.text}</span>
//         </Badge>
//       </OverlayTrigger>
//     );
//   };

//   const renderProfileImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';
//     const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);

//     // Default image URLs based on gender
//     const defaultImages = {
//       male: '/images/default-male.png',
//       female: '/images/default-female.png',
//       other: '/images/default-neutral.png'
//     };

//     // Use the appropriate default image if no photo exists
//     const imageUrl = mainPhoto?.url || defaultImages[gender as keyof typeof defaultImages] || defaultImages.other;

//     return (
//       <div 
//         className="position-relative"
//         onMouseEnter={() => isCurrentUser && setIsHovering(true)}
//         onMouseLeave={() => isCurrentUser && setIsHovering(false)}
//       >
//         <div className="w-100" style={{ height: '200px', overflow: 'hidden' }}>
//           <img
//             src={imageUrl}
//             alt={profile.profileId}
//             className="w-100 h-100 object-fit-cover"
//             onError={(e) => {
//               // Fallback to gender-specific background color if image fails to load
//               const target = e.target as HTMLImageElement;
//               target.style.display = 'none';
//               const fallbackDiv = document.createElement('div');
//               fallbackDiv.className = `w-100 h-100 d-flex align-items-center justify-content-center ${
//                 gender === 'male' ? 'bg-primary' : 
//                 gender === 'female' ? 'bg-pink' : 'bg-secondary'
//               }`;
              
//               const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
//               fallbackDiv.innerHTML = `<span class="text-white display-4">${placeholderText}</span>`;
//               target.parentNode?.insertBefore(fallbackDiv, target);
//               target.parentNode?.removeChild(target);
//             }}
//           />
//         </div>
        
//         {isCurrentUser && isHovering && (
//           <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-25">
//             <Camera size={32} className="text-white" />
//             <input
//               type="file"
//               accept="image/*"
//               className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
//               onChange={handleImageUpload}
//             />
//           </div>
//         )}
//       </div>
//     );
//   };

//   const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (!e.target.files?.length || !isCurrentUser) return;

//     const file = e.target.files[0];
//     setIsLoading(true);

//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       formData.append('profileId', profile.id.toString());

//       const response = await fetch('/api/profiles/upload-photo', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         toast.success('Profile photo updated successfully!');
//         // You would typically update the profile state here with the new photo
//       } else {
//         throw new Error('Failed to upload photo');
//       }
//     } catch (error) {
//       console.error('Error uploading photo:', error);
//       toast.error('Failed to upload photo');
//     } finally {
//       setIsLoading(false);
//       setIsHovering(false);
//     }
//   };

//   const handleSendProposal = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus('SENT');
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           receiverId: profile.id,
//           senderId: currentUserId,
//         }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setProposalId(data.id);
//       }
//     } catch (error) {
//       setProposalStatus(initialProposalStatus);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProposalResponse = async (action: 'ACCEPT' | 'REJECT') => {
//     if (isLoading || isCurrentUser || !proposalId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus(action);
//       await fetch(`/api/proposals/${proposalId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: action }),
//       });
//     } catch (error) {
//       setProposalStatus('RECEIVED');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!hydrated) return null;

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       {renderProfileImage()}
      
//       {isSaved && (
//         <Badge bg="primary" className="position-absolute top-2 start-2">
//           <BookmarkCheck size={14} className="me-1" />
//           Saved
//         </Badge>
//       )}

//       {!isCurrentUser && (
//         <Button
//           variant="light"
//           onClick={handleSaveProfile}
//           className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
//           size="sm"
//           aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//         >
//           {isSaved ? (
//             <BookmarkCheck size={18} className="text-primary" />
//           ) : (
//             <Bookmark size={18} />
//           )}
//         </Button>
//       )}

//       <Card.Body className="d-flex flex-column p-3">
//         <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <div>
//               <Card.Title className="mb-0 fs-5 d-flex align-items-center">
//                 {profile.profileId}
//                 {profile.isVerified && (
//                   <BadgeCheck size={16} className="ms-1 text-success" />
//                 )}
//               </Card.Title>
//               {renderProfileStatusBadges()}
//             </div>
//             <Card.Subtitle className="text-muted fs-6">
//               {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
//             </Card.Subtitle>
//           </div>

//           <div className="d-flex align-items-center mb-2">
//             {profile.profile?.sex && (
//               <small className="me-2">{profile.profile.sex}</small>
//             )}
//             {profile.profile?.height && (
//               <small className="me-2">• {profile.profile.height}cm</small>
//             )}
//             {profile.profile?.district && (
//               <small>• {profile.profile.district}</small>
//             )}
//           </div>

//           {profile.profile?.occupation && (
//             <div className="mb-2">
//               <small className="text-muted">Works as</small>
//               <div>{profile.profile.occupation}</div>
//             </div>
//           )}

//           {profile.profile?.education && (
//             <div className="mb-2">
//               <small className="text-muted">Education</small>
//               <div>{profile.profile.education}</div>
//             </div>
//           )}

//           {profile.profile?.aboutMe && (
//             <div className="mb-2">
//               <small className="text-muted">About</small>
//               <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
//             </div>
//           )}

//           {renderProposalState()}
//         </Link>

//         <div className="mt-auto pt-2">
//           <Stack gap={2}>
//             {!isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     onClick={handleSendProposal}
//                     disabled={isLoading}
//                   >
//                     <Heart size={14} className="me-1" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </Button>
//                 )}

//                 {proposalStatus === 'SENT' && (
//                   <Button variant="outline-secondary" size="sm" disabled>
//                     <Heart size={14} className="me-1" />
//                     Proposal Sent
//                   </Button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <Stack direction="horizontal" gap={2} className="justify-content-between">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => handleProposalResponse('ACCEPT')}
//                       disabled={isLoading}
//                     >
//                       <Check size={14} className="me-1" />
//                       {isLoading ? '...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleProposalResponse('REJECT')}
//                       disabled={isLoading}
//                     >
//                       <X size={14} className="me-1" />
//                       {isLoading ? '...' : 'Reject'}
//                     </Button>
//                   </Stack>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Button
//                     variant="success"
//                     size="sm"
//                     href={`/messages/${profile.id}`}
//                     as={Link}
//                   >
//                     <Mail size={14} className="me-1" />
//                     Message
//                   </Button>
//                 )}
//               </>
//             )}

//             <Button
//               variant="outline-primary"
//               size="sm"
//               href={`/profiles/${profile.id}`}
//               as={Link}
//             >
//               <User size={14} className="me-1" />
//               View Profile
//             </Button>
//           </Stack>
//         </div>
//       </Card.Body>
//       <SendProposalButton receiverId={profile.id} />
//     </Card>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from './proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number;
//     profileId: string;
//     lastLogin?: string;
//     isVerified?: boolean;
//     isProfileComplete?: boolean;
//     email?: string;
//     phone?: string;
//     profile?: {
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       const isCurrentlySaved = isSaved;
//       setIsSaved(!isCurrentlySaved);

//       const method = isCurrentlySaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.id,
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
//       } else {
//         setIsSaved(isCurrentlySaved);
//         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//       }
//     } catch (error) {
//       setIsSaved(prev => !prev);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getLastLoginText = () => {
//     if (!profile.lastLogin) return 'Long time ago';
    
//     const lastLoginDate = new Date(profile.lastLogin);
//     const now = new Date();
//     const diffDays = Math.floor((now.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return 'Today';
//     if (diffDays <= 1) return 'Yesterday';
//     if (diffDays <= 7) return 'This week';
//     if (diffDays <= 30) return 'This month';
//     return 'Long time ago';
//   };

//   const renderProfileStatusBadges = () => (
//     <Stack direction="horizontal" gap={1} className="mt-1">
//       {profile.isVerified && (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Verified Profile</Tooltip>}>
//           <Badge bg="success" pill className="d-flex align-items-center">
//             <BadgeCheck size={12} className="me-1" /> Verified
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       {profile.isProfileComplete ? (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Complete Profile</Tooltip>}>
//           <Badge bg="info" pill className="d-flex align-items-center">
//             <Check size={12} className="me-1" /> Complete
//           </Badge>
//         </OverlayTrigger>
//       ) : (
//         <OverlayTrigger placement="top" overlay={<Tooltip>Incomplete Profile</Tooltip>}>
//           <Badge bg="warning" pill className="d-flex align-items-center">
//             <ShieldAlert size={12} className="me-1" /> Incomplete
//           </Badge>
//         </OverlayTrigger>
//       )}
      
//       <OverlayTrigger placement="top" overlay={<Tooltip>Last Active</Tooltip>}>
//         <Badge bg="secondary" pill className="d-flex align-items-center">
//           <Clock size={12} className="me-1" /> {getLastLoginText()}
//         </Badge>
//       </OverlayTrigger>
//     </Stack>
//   );

//   const renderProposalState = () => {
//     if (!proposalStatus) return null;

//     const stateConfig = {
//       SENT: {
//         bg: 'warning',
//         icon: <Heart size={14} />,
//         text: 'Proposal Sent',
//         tooltip: 'Waiting for response'
//       },
//       RECEIVED: {
//         bg: 'primary',
//         icon: <Mail size={14} />,
//         text: 'Proposal Received',
//         tooltip: 'Respond to proposal'
//       },
//       ACCEPTED: {
//         bg: 'success',
//         icon: <Check size={14} />,
//         text: 'Accepted',
//         tooltip: 'Proposal accepted'
//       },
//       REJECTED: {
//         bg: 'danger',
//         icon: <X size={14} />,
//         text: 'Rejected',
//         tooltip: 'Proposal rejected'
//       }
//     };

//     const state = stateConfig[proposalStatus as keyof typeof stateConfig];

//     return (
//       <OverlayTrigger placement="top" overlay={<Tooltip>{state.tooltip}</Tooltip>}>
//         <Badge bg={state.bg} pill className="d-flex align-items-center mt-1">
//           {state.icon}
//           <span className="ms-1">{state.text}</span>
//         </Badge>
//       </OverlayTrigger>
//     );
//   };

//   const renderProfileImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';
//     const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);
    
//     if (mainPhoto?.url) {
//       return (
//         <Card.Img
//           variant="top"
//           src={mainPhoto.url}
//           alt={profile.profileId}
//           style={{ height: '200px', objectFit: 'cover' }}
//         />
//       );
//     }

//     const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
//     const bgColor = gender === 'male' ? 'bg-primary' : gender === 'female' ? 'bg-pink' : 'bg-secondary';
    
//     return (
//       <div 
//         className={`${bgColor} d-flex align-items-center justify-content-center`} 
//         style={{ height: '200px' }}
//       >
//         <span className="text-white display-4">{placeholderText}</span>
//       </div>
//     );
//   };

//   const handleSendProposal = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus('SENT');
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           receiverId: profile.id,
//           senderId: currentUserId,
//         }),
//       });
//       if (response.ok) {
//         const data = await response.json();
//         setProposalId(data.id);
//       }
//     } catch (error) {
//       setProposalStatus(initialProposalStatus);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProposalResponse = async (action: 'ACCEPT' | 'REJECT') => {
//     if (isLoading || isCurrentUser || !proposalId) return;

//     setIsLoading(true);
//     try {
//       setProposalStatus(action);
//       await fetch(`/api/proposals/${proposalId}`, {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: action }),
//       });
//     } catch (error) {
//       setProposalStatus('RECEIVED');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!hydrated) return null;

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       <div className="position-relative">
//         {renderProfileImage()}
        
//         {isSaved && (
//           <Badge bg="primary" className="position-absolute top-2 start-2">
//             <BookmarkCheck size={14} className="me-1" />
//             Saved
//           </Badge>
//         )}

//         {!isCurrentUser && (
//           <Button
//             variant="light"
//             onClick={handleSaveProfile}
//             className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
//             size="sm"
//             aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//           >
//             {isSaved ? (
//               <BookmarkCheck size={18} className="text-primary" />
//             ) : (
//               <Bookmark size={18} />
//             )}
//           </Button>
//         )}
//       </div>

//       <Card.Body className="d-flex flex-column p-3">
//         <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
//           <div className="d-flex justify-content-between align-items-start mb-2">
//             <div>
//               <Card.Title className="mb-0 fs-5 d-flex align-items-center">
//                 {profile.profileId}
//                 {profile.isVerified && (
//                   <BadgeCheck size={16} className="ms-1 text-success" />
//                 )}
//               </Card.Title>
//               {renderProfileStatusBadges()}
//             </div>
//             <Card.Subtitle className="text-muted fs-6">
//               {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
//             </Card.Subtitle>
//           </div>

//           <div className="d-flex align-items-center mb-2">
//             {profile.profile?.sex && (
//               <small className="me-2">{profile.profile.sex}</small>
//             )}
//             {profile.profile?.height && (
//               <small className="me-2">• {profile.profile.height}cm</small>
//             )}
//             {profile.profile?.district && (
//               <small>• {profile.profile.district}</small>
//             )}
//           </div>

//           {profile.profile?.occupation && (
//             <div className="mb-2">
//               <small className="text-muted">Works as</small>
//               <div>{profile.profile.occupation}</div>
//             </div>
//           )}

//           {profile.profile?.education && (
//             <div className="mb-2">
//               <small className="text-muted">Education</small>
//               <div>{profile.profile.education}</div>
//             </div>
//           )}

//           {profile.profile?.aboutMe && (
//             <div className="mb-2">
//               <small className="text-muted">About</small>
//               <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
//             </div>
//           )}

//           {renderProposalState()}
//         </Link>

//         <div className="mt-auto pt-2">
//           <Stack gap={2}>
//             {!isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     onClick={handleSendProposal}
//                     disabled={isLoading}
//                   >
//                     <Heart size={14} className="me-1" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </Button>
//                 )}

//                 {proposalStatus === 'SENT' && (
//                   <Button variant="outline-secondary" size="sm" disabled>
//                     <Heart size={14} className="me-1" />
//                     Proposal Sent
//                   </Button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <Stack direction="horizontal" gap={2} className="justify-content-between">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={() => handleProposalResponse('ACCEPT')}
//                       disabled={isLoading}
//                     >
//                       <Check size={14} className="me-1" />
//                       {isLoading ? '...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => handleProposalResponse('REJECT')}
//                       disabled={isLoading}
//                     >
//                       <X size={14} className="me-1" />
//                       {isLoading ? '...' : 'Reject'}
//                     </Button>
//                   </Stack>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Button
//                     variant="success"
//                     size="sm"
//                     href={`/messages/${profile.id}`}
//                     as={Link}
//                   >
//                     <Mail size={14} className="me-1" />
//                     Message
//                   </Button>
//                 )}
//               </>
//             )}

//             <Button
//               variant="outline-primary"
//               size="sm"
//               href={`/profiles/${profile.id}`}
//               as={Link}
//             >
//               <User size={14} className="me-1" />
//               View Profile
//             </Button>
//           </Stack>
//         </div>
//       </Card.Body>
//       <SendProposalButton receiverId={profile.id} />
//     </Card>
//   );
// }

// ......................close to perfect card
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Row, Col } from 'react-bootstrap';
// import SendProposalButton from './proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number;
//     profileId: string;
//     email?: string;
//     phone?: string;
//     profile?: {
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       const isCurrentlySaved = isSaved;
//       setIsSaved(!isCurrentlySaved);

//       const method = isCurrentlySaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.id,
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         toast.success(isCurrentlySaved ? 'Profile removed from saved!' : 'Profile saved!');
//       } else {
//         setIsSaved(isCurrentlySaved);
//         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//       }
//     } catch (error) {
//       setIsSaved(prev => !prev);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderProfileImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';
//     const mainPhoto = profile.profile?.photos?.find((p) => p.isMain);
    
//     if (mainPhoto?.url) {
//       return (
//         <Card.Img
//           variant="top"
//           src={mainPhoto.url}
//           alt={profile.profileId}
//           style={{ height: '200px', objectFit: 'cover' }}
//         />
//       );
//     }

//     const placeholderText = gender === 'male' ? 'M' : gender === 'female' ? 'F' : 'O';
//     const bgColor = gender === 'male' ? 'bg-primary' : gender === 'female' ? 'bg-pink' : 'bg-secondary';
    
//     return (
//       <div 
//         className={`${bgColor} d-flex align-items-center justify-content-center`} 
//         style={{ height: '200px' }}
//       >
//         <span className="text-white display-4">{placeholderText}</span>
//       </div>
//     );
//   };

//   const renderProposalBadge = () => {
//     if (!proposalStatus) return null;

//     const variantMap = {
//       SENT: 'warning',
//       RECEIVED: 'primary',
//       ACCEPTED: 'success',
//       REJECTED: 'danger',
//     };

//     const textMap = {
//       SENT: 'Sent',
//       RECEIVED: 'Received',
//       ACCEPTED: 'Connected',
//       REJECTED: 'Rejected',
//     };

//     const statusKey = proposalStatus as keyof typeof variantMap;

//     return (
//       <Badge pill bg={variantMap[statusKey] || 'secondary'} className="ms-2">
//         {textMap[statusKey] || proposalStatus}
//       </Badge>
//     );
//   };

//   if (!hydrated) return null;

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       <div className="position-relative">
//         {renderProfileImage()}
        
//         {isSaved && (
//           <Badge bg="primary" className="position-absolute top-2 start-2">
//             <BookmarkCheck size={14} className="me-1" />
//             Saved
//           </Badge>
//         )}

//         {!isCurrentUser && (
//           <Button
//             variant="light"
//             onClick={handleSaveProfile}
//             className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
//             size="sm"
//             aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//           >
//             {isSaved ? (
//               <BookmarkCheck size={18} className="text-primary" />
//             ) : (
//               <Bookmark size={18} />
//             )}
//           </Button>
//         )}
//       </div>

//       <Card.Body className="d-flex flex-column p-3">
//         <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <Card.Title className="mb-0 fs-5">
//               {profile.profileId}
//               {renderProposalBadge()}
//             </Card.Title>
//             <Card.Subtitle className="text-muted fs-6">
//               {profile.profile?.birthday ? new Date().getFullYear() - new Date(profile.profile.birthday).getFullYear() : ''} yrs
//             </Card.Subtitle>
//           </div>

//           <div className="d-flex align-items-center mb-2">
//             {profile.profile?.sex && (
//               <small className="me-2">{profile.profile.sex}</small>
//             )}
//             {profile.profile?.height && (
//               <small className="me-2">• {profile.profile.height}cm</small>
//             )}
//             {profile.profile?.district && (
//               <small>• {profile.profile.district}</small>
//             )}
//           </div>

//           {profile.profile?.occupation && (
//             <div className="mb-2">
//               <small className="text-muted">Works as</small>
//               <div>{profile.profile.occupation}</div>
//             </div>
//           )}

//           {profile.profile?.education && (
//             <div className="mb-2">
//               <small className="text-muted">Education</small>
//               <div>{profile.profile.education}</div>
//             </div>
//           )}

//           {profile.profile?.aboutMe && (
//             <div className="mb-2">
//               <small className="text-muted">About</small>
//               <p className="mb-0 text-truncate">{profile.profile.aboutMe}</p>
//             </div>
//           )}
//         </Link>

//         <div className="mt-auto pt-2">
//           <Stack gap={2}>
//             {!isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <Button
//                     variant="primary"
//                     size="sm"
//                     onClick={async () => {
//                       if (isLoading || isCurrentUser || !currentUserId) return;
//                       setIsLoading(true);
//                       try {
//                         setProposalStatus('SENT');
//                         const response = await fetch('/api/proposals', {
//                           method: 'POST',
//                           headers: { 'Content-Type': 'application/json' },
//                           body: JSON.stringify({
//                             receiverId: profile.id,
//                             senderId: currentUserId,
//                           }),
//                         });
//                         if (response.ok) {
//                           const data = await response.json();
//                           setProposalId(data.id);
//                         }
//                       } catch (error) {
//                         setProposalStatus(initialProposalStatus);
//                       } finally {
//                         setIsLoading(false);
//                       }
//                     }}
//                     disabled={isLoading}
//                   >
//                     <Heart size={14} className="me-1" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </Button>
//                 )}

//                 {proposalStatus === 'SENT' && (
//                   <Button variant="outline-secondary" size="sm" disabled>
//                     <Heart size={14} className="me-1" />
//                     Proposal Sent
//                   </Button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <Stack direction="horizontal" gap={2} className="justify-content-between">
//                     <Button
//                       variant="success"
//                       size="sm"
//                       onClick={async () => {
//                         if (isLoading || isCurrentUser || !proposalId) return;
//                         setIsLoading(true);
//                         try {
//                           setProposalStatus('ACCEPTED');
//                           await fetch(`/api/proposals/${proposalId}`, {
//                             method: 'PATCH',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({ status: 'ACCEPTED' }),
//                           });
//                         } catch (error) {
//                           setProposalStatus('RECEIVED');
//                         } finally {
//                           setIsLoading(false);
//                         }
//                       }}
//                       disabled={isLoading}
//                     >
//                       <Check size={14} className="me-1" />
//                       {isLoading ? '...' : 'Accept'}
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={async () => {
//                         if (isLoading || isCurrentUser || !proposalId) return;
//                         setIsLoading(true);
//                         try {
//                           setProposalStatus('REJECTED');
//                           await fetch(`/api/proposals/${proposalId}`, {
//                             method: 'PATCH',
//                             headers: { 'Content-Type': 'application/json' },
//                             body: JSON.stringify({ status: 'REJECTED' }),
//                           });
//                         } catch (error) {
//                           setProposalStatus('RECEIVED');
//                         } finally {
//                           setIsLoading(false);
//                         }
//                       }}
//                       disabled={isLoading}
//                     >
//                       <X size={14} className="me-1" />
//                       {isLoading ? '...' : 'Reject'}
//                     </Button>
//                   </Stack>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Button
//                     variant="success"
//                     size="sm"
//                     href={`/messages/${profile.id}`}
//                     as={Link}
//                   >
//                     <Mail size={14} className="me-1" />
//                     Message
//                   </Button>
//                 )}
//               </>
//             )}

//             <Button
//               variant="outline-primary"
//               size="sm"
//               href={`/profiles/${profile.id}`}
//               as={Link}
//             >
//               <User size={14} className="me-1" />
//               View Profile
//             </Button>
//           </Stack>
//         </div>
//       </Card.Body>
//       <SendProposalButton receiverId={profile.id} />
//     </Card>
//   );
// }


// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck } from "lucide-react";
// import { toast } from "react-hot-toast";

// interface ProfileCardProps {
//   profile: {
//     id: number;
//     profileId: string;
//     email?: string;
//     phone?: string;
//     profile?: {
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);

//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching proposal status:", error);
//     }
//   };

//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser) return;
//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error("Error checking saved profile:", error);
//     }
//   };

//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;
//     setIsLoading(true);
//     try {
//       const prev = isSaved;
//       setIsSaved(!prev);
//       const method = prev ? "DELETE" : "POST";
//       const response = await fetch("/api/saved-profiles", {
//         method,
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ profileId: profile.id, userId: currentUserId }),
//       });
//       if (!response.ok) {
//         setIsSaved(prev);
//         toast.error(prev ? "Failed to remove profile" : "Failed to save profile");
//       } else {
//         toast.success(prev ? "Profile removed from saved!" : "Profile saved!");
//       }
//     } catch (error) {
//       setIsSaved((prev) => !prev);
//       toast.error("Something went wrong!");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const renderProposalBadge = () => {
//     if (!proposalStatus) return null;
//     const badgeClasses = {
//       SENT: "bg-yellow-200 text-yellow-800",
//       RECEIVED: "bg-blue-200 text-blue-800",
//       ACCEPTED: "bg-green-200 text-green-800",
//       REJECTED: "bg-red-200 text-red-800",
//     };
//     const badgeText = {
//       SENT: "Proposal Sent",
//       RECEIVED: "Proposal Received",
//       ACCEPTED: "Connected",
//       REJECTED: "Proposal Rejected",
//     };
//     const statusKey = proposalStatus as keyof typeof badgeClasses;
//     return (
//       <div className="mt-2 mb-2">
//         <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeClasses[statusKey]}`}>{
//           badgeText[statusKey]
//         }</span>
//       </div>
//     );
//   };

//   const getPlaceholderImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || "other";
//     if (gender === "male") return "/images/placeholder-male.png";
//     if (gender === "female") return "/images/placeholder-female.png";
//     return "/images/placeholder-other.png";
//   };

//   if (!hydrated) return null;

//   const profileImage = profile.profile?.photos?.find((p) => p.isMain)?.url || getPlaceholderImage();

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
//       <div className="relative flex flex-col items-center">
//         <Link href={`/profile/${profile.profileId}`}>
//           <img src={profileImage} alt="Profile" className="w-40 h-40 object-cover rounded-full mb-4 border" />
//         </Link>
//         {renderProposalBadge()}
//         <h2 className="text-lg font-semibold mb-1">{profile.profile?.education || "No Education Info"}</h2>
//         <p className="text-sm text-gray-600 mb-2">{profile.profile?.occupation || "No Occupation Info"}</p>

//         <button
//           onClick={handleSaveProfile}
//           disabled={isLoading}
//           className={`flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
//             ${isSaved ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
//         >
//           {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
//           {isSaved ? "Saved" : "Save"}
//         </button>
//       </div>
//     </div>
//   );
// }



// import React from "react";
// import { Bookmark, BookmarkCheck, Check, Heart, X } from "lucide-react";

// type ProfileCardProps = {
//   profile: any;
//   isSaved: boolean;
//   isCurrentUser: boolean;
//   proposalStatus: string | null;
//   isLoading: boolean;
//   handleSendProposal: () => void;
//   handleProposalResponse: (response: string) => void;
//   handleSaveProfile: () => void;
// };

// const ProfileCard: React.FC<ProfileCardProps> = ({
//   profile,
//   isSaved,
//   isCurrentUser,
//   proposalStatus,
//   isLoading,
//   handleSendProposal,
//   handleProposalResponse,
//   handleSaveProfile,
// }) => {
//   const calculateAge = (birthday: string) => {
//     const birthDate = new Date(birthday);
//     const ageDifMs = Date.now() - birthDate.getTime();
//     const ageDate = new Date(ageDifMs);
//     return Math.abs(ageDate.getUTCFullYear() - 1970);
//   };

//   const getDefaultImageByGender = () => {
//     if (profile.profile?.gender === "female") {
//       return "https://via.placeholder.com/300x200.png?text=Female+Profile";
//     } else {
//       return "https://via.placeholder.com/300x200.png?text=Male+Profile";
//     }
//   };

//   const renderProposalBadge = () => {
//     if (!proposalStatus) return null;

//     const badgeClasses = {
//       SENT: "bg-warning text-dark",
//       RECEIVED: "bg-info text-dark",
//       ACCEPTED: "bg-success",
//       REJECTED: "bg-danger",
//     };

//     const badgeText = {
//       SENT: "Proposal Sent",
//       RECEIVED: "Proposal Received",
//       ACCEPTED: "Connected",
//       REJECTED: "Proposal Rejected",
//     };

//     const statusKey = proposalStatus as keyof typeof badgeClasses;

//     return (
//       <div className="mb-2">
//         <span className={`badge ${badgeClasses[statusKey]}`}>
//           {badgeText[statusKey] || proposalStatus}
//         </span>
//       </div>
//     );
//   };

//   const mainPhoto =
//     profile.profile?.photos?.find((p: any) => p.isMain)?.url ||
//     getDefaultImageByGender();

//   return (
//     <div className="card mb-4 shadow-sm">
//       {/* Profile Image */}
//       <div className="position-relative">
//         <img
//           src={mainPhoto}
//           className="card-img-top"
//           alt={profile.profileId}
//           style={{ objectFit: "cover", height: "14rem" }}
//         />
//         {isSaved && (
//           <span className="position-absolute top-0 start-0 m-2 badge bg-primary">
//             Saved
//           </span>
//         )}
//       </div>

//       {/* Card Body */}
//       <div className="card-body">
//         {/* Proposal ID */}
//         <h5 className="card-title mb-3">Proposal ID: {profile.profileId}</h5>

//         {/* Basic Info */}
//         <ul className="list-unstyled mb-3">
//           {profile.profile?.district && (
//             <li>
//               <strong>District:</strong> {profile.profile.district}
//             </li>
//           )}
//           {profile.profile?.birthday && (
//             <li>
//               <strong>Age:</strong> {calculateAge(profile.profile.birthday)}
//             </li>
//           )}
//           {profile.profile?.height && (
//             <li>
//               <strong>Height:</strong> {profile.profile.height} cm
//             </li>
//           )}
//         </ul>

//         {/* Proposal Badge */}
//         {renderProposalBadge()}

//         {/* Action Buttons */}
//         {!isCurrentUser && (
//           <div className="d-flex flex-wrap gap-2">
//             {/* Send Proposal */}
//             {proposalStatus === null && (
//               <button
//                 className="btn btn-outline-success"
//                 disabled={isLoading}
//                 onClick={handleSendProposal}
//               >
//                 <Heart size={16} className="me-1" />
//                 Send Proposal
//               </button>
//             )}

//             {/* Save/Unsave */}
//             <button
//               className={`btn ${
//                 isSaved ? "btn-secondary" : "btn-outline-secondary"
//               }`}
//               onClick={handleSaveProfile}
//               disabled={isLoading}
//             >
//               {isSaved ? (
//                 <>
//                   <BookmarkCheck size={16} className="me-1" />
//                   Unsave
//                 </>
//               ) : (
//                 <>
//                   <Bookmark size={16} className="me-1" />
//                   Save
//                 </>
//               )}
//             </button>

//             {/* Accept/Reject */}
//             {proposalStatus === "RECEIVED" && (
//               <>
//                 <button
//                   className="btn btn-outline-primary"
//                   disabled={isLoading}
//                   onClick={() => handleProposalResponse("ACCEPT")}
//                 >
//                   <Check size={16} className="me-1" />
//                   Accept
//                 </button>
//                 <button
//                   className="btn btn-outline-danger"
//                   disabled={isLoading}
//                   onClick={() => handleProposalResponse("REJECT")}
//                 >
//                   <X size={16} className="me-1" />
//                   Reject
//                 </button>
//               </>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProfileCard;



// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck } from 'lucide-react';
// import { toast } from 'react-hot-toast'; // Import the toast library
// import SendProposalButton from './proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number;
//     profileId: string;
//     email?: string;
//     phone?: string;
//     profile?: {
//       photos?: { id: number; url: string; isMain: boolean }[];
//       sex?: string;
//       birthday?: string;
//       district?: string;
//       maritalStatus?: string;
//       religion?: string;
//       caste?: string;
//       height?: number;
//       motherTongue?: string;
//       education?: string;
//       occupation?: string;
//       annualIncome?: string;
//       aboutMe?: string;
//       familyDetails?: string;
//       hobbies?: string;
//       expectations?: string;
//     };
//   };
//   isCurrentUser: boolean;
//   proposalStatus?: string | null;
//   currentUserId?: number | null;
// }

// export default function ProfileCard({
//   profile,
//   isCurrentUser,
//   proposalStatus: initialProposalStatus,
//   currentUserId,
// }: ProfileCardProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [proposalStatus, setProposalStatus] = useState<string | null | undefined>(initialProposalStatus);
//   const [proposalId, setProposalId] = useState<number | null>(null);
//   const [isSaved, setIsSaved] = useState(false);
//   const [hydrated, setHydrated] = useState(false);

//   // Fix hydration error
//   useEffect(() => {
//     setHydrated(true);
//   }, []);

//   // Fetch current proposal status on component mount if not provided
//   useEffect(() => {
//     if (!initialProposalStatus && currentUserId && !isCurrentUser && hydrated) {
//       fetchProposalStatus();
//     }
//     // Check if profile is saved
//     checkIfProfileSaved();
//   }, [currentUserId, profile.id, initialProposalStatus, isCurrentUser, hydrated]);

//   // Fetch the current proposal status between current user and profile
//   const fetchProposalStatus = async () => {
//     try {
//       const response = await fetch(`/api/proposals/status?receiverId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         if (data.proposal) {
//           setProposalStatus(data.proposal.status);
//           setProposalId(data.proposal.id);
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching proposal status:', error);
//     }
//   };

//   // Check if profile is saved by current user
//   const checkIfProfileSaved = async () => {
//     if (!currentUserId || isCurrentUser) return;

//     try {
//       const response = await fetch(`/api/saved-profiles/check?profileId=${profile.id}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsSaved(data.isSaved);
//       }
//     } catch (error) {
//       console.error('Error checking saved profile:', error);
//     }
//   };

//   // Format the date for display
//   const formatDate = (dateString: string) => {
//     if (!dateString) return '';
//     const date = new Date(dateString);
//     return date.toLocaleDateString();
//   };

//   // Calculate age from birthday
//   const calculateAge = (birthday: string) => {
//     if (!birthday) return '';
//     const birthDate = new Date(birthday);
//     const diff = Date.now() - birthDate.getTime();
//     const ageDate = new Date(diff);
//     return Math.abs(ageDate.getUTCFullYear() - 1970);
//   };

//   // Handle proposal sending
//   const handleSendProposal = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       // Optimistic UI update
//       setProposalStatus('SENT');

//       // API call to send proposal
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           receiverId: profile.id,
//           senderId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setProposalId(data.id);
//       } else {
//         // Revert on failure
//         setProposalStatus(initialProposalStatus);
//         console.error('Failed to send proposal');
//       }
//     } catch (error) {
//       // Revert on error
//       setProposalStatus(initialProposalStatus);
//       console.error('Error sending proposal:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle proposal response (accept/reject)
//   const handleProposalResponse = async (action: 'ACCEPT' | 'REJECT') => {
//     if (isLoading || isCurrentUser || !proposalId) return;

//     setIsLoading(true);
//     try {
//       // Optimistic UI update
//       setProposalStatus(action);

//       // API call to update proposal
//       const response = await fetch(`/api/proposals/${proposalId}`, {
//         method: 'PATCH',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           status: action,
//         }),
//       });

//       if (!response.ok) {
//         // Revert on failure
//         setProposalStatus('RECEIVED');
//         console.error(`Failed to ${action.toLowerCase()} proposal`);
//       }
//     } catch (error) {
//       // Revert on error
//       setProposalStatus('RECEIVED');
//       console.error(`Error ${action.toLowerCase()}ing proposal:`, error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle save/unsave profile
//   const handleSaveProfile = async () => {
//     if (isLoading || isCurrentUser || !currentUserId) return;

//     setIsLoading(true);
//     try {
//       // Optimistic UI update
//       setIsSaved((prevIsSaved) => !prevIsSaved);
//       const isCurrentlySaved = isSaved; // Capture the current state before the API call

//       // API call to save/unsave profile
//       const method = isCurrentlySaved ? 'DELETE' : 'POST';
//       const response = await fetch('/api/saved-profiles', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.id,
//           userId: currentUserId,
//         }),
//       });

//       if (response.ok) {
//         if (isCurrentlySaved) {
//           toast.success('Profile removed from saved!');
//         } else {
//           toast.success('Profile saved!');
//         }
//       } else {
//         // Revert on failure
//         setIsSaved(isCurrentlySaved);
//         console.error(isCurrentlySaved ? 'Failed to unsave profile' : 'Failed to save profile');
//         const errorText = await response.text();
//         console.error('Response from server:', errorText);
//         toast.error(isCurrentlySaved ? 'Failed to remove profile' : 'Failed to save profile');
//       }
//     } catch (error) {
//       // Revert on error
//       setIsSaved((prevIsSaved) => !prevIsSaved);
//       console.error('Error saving/unsaving profile:', error);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Render proposal status badge
//   const renderProposalBadge = () => {
//     if (!proposalStatus) return null;

//     const badgeClasses = {
//       SENT: 'bg-yellow-200 text-yellow-800',
//       RECEIVED: 'bg-blue-200 text-blue-800',
//       ACCEPTED: 'bg-green-200 text-green-800',
//       REJECTED: 'bg-red-200 text-red-800',
//     };

//     const badgeText = {
//       SENT: 'Proposal Sent',
//       RECEIVED: 'Proposal Received',
//       ACCEPTED: 'Connected',
//       REJECTED: 'Proposal Rejected',
//     };

//     const statusKey = proposalStatus as keyof typeof badgeClasses;

//     return (
//       <div className="mt-2 mb-2">
//         <span
//           className={`px-2 py-1 text-xs font-medium rounded-full ${
//             badgeClasses[statusKey] || 'bg-gray-200 text-gray-800'
//           }`}
//         >
//           {badgeText[statusKey] || proposalStatus}
//         </span>
//       </div>
//     );
//   };

//   // Get appropriate placeholder image based on gender
//   const getPlaceholderImage = () => {
//     const gender = profile.profile?.sex?.toLowerCase() || 'other';

//     if (gender === 'male') {
//       return '/images/placeholder-male.png';
//     } else if (gender === 'female') {
//       return '/images/placeholder-female.png';
//     } else {
//       return '/images/placeholder-other.png';
//     }
//   };

//   if (!hydrated) {
//     // You can render a loading state if you want
//     return null;
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       {/* Profile photo with link to profile */}
//       <div className="relative">
//         {profile.profile?.photos?.find((p) => p.isMain) ? (
//           <img
//             src={profile.profile.photos.find((p) => p.isMain)?.url}
//             alt={profile.profileId}
//             className="w-full h-56 object-cover"
//           />
//         ) : (
//           <img
//             src={getPlaceholderImage()}
//             alt={profile.profileId}
//             className="w-full h-56 object-cover"
//           />
//         )}
        
//         {/* Saved Badge - Added Here */}
//         {isSaved && (
//           <div className="absolute top-2 left-2">
//             <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
//               Saved
//             </span>
//           </div>
//         )}

//         {!isCurrentUser && (
//           <button
//             onClick={handleSaveProfile}
//             className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
//             aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
//           >
//             {isSaved ? (
//               <BookmarkCheck className="w-5 h-5 text-blue-600" />
//             ) : (
//               <Bookmark className="w-5 h-5 text-gray-600" />
//             )}
//           </button>
//         )}
//       </div>

//       <Link href={`/profiles/${profile.id}`} className="block">
//         <div className="p-4">
//           <div className="flex items-center justify-between">
//             <div>
//               <h3 className="text-xl font-semibold">{profile.profileId}</h3>
//               <p className="text-gray-600">{profile.profile?.occupation}</p>
//             </div>

//             {/* Proposal Status Badge */}
//             {renderProposalBadge()}
//           </div>

//           {/* Basic Information */}
//           <div className="mt-4 grid grid-cols-2 gap-2">
//             {profile.profile?.sex && (
//               <p className="text-sm">
//                 <span className="font-medium">Gender:</span> {profile.profile.sex}
//               </p>
//             )}
//             {profile.profile?.birthday && (
//               <p className="text-sm">
//                 <span className="font-medium">Age:</span> {calculateAge(profile.profile.birthday)} years
//               </p>
//             )}
//             {profile.profile?.district && (
//               <p className="text-sm">
//                 <span className="font-medium">District:</span> {profile.profile.district}
//               </p>
//             )}
//             {profile.profile?.maritalStatus && (
//               <p className="text-sm">
//                 <span className="font-medium">Marital Status:</span> {profile.profile.maritalStatus}
//               </p>
//             )}
//             {profile.profile?.religion && (
//               <p className="text-sm">
//                 <span className="font-medium">Religion:</span> {profile.profile.religion}
//               </p>
//             )}
//             {profile.profile?.caste && (
//               <p className="text-sm">
//                 <span className="font-medium">Caste:</span> {profile.profile.caste}
//               </p>
//             )}
//             {profile.profile?.height && (
//               <p className="text-sm">
//                 <span className="font-medium">Height:</span> {profile.profile.height} cm
//               </p>
//             )}
//             {profile.profile?.motherTongue && (
//               <p className="text-sm">
//                 <span className="font-medium">Mother Tongue:</span> {profile.profile.motherTongue}
//               </p>
//             )}
//             {profile.profile?.education && (
//               <p className="text-sm">
//                 <span className="font-medium">Education:</span> {profile.profile.education}
//               </p>
//             )}
//             {profile.profile?.annualIncome && (
//               <p className="text-sm">
//                 <span className="font-medium">Annual Income:</span> {profile.profile.annualIncome}
//               </p>
//             )}
//           </div>

//           {/* About me section (truncated) */}
//           {profile.profile?.aboutMe && (
//             <div className="mt-4">
//               <h4 className="font-medium text-sm">About Me</h4>
//               <p className="text-gray-700 text-sm line-clamp-3">{profile.profile.aboutMe}</p>
//             </div>
//           )}

//           {/* Action buttons */}
//           <div className="mt-6 flex flex-wrap gap-2">
//             {!isCurrentUser && (
//               <>
//                 {proposalStatus === null && (
//                   <button
//                     onClick={handleSendProposal}
//                     disabled={isLoading}
//                     className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                   >
//                     <Heart className="w-4 h-4 mr-2" />
//                     {isLoading ? 'Sending...' : 'Send Proposal'}
//                   </button>
//                 )}

//                 {proposalStatus === 'SENT' && (
//                   <button
//                     disabled
//                     className="flex items-center px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed"
//                   >
//                     <Heart className="w-4 h-4 mr-2" />
//                     Proposal Sent
//                   </button>
//                 )}

//                 {proposalStatus === 'RECEIVED' && (
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleProposalResponse('ACCEPT')}
//                       disabled={isLoading}
//                       className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                     >
//                       <Check className="w-4 h-4 mr-2" />
//                       {isLoading ? 'Processing...' : 'Accept'}
//                     </button>
//                     <button
//                       onClick={() => handleProposalResponse('REJECT')}
//                       disabled={isLoading}
//                       className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                     >
//                       <X className="w-4 h-4 mr-2" />
//                       {isLoading ? 'Processing...' : 'Reject'}
//                     </button>
//                   </div>
//                 )}

//                 {proposalStatus === 'ACCEPTED' && (
//                   <Link
//                     href={`/messages/${profile.id}`}
//                     className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                   >
//                     <Mail className="w-4 h-4 mr-2" />
//                     Send Message
//                   </Link>
//                 )}
//               </>
//             )}

//             <Link
//               href={`/profiles/${profile.id}`}
//               className="flex items-center px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
//             >
//               <User className="w-4 h-4 mr-2" />
//               View Profile
//             </Link>
//           </div>
//         </div>
//       </Link>
//       <SendProposalButton receiverId={profile.id} />
//     </div>
//   );
// }