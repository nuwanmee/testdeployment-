// app/profiles/ProfileCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card, Button, Badge, Stack, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { ProfileWithDetails } from '@/types/profile';

interface ProfileCardProps {
  profile: ProfileWithDetails;
  currentUserId: number;
}

export default function ProfileCard({ profile, currentUserId }: ProfileCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<number | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetchProposalStatus();
    checkIfProfileSaved();
  }, []);

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
    if (!profile.profile?.id) return;
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
    if (isLoading || !profile.profile?.id) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/saved-profiles', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.profile.id,
          userId: currentUserId,
        }),
      });

      if (response.ok) {
        setIsSaved(!isSaved);
        toast.success(isSaved ? 'Profile removed from saved!' : 'Profile saved!');
      } else {
        toast.error('Failed to update saved status');
      }
    } catch (error) {
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
    </Stack>
  );

  const renderProposalState = () => {
    if (!proposalStatus) return null;

    const stateConfig = {
      SENT: { bg: 'warning', icon: <Heart size={14} />, text: 'Proposal Sent', tooltip: 'Waiting for response' },
      RECEIVED: { bg: 'primary', icon: <Mail size={14} />, text: 'Proposal Received', tooltip: 'Respond to proposal' },
      ACCEPTED: { bg: 'success', icon: <Check size={14} />, text: 'Accepted', tooltip: 'Proposal accepted' },
      REJECTED: { bg: 'danger', icon: <X size={14} />, text: 'Rejected', tooltip: 'Proposal rejected' }
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

  if (!hydrated) return null;

  const mainPhoto = profile.profile?.photos?.find(p => p.isMain)?.url || 
    `/images/default-${profile.profile?.sex?.toLowerCase() || 'neutral'}.png`;
  const age = profile.age || (profile.dateOfBirth ? new Date().getFullYear() - new Date(profile.dateOfBirth).getFullYear() : null);

  return (
    <Card className="h-100" style={{ maxWidth: '350px' }}>
      <div className="position-relative">
        <div className="w-100" style={{ height: '200px', overflow: 'hidden' }}>
          <img
            src={mainPhoto}
            alt={profile.profileId}
            className="w-100 h-100 object-fit-cover"
          />
        </div>
        
        {isSaved && (
          <Badge bg="primary" className="position-absolute top-2 start-2">
            <BookmarkCheck size={14} className="me-1" />
            Saved
          </Badge>
        )}

        <Button
          variant="light"
          onClick={handleSaveProfile}
          className="position-absolute top-2 end-2 p-1 rounded-circle shadow-sm"
          size="sm"
          aria-label={isSaved ? 'Remove from saved profiles' : 'Save profile'}
          disabled={isLoading}
        >
          {isSaved ? (
            <BookmarkCheck size={18} className="text-primary" />
          ) : (
            <Bookmark size={18} />
          )}
        </Button>
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <Link href={`/profiles/${profile.id}`} className="text-decoration-none text-dark">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <Card.Title className="mb-0 fs-5 d-flex align-items-center">
                {profile.firstName} {profile.lastName}
                {profile.isVerified && (
                  <BadgeCheck size={16} className="ms-1 text-success" />
                )}
              </Card.Title>
              {renderProfileStatusBadges()}
            </div>
            {age && (
              <Card.Subtitle className="text-muted fs-6">
                {age} yrs
              </Card.Subtitle>
            )}
          </div>

          <div className="d-flex align-items-center mb-2">
            {profile.profile?.sex && <small className="me-2">{profile.profile.sex}</small>}
            {profile.profile?.height && <small className="me-2">• {profile.profile.height}cm</small>}
            {profile.profile?.district && <small>• {profile.profile.district}</small>}
          </div>

          {profile.occupation && (
            <div className="mb-2">
              <small className="text-muted">Works as</small>
              <div>{profile.occupation}</div>
            </div>
          )}

          {profile.education && (
            <div className="mb-2">
              <small className="text-muted">Education</small>
              <div>{profile.education}</div>
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
            {proposalStatus === null && (
              <Button
                variant="primary"
                size="sm"
                href={`/profiles/${profile.id}/propose`}
                as={Link}
                disabled={isLoading}
              >
                <Heart size={14} className="me-1" />
                {isLoading ? 'Loading...' : 'Send Proposal'}
              </Button>
            )}

            {proposalStatus === 'SENT' && (
              <Button variant="outline-secondary" size="sm" disabled>
                <Heart size={14} className="me-1" />
                Proposal Sent
              </Button>
            )}

            {proposalStatus === 'ACCEPTED' && (
              <Button
                variant="success"
                size="sm"
                href={`/messages/${profile.id}`}
                as={Link}
              >
                <Mail size={14} className="me-1" />
                Message
              </Button>
            )}

            <Button
              variant="outline-primary"
              size="sm"
              href={`/profiles/${profile.id}`}
              as={Link}
            >
              <User size={14} className="me-1" />
              View Profile
            </Button>
          </Stack>
        </div>
      </Card.Body>
    </Card>
  );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from '@/components/proposals/SendProposalButton';

// interface ProfileCardProps {
//   profile: {
//     id: number;
//     profileId: string;
//     lastLogin?: string;
//     isVerified?: boolean;
//     isProfileComplete?: boolean;
//     profile?: {
//       id: number;
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
//   // ... [keep all existing state and functions until the return statement]

//   return (
//     <Card className="h-100" style={{ maxWidth: '350px' }}>
//       {/* ... [keep all existing card content until the View Profile button] */}

//       <Button
//         variant="outline-primary"
//         size="sm"
//         href={`/profiles/${profile.profileId}`}
//         as={Link}
//         onClick={(e) => {
//           if (!profile.profileId) {
//             e.preventDefault();
//             toast.error('Profile link is not available');
//             console.error('Missing profileId:', {
//               userId: profile.id,
//               profileData: profile
//             });
//           }
//         }}
//       >
//         <User size={14} className="me-1" />
//         View Profile
//       </Button>

//       {/* ... [rest of the existing code] */}
//     </Card>
//   );
// }


// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { Heart, Mail, User, X, Check, Bookmark, BookmarkCheck, BadgeCheck, ShieldAlert, Clock, Camera } from 'lucide-react';
// import { toast } from 'react-hot-toast';
// import { Card, Button, Badge, Stack, Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
// import SendProposalButton from '@/components/proposals/SendProposalButton';

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
//   href={`/profiles/${profile.profileId}`} // Now using profile ID
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

// import { useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';
// import { ProfileWithDetails } from '@/utils/profileScoring';
// import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
// import { Button } from '@/components/ui/button';
// import { Heart, MessageCircle, Calendar, MapPin, GraduationCap, User2 } from 'lucide-react';
// import { calculateAge } from '@/utils/profileScoring';
// import BackButton from '@/components/ui/BackButton';

// interface ProfileCardProps {
//   profile: ProfileWithDetails;
//   currentUserId: number | null;
//   matchScore?: number;
// }

// export default function ProfileCard({ profile, currentUserId, matchScore }: ProfileCardProps) {
//   const [isSendingProposal, setIsSendingProposal] = useState(false);
  
//   const hasSentProposal = profile.receivedProposals?.some(
//     (proposal) => proposal.senderId === currentUserId
//   );
  
//   const hasReceivedProposal = profile.sentProposals?.some(
//     (proposal) => proposal.receiverId === currentUserId
//   );

//   const profilePhoto = profile.profile?.photos?.find(photo => photo.isMain)?.url || 
//                       profile.profilePicture || 
//                       '/images/placeholder-profile.jpg';
  
//   const sendProposal = async () => {
//     if (!currentUserId || isSendingProposal) return;
    
//     setIsSendingProposal(true);
//     try {
//       const response = await fetch('/api/proposals', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           senderId: currentUserId,
//           receiverId: profile.id,
//           status: 'INTEREST',
//           message: `I'm interested in your profile.`
//         }),
//       });
      
//       if (response.ok) {
//         profile.receivedProposals = [
//           ...(profile.receivedProposals || []),
//           { senderId: currentUserId, receiverId: profile.id, status: 'INTEREST' }
//         ];
//       }
//     } finally {
//       setIsSendingProposal(false);
//     }
//   };

//   return (
//     <Card className="h-full flex flex-col overflow-hidden group">
//       {/* Image Section */}
//       <Link href={`/profiles/${profile.id}`} className="relative h-48 block">
//         <Image
//           src={profilePhoto}
//           alt={`${profile.firstName} ${profile.lastName}`}
//           fill
//           className="object-cover"
//           priority={false}
//         />
        
//         {matchScore !== undefined && (
//           <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-3 py-1 text-sm font-bold shadow-md">
//             {matchScore}% Match
//           </div>
//         )}
//       </Link>
      
//       {/* Content Section */}
//       <div className="flex flex-col flex-grow">
//         <CardHeader className="pb-2">
//           <Link href={`/profiles/${profile.id}`} className="hover:underline">
//             <h3 className="text-xl font-semibold">{profile.firstName} {profile.lastName}</h3>
//             <p className="text-sm text-gray-500">
//               {profile.profile?.profileId || `Profile #${profile.id}`}
//             </p>
//           </Link>
//         </CardHeader>
        
//         <CardContent className="flex-grow">        
//           <div className="space-y-2">
//            {profile.dateOfBirth && (
//             <div className="flex items-center text-sm">
//               <Calendar className="h-4 w-4 mr-2 text-gray-400" />
//               <span>{calculateAge(profile.dateOfBirth)} years</span>
//             </div>
//           )}
          
//           {profile.profile?.district && (
//             <div className="flex items-center text-sm">
//               <MapPin className="h-4 w-4 mr-2 text-gray-400" />
//               <span>{profile.profile.district}</span>
//             </div>
//           )}
          
//           {profile.education && (
//             <div className="flex items-center text-sm">
//               <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
//               <span>{profile.education}</span>
//             </div>
//           )}
          
//           {profile.occupation && (
//             <div className="flex items-center text-sm">
//               <User2 className="h-4 w-4 mr-2 text-gray-400" />
//               <span>{profile.occupation}</span>
//             </div>
//           )}
//         </div>
        
//         {profile.profile?.aboutMe && (
//           <div className="mt-4">
//             <p className="text-sm line-clamp-3">{profile.profile.aboutMe}</p>
//           </div>
//         )}
//       </CardContent>
        
//         <CardFooter className="border-t pt-4">
//           <div className="w-full flex justify-between gap-2">
           

//             <Button
//               variant="outline-primary"
//               size="sm"
//               href={`/profiles/${profile.profile?.id}`}  // Now using profile ID
//               as={Link}
//             >
//                           View Profile
//                         </Button>
            
//             {/* {currentUserId && currentUserId !== profile.id ? (
//               hasSentProposal ? (
//                 <Button variant="secondary" className="w-full flex-1" disabled>
//                   Interest Sent
//                 </Button>
//               ) : hasReceivedProposal ? (
//                 <Link href={`/messages?userId=${profile.id}`} legacyBehavior passHref>
//                   <Button asChild className="w-full flex-1">
//                     <a>Respond</a>
//                   </Button>
//                 </Link>
//               ) : (
//                 <Button 
//                   onClick={sendProposal} 
//                   disabled={isSendingProposal}
//                   className="w-full flex-1"
//                 >
//                   <Heart className="h-4 w-4 mr-2" />
//                   {isSendingProposal ? 'Sending...' : 'Send Interest'}
//                 </Button>
//               )
//             ) : (
//               <Link href={`/profiles/${profile.id}`} legacyBehavior passHref>
//                 <Button asChild className="w-full flex-1">
//                   <a>
//                     <MessageCircle className="h-4 w-4 mr-2" />
//                     Contact
//                   </a>
//                 </Button>
//               </Link>
//             )} */}
          
//           </div>
          
//         </CardFooter>
//       </div>
//     </Card>
//   );
// }