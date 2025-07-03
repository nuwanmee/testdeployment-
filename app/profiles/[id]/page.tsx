'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  FaHeart, 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaUserGraduate, 
  FaBriefcase, 
  FaLanguage, 
  FaVenusMars,
  FaBirthdayCake,
  FaUserTie,
  FaHome,
  FaEdit,
  FaLock
} from 'react-icons/fa';
import { GiFamilyHouse } from 'react-icons/gi';
import { MdHeight } from 'react-icons/md';
import { Form, Button, Container, Alert, Card, Row, Col, Badge, Modal, Spinner } from 'react-bootstrap';
import BackButton from '@/components/ui/BackButton';
import SendProposalButton from '@/components/proposals/SendProposalButton';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface Profile {
  id: number;
  userId: number;
  sex: string | null;
  birthday: string | null;
  district: string | null;
  familyDetails: string | null;
  hobbies: string[] | null;
  expectations: string | null;
  education: string | null;
  occupation: string | null;
  religion: string | null;
  caste: string | null;
  height: number | null;
  maritalStatus: string | null;
  motherTongue: string | null;
  annualIncome: string | null;
  aboutMe: string | null;
  photos: {
    id: number;
    url: string;
    isMain: boolean;
    isApproved: boolean;
  }[];
  preferences?: {
    ageRangeMin: number;
    ageRangeMax: number;
    heightRangeMin: number;
    heightRangeMax: number;
    preferredReligion: string;
    preferredCaste: string;
  } | null;
  user?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    isVerified: boolean | null;
    role: 'ADMIN' | 'USER';
  };
}

export default function ProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formState, setFormState] = useState<Partial<Profile>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isShortlistLoading, setIsShortlistLoading] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch profile data
        const profileResponse = await fetch(`/api/profiles/${params.id}`);
        if (!profileResponse.ok) {
          throw new Error(profileResponse.status === 404 
            ? 'Profile not found' 
            : 'Failed to fetch profile');
        }
        const profileData = await profileResponse.json();
        
        if (!profileData.profile) {
          throw new Error('Invalid profile data');
        }

        setProfile(profileData.profile);
        setFormState(profileData.profile);
        
        // Check shortlist status
        await checkIfShortlisted(profileData.profile.id);
        
        // Check proposal status if logged in
        if (session?.user?.id) {
          const statusResponse = await fetch(
            `/api/proposals/status?receiverId=${profileData.profile.userId}`
          );
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            setProposalStatus(statusData.status);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id, session?.user?.id]);

  const checkIfShortlisted = async (profileId: number) => {
    try {
      const response = await fetch(`/api/shortlists/check?profileId=${profileId}`);
      if (response.ok) {
        const data = await response.json();
        setIsShortlisted(data.isShortlisted);
      }
    } catch (error) {
      console.error('Error checking shortlist status:', error);
    }
  };

  const canViewPhotos = () => {
    if (!profile) return false;
    return (
      session?.user?.role === 'ADMIN' || 
      proposalStatus === 'APPROVED' || 
      profile.userId === parseInt(session?.user?.id || '0')
    );
  };

  const handleShortlist = async () => {
    if (!profile || isShortlistLoading) return;

    setIsShortlistLoading(true);
    try {
      const method = isShortlisted ? 'DELETE' : 'POST';
      const response = await fetch('/api/shortlists', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: profile.id }),
      });

      if (response.ok) {
        setIsShortlisted(!isShortlisted);
        toast.success(
          isShortlisted 
            ? 'Removed from shortlist' 
            : 'Added to shortlist'
        );
      } else {
        throw new Error('Failed to update shortlist');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsShortlistLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: name === 'hobbies' ? value.split(',').map(h => h.trim()) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/profiles/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile.profile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (birthday: string | null) => {
    if (!birthday) return 'Unknown';
    return new Date().getFullYear() - new Date(birthday).getFullYear();
  };

  if (isLoading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading profile...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <BackButton />
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Profile not found</Alert>
        <BackButton />
      </Container>
    );
  }

  const mainPhoto = profile.photos?.find(p => p.isMain)?.url || '/default-profile.jpg';
  const age = calculateAge(profile.birthday);

  return (
    <Container className="py-4">
      <div className="mb-4">
        <BackButton />
      </div>

      <Row>
        <Col lg={8}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={4} className="text-center mb-3 mb-md-0">
                  <div className="position-relative" style={{ height: '300px' }}>
                    <Image
                      src={canViewPhotos() ? mainPhoto : '/default-profile.jpg'}
                      alt={`${profile.user?.firstName}'s profile`}
                      fill
                      className="rounded object-cover"
                      style={{ border: '1px solid #dee2e6' }}
                    />
                    {!canViewPhotos() && (
                      <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75">
                        <div className="text-center p-3">
                          <FaLock className="fs-1 mb-2" />
                          <p className="mb-0">Photos are only visible to approved matches</p>
                        </div>
                      </div>
                    )}
                    {profile.maritalStatus && (
                      <Badge bg="primary" className="position-absolute top-0 end-0 m-2">
                        {profile.maritalStatus}
                      </Badge>
                    )}
                  </div>
                </Col>
                <Col md={8}>
                  <div className="d-flex justify-content-between align-items-start">
                    <h2 className="mb-3">
                      {profile.user?.firstName} {profile.user?.lastName}, {age}
                    </h2>
                    {!isEditing && session?.user?.id === profile.userId.toString() && (
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <FaEdit className="me-1" /> Edit
                      </Button>
                    )}
                  </div>
                  
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {profile.religion && <Badge bg="primary">{profile.religion}</Badge>}
                    {profile.caste && <Badge bg="secondary">{profile.caste}</Badge>}
                    {profile.occupation && <Badge bg="success">{profile.occupation}</Badge>}
                  </div>
                  
                  <Row>
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <ProfileDetailItem
                          icon={<FaVenusMars />}
                          label="Gender"
                          value={profile.sex}
                          editing={isEditing}
                          name="sex"
                          onChange={handleChange}
                          as="select"
                          options={['Male', 'Female', 'Other']}
                        />
                        <ProfileDetailItem
                          icon={<MdHeight />}
                          label="Height"
                          value={profile.height ? `${profile.height} cm` : null}
                          editing={isEditing}
                          name="height"
                          onChange={handleChange}
                          type="number"
                        />
                        <ProfileDetailItem
                          icon={<FaBirthdayCake />}
                          label="Age"
                          value={age.toString()}
                          editing={false}
                        />
                        <ProfileDetailItem
                          icon={<FaUserGraduate />}
                          label="Education"
                          value={profile.education}
                          editing={isEditing}
                          name="education"
                          onChange={handleChange}
                        />
                      </ul>
                    </Col>
                    <Col md={6}>
                      <ul className="list-unstyled">
                        <ProfileDetailItem
                          icon={<FaMapMarkerAlt />}
                          label="Location"
                          value={profile.district}
                          editing={isEditing}
                          name="district"
                          onChange={handleChange}
                        />
                        <ProfileDetailItem
                          icon={<FaBriefcase />}
                          label="Occupation"
                          value={profile.occupation}
                          editing={isEditing}
                          name="occupation"
                          onChange={handleChange}
                        />
                        <ProfileDetailItem
                          icon={<FaLanguage />}
                          label="Mother Tongue"
                          value={profile.motherTongue}
                          editing={isEditing}
                          name="motherTongue"
                          onChange={handleChange}
                        />
                        <ProfileDetailItem
                          icon={<FaUserTie />}
                          label="Income"
                          value={profile.annualIncome}
                          editing={isEditing}
                          name="annualIncome"
                          onChange={handleChange}
                        />
                      </ul>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h3 className="h5 mb-0">About {profile.user?.firstName}</h3>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="aboutMe"
                  value={formState.aboutMe || ''}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.aboutMe || 'No information provided'}</p>
              )}
              
              <h4 className="h6 mt-4">Hobbies & Interests</h4>
              {isEditing ? (
                <Form.Control
                  name="hobbies"
                  value={formState.hobbies?.join(', ') || ''}
                  onChange={handleChange}
                  placeholder="Reading, Traveling, Sports"
                />
              ) : (
                <div className="d-flex flex-wrap gap-2">
                  {profile.hobbies?.length ? (
                    profile.hobbies.map((hobby, index) => (
                      <Badge key={index} bg="light" text="dark" className="border">
                        {hobby}
                      </Badge>
                    ))
                  ) : (
                    <span>No hobbies listed</span>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h3 className="h5 mb-0">Family Details</h3>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="familyDetails"
                  value={formState.familyDetails || ''}
                  onChange={handleChange}
                />
              ) : (
                <p>{profile.familyDetails || 'No family details provided'}</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h3 className="h5 mb-0">Actions</h3>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {session?.user?.id !== profile.userId.toString() && (
                  <>
                    <Button 
                      variant={isShortlisted ? "danger" : "outline-danger"}
                      onClick={handleShortlist}
                      disabled={isShortlistLoading}
                    >
                      <FaHeart className="me-2" /> 
                      {isShortlistLoading ? 'Processing...' : 
                      isShortlisted ? 'Shortlisted' : 'Shortlist'}
                    </Button>
                    <Button 
                      variant="outline-primary"
                      onClick={() => setShowContactModal(true)}
                    >
                      <FaPhone className="me-2" /> Contact
                    </Button>
                    <Button variant="outline-secondary">
                      <FaEnvelope className="me-2" /> Send Message
                    </Button>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h3 className="h5 mb-0">Partner Preferences</h3>
            </Card.Header>
            <Card.Body>
              {profile.preferences ? (
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <FaVenusMars className="me-2 text-muted" />
                    <strong>Age:</strong> {profile.preferences.ageRangeMin} - {profile.preferences.ageRangeMax} years
                  </li>
                  <li className="mb-2">
                    <MdHeight className="me-2 text-muted" />
                    <strong>Height:</strong> {profile.preferences.heightRangeMin} - {profile.preferences.heightRangeMax} cm
                  </li>
                  <li className="mb-2">
                    <FaHome className="me-2 text-muted" />
                    <strong>Religion:</strong> {profile.preferences.preferredReligion || 'No preference'}
                  </li>
                  <li className="mb-2">
                    <GiFamilyHouse className="me-2 text-muted" />
                    <strong>Caste:</strong> {profile.preferences.preferredCaste || 'No preference'}
                  </li>
                </ul>
              ) : (
                <p>No preferences specified</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isEditing && (
        <div className="mt-4 d-flex justify-content-end gap-2">
          <Button 
            variant="outline-secondary" 
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}

      {session?.user?.id !== profile.userId.toString() && (
        <div className="mt-4 d-flex justify-content-between">
          <SendProposalButton receiverId={profile.userId} />
        </div>
      )}

      <ContactModal 
        show={showContactModal} 
        onHide={() => setShowContactModal(false)} 
        email={profile.user?.email || ''}
      />
    </Container>
  );
}

function ProfileDetailItem({
  icon,
  label,
  value,
  editing = false,
  name,
  onChange,
  type = 'text',
  as,
  options
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
  editing?: boolean;
  name?: string;
  onChange?: (e: any) => void;
  type?: string;
  as?: string;
  options?: string[];
}) {
  if (!value && !editing) return null;

  return (
    <li className="mb-2 d-flex align-items-start">
      <span className="me-2 text-muted" style={{ paddingTop: '2px' }}>{icon}</span>
      <div className="flex-grow-1">
        <strong>{label}:</strong>{' '}
        {editing ? (
          as === 'select' ? (
            <Form.Select
              name={name}
              value={value || ''}
              onChange={onChange}
              className="mt-1"
            >
              <option value="">Select {label}</option>
              {options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </Form.Select>
          ) : (
            <Form.Control
              type={type}
              name={name}
              value={value || ''}
              onChange={onChange}
              className="mt-1"
            />
          )
        ) : (
          <span>{value || 'Not specified'}</span>
        )}
      </div>
    </li>
  );
}

function ContactModal({
  show,
  onHide,
  email
}: {
  show: boolean;
  onHide: () => void;
  email: string;
}) {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Contact Information</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>To protect privacy, contact details are only shared with mutual matches.</p>
        {email && (
          <Alert variant="info">
            <p className="mb-1"><strong>Email:</strong> {email}</p>
          </Alert>
        )}
        <p>To view complete contact details, please send an interest request.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary">Send Interest Request</Button>
      </Modal.Footer>
    </Modal>
  );
}

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   FaHeart, 
//   FaPhone, 
//   FaEnvelope, 
//   FaMapMarkerAlt, 
//   FaUserGraduate, 
//   FaBriefcase, 
//   FaLanguage, 
//   FaChild,
//   FaVenusMars,
//   FaBirthdayCake,
//   FaUserTie,
//   FaHome,
//   FaSmile,
//   FaSave,
//   FaEdit
// } from 'react-icons/fa';
// import { GiFamilyHouse } from 'react-icons/gi';
// import { MdHeight, MdFamilyRestroom } from 'react-icons/md';
// import { Form, Button, Container, Alert, Card, Row, Col, Badge, ProgressBar, Modal, Spinner } from 'react-bootstrap';
// import BackButton from '@/components/ui/BackButton';
// import SendProposalButton from '@/components/proposals/SendProposalButton';
// import { toast } from 'react-hot-toast';

// interface Profile {
//   id: number;
//   userId: number;
//   sex: string | null;
//   birthday: string | null;
//   district: string | null;
//   familyDetails: string | null;
//   hobbies: string[] | null;
//   expectations: string | null;
//   education: string | null;
//   occupation: string | null;
//   religion: string | null;
//   caste: string | null;
//   height: number | null;
//   maritalStatus: string | null;
//   motherTongue: string | null;
//   annualIncome: string | null;
//   aboutMe: string | null;
//   photos: Photo[] | null;
//   preferences?: Preference | null;
//   user?: {
//     id: number;
//     firstName: string | null;
//     lastName: string | null;
//     email: string | null;
//     isVerified: boolean | null;
//   };
// }

// interface Photo {
//   id: number;
//   url: string;
//   isMain: boolean;
// }

// interface Preference {
//   ageRangeMin: number;
//   ageRangeMax: number;
//   heightRangeMin: number;
//   heightRangeMax: number;
//   preferredReligion: string;
//   preferredCaste: string;
// }

// export default function ProfilePage({ params }: { params: { id: string } }) {
//   const router = useRouter();
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [formState, setFormState] = useState<Partial<Profile>>({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showContactModal, setShowContactModal] = useState(false);
//   const [isShortlisted, setIsShortlisted] = useState(false);
//   const [isShortlistLoading, setIsShortlistLoading] = useState(false);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch(`/api/profiles/${params.id}`);
        
//         if (!response.ok) {
//           throw new Error(response.status === 404 
//             ? 'Profile not found' 
//             : 'Failed to fetch profile');
//         }

//         const data = await response.json();
//         if (!data.profile) {
//           throw new Error('Invalid profile data');
//         }

//         setProfile(data.profile);
//         setFormState(data.profile);
//         checkIfShortlisted(data.profile.id);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [params.id]);

//   const checkIfShortlisted = async (profileId: number) => {
//     try {
//       const response = await fetch(`/api/shortlists/check?profileId=${profileId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsShortlisted(data.isShortlisted);
//       }
//     } catch (error) {
//       console.error('Error checking shortlist status:', error);
//     }
//   };

//   const handleShortlist = async () => {
//     if (!profile || isShortlistLoading) return;

//     setIsShortlistLoading(true);
//     try {
//       const method = isShortlisted ? 'DELETE' : 'POST';
//       const response = await fetch('/api/shortlists', {
//         method,
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ profileId: profile.id }),
//       });

//       if (response.ok) {
//         setIsShortlisted(!isShortlisted);
//         toast.success(
//           isShortlisted 
//             ? 'Removed from shortlist' 
//             : 'Added to shortlist'
//         );
//       } else {
//         throw new Error('Failed to update shortlist');
//       }
//     } catch (error: any) {
//       toast.error(error.message);
//     } finally {
//       setIsShortlistLoading(false);
//     }
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormState(prev => ({
//       ...prev,
//       [name]: name === 'hobbies' ? value.split(',').map(h => h.trim()) : value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!profile) return;

//     setIsLoading(true);
//     try {
//       const response = await fetch(`/api/profiles/${profile.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formState),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update profile');
//       }

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile.profile);
//       setIsEditing(false);
//       toast.success('Profile updated successfully');
//     } catch (err: any) {
//       setError(err.message);
//       toast.error('Failed to update profile');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const calculateAge = (birthday: string | null) => {
//     if (!birthday) return 'Unknown';
//     return new Date().getFullYear() - new Date(birthday).getFullYear();
//   };

//   if (isLoading) {
//     return (
//       <Container className="py-4 text-center">
//         <Spinner animation="border" variant="primary" />
//         <p className="mt-2">Loading profile...</p>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-4">
//         <Alert variant="danger">{error}</Alert>
//         <BackButton />
//       </Container>
//     );
//   }

//   if (!profile) {
//     return (
//       <Container className="py-4">
//         <Alert variant="warning">Profile not found</Alert>
//         <BackButton />
//       </Container>
//     );
//   }

//   const mainPhoto = profile.photos?.find(p => p.isMain)?.url || '/default-profile.jpg';
//   const age = calculateAge(profile.birthday);

//   return (
//     <Container className="py-4">
//       <div className="mb-4">
//         <BackButton />
//       </div>

//       <Row>
//         <Col lg={8}>
//           <Card className="mb-4 shadow-sm">
//             <Card.Body>
//               <Row>
//                 <Col md={4} className="text-center mb-3 mb-md-0">
//                   <div className="position-relative">
//                     <img 
//                       src={mainPhoto} 
//                       alt={`${profile.user?.firstName}'s profile`}
//                       className="img-fluid rounded mb-3"
//                       style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
//                     />
//                     {profile.maritalStatus && (
//                       <Badge bg="primary" className="position-absolute top-0 end-0">
//                         {profile.maritalStatus}
//                       </Badge>
//                     )}
//                   </div>
//                 </Col>
//                 <Col md={8}>
//                   <div className="d-flex justify-content-between align-items-start">
//                     <h2 className="mb-3">
//                       {profile.user?.firstName} {profile.user?.lastName}, {age}
//                     </h2>
//                     {!isEditing && (
//                       <Button 
//                         variant="outline-primary" 
//                         size="sm"
//                         onClick={() => setIsEditing(true)}
//                       >
//                         <FaEdit className="me-1" /> Edit
//                       </Button>
//                     )}
//                   </div>
                  
//                   <div className="d-flex flex-wrap gap-2 mb-3">
//                     {profile.religion && <Badge bg="primary">{profile.religion}</Badge>}
//                     {profile.caste && <Badge bg="secondary">{profile.caste}</Badge>}
//                     {profile.occupation && <Badge bg="success">{profile.occupation}</Badge>}
//                   </div>
                  
//                   <Row>
//                     <Col md={6}>
//                       <ul className="list-unstyled">
//                         <ProfileDetailItem
//                           icon={<FaVenusMars />}
//                           label="Gender"
//                           value={profile.sex}
//                           editing={isEditing}
//                           name="sex"
//                           onChange={handleChange}
//                           as="select"
//                           options={['Male', 'Female']}
//                         />
//                         <ProfileDetailItem
//                           icon={<MdHeight />}
//                           label="Height"
//                           value={profile.height ? `${profile.height} cm` : null}
//                           editing={isEditing}
//                           name="height"
//                           onChange={handleChange}
//                           type="number"
//                         />
//                         <ProfileDetailItem
//                           icon={<FaBirthdayCake />}
//                           label="Age"
//                           value={age.toString()}
//                           editing={false}
//                         />
//                         <ProfileDetailItem
//                           icon={<FaUserGraduate />}
//                           label="Education"
//                           value={profile.education}
//                           editing={isEditing}
//                           name="education"
//                           onChange={handleChange}
//                         />
//                       </ul>
//                     </Col>
//                     <Col md={6}>
//                       <ul className="list-unstyled">
//                         <ProfileDetailItem
//                           icon={<FaMapMarkerAlt />}
//                           label="Location"
//                           value={profile.district}
//                           editing={isEditing}
//                           name="district"
//                           onChange={handleChange}
//                         />
//                         <ProfileDetailItem
//                           icon={<FaBriefcase />}
//                           label="Occupation"
//                           value={profile.occupation}
//                           editing={isEditing}
//                           name="occupation"
//                           onChange={handleChange}
//                         />
//                         <ProfileDetailItem
//                           icon={<FaLanguage />}
//                           label="Mother Tongue"
//                           value={profile.motherTongue}
//                           editing={isEditing}
//                           name="motherTongue"
//                           onChange={handleChange}
//                         />
//                         <ProfileDetailItem
//                           icon={<FaUserTie />}
//                           label="Income"
//                           value={profile.annualIncome}
//                           editing={isEditing}
//                           name="annualIncome"
//                           onChange={handleChange}
//                         />
//                       </ul>
//                     </Col>
//                   </Row>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">About {profile.user?.firstName}</h3>
//             </Card.Header>
//             <Card.Body>
//               {isEditing ? (
//                 <Form.Control
//                   as="textarea"
//                   rows={5}
//                   name="aboutMe"
//                   value={formState.aboutMe || ''}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{profile.aboutMe || 'No information provided'}</p>
//               )}
              
//               <h4 className="h6 mt-4">Hobbies & Interests</h4>
//               {isEditing ? (
//                 <Form.Control
//                   name="hobbies"
//                   value={formState.hobbies?.join(', ') || ''}
//                   onChange={handleChange}
//                   placeholder="Reading, Traveling, Sports"
//                 />
//               ) : (
//                 <div className="d-flex flex-wrap gap-2">
//                   {profile.hobbies?.length ? (
//                     profile.hobbies.map((hobby, index) => (
//                       <Badge key={index} bg="light" text="dark" className="border">
//                         {hobby}
//                       </Badge>
//                     ))
//                   ) : (
//                     <span>No hobbies listed</span>
//                   )}
//                 </div>
//               )}
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Family Details</h3>
//             </Card.Header>
//             <Card.Body>
//               {isEditing ? (
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   name="familyDetails"
//                   value={formState.familyDetails || ''}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{profile.familyDetails || 'No family details provided'}</p>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Actions</h3>
//             </Card.Header>
//             <Card.Body>
//               <div className="d-grid gap-2">
//                 <Button 
//                   variant={isShortlisted ? "danger" : "outline-danger"}
//                   onClick={handleShortlist}
//                   disabled={isShortlistLoading}
//                 >
//                   <FaHeart className="me-2" /> 
//                   {isShortlistLoading ? 'Processing...' : 
//                    isShortlisted ? 'Shortlisted' : 'Shortlist'}
//                 </Button>
//                 <Button 
//                   variant="outline-primary"
//                   onClick={() => setShowContactModal(true)}
//                 >
//                   <FaPhone className="me-2" /> Contact
//                 </Button>
//                 <Button variant="outline-secondary">
//                   <FaEnvelope className="me-2" /> Send Message
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Partner Preferences</h3>
//             </Card.Header>
//             <Card.Body>
//               {profile.preferences ? (
//                 <ul className="list-unstyled">
//                   <li className="mb-2">
//                     <FaVenusMars className="me-2 text-muted" />
//                     <strong>Age:</strong> {profile.preferences.ageRangeMin} - {profile.preferences.ageRangeMax} years
//                   </li>
//                   <li className="mb-2">
//                     <MdHeight className="me-2 text-muted" />
//                     <strong>Height:</strong> {profile.preferences.heightRangeMin} - {profile.preferences.heightRangeMax} cm
//                   </li>
//                   <li className="mb-2">
//                     <FaHome className="me-2 text-muted" />
//                     <strong>Religion:</strong> {profile.preferences.preferredReligion || 'No preference'}
//                   </li>
//                   <li className="mb-2">
//                     <GiFamilyHouse className="me-2 text-muted" />
//                     <strong>Caste:</strong> {profile.preferences.preferredCaste || 'No preference'}
//                   </li>
//                 </ul>
//               ) : (
//                 <p>No preferences specified</p>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       {isEditing && (
//         <div className="mt-4 d-flex justify-content-end gap-2">
//           <Button 
//             variant="outline-secondary" 
//             onClick={() => setIsEditing(false)}
//           >
//             Cancel
//           </Button>
//           <Button 
//             variant="primary" 
//             onClick={handleSubmit}
//             disabled={isLoading}
//           >
//             {isLoading ? 'Saving...' : 'Save Changes'}
//           </Button>
//         </div>
//       )}

//       <div className="mt-4 d-flex justify-content-between">
//         <SendProposalButton receiverId={profile.userId} />
//       </div>

//       <ContactModal 
//         show={showContactModal} 
//         onHide={() => setShowContactModal(false)} 
//         email={profile.user?.email || ''}
//       />
//     </Container>
//   );
// }

// function ProfileDetailItem({
//   icon,
//   label,
//   value,
//   editing = false,
//   name,
//   onChange,
//   type = 'text',
//   as,
//   options
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string | null;
//   editing?: boolean;
//   name?: string;
//   onChange?: (e: any) => void;
//   type?: string;
//   as?: string;
//   options?: string[];
// }) {
//   if (!value && !editing) return null;

//   return (
//     <li className="mb-2 d-flex align-items-start">
//       <span className="me-2 text-muted" style={{ paddingTop: '2px' }}>{icon}</span>
//       <div className="flex-grow-1">
//         <strong>{label}:</strong>{' '}
//         {editing ? (
//           as === 'select' ? (
//             <Form.Select
//               name={name}
//               value={value || ''}
//               onChange={onChange}
//               className="mt-1"
//             >
//               <option value="">Select {label}</option>
//               {options?.map(opt => (
//                 <option key={opt} value={opt}>{opt}</option>
//               ))}
//             </Form.Select>
//           ) : (
//             <Form.Control
//               type={type}
//               name={name}
//               value={value || ''}
//               onChange={onChange}
//               className="mt-1"
//             />
//           )
//         ) : (
//           <span>{value || 'Not specified'}</span>
//         )}
//       </div>
//     </li>
//   );
// }

// function ContactModal({
//   show,
//   onHide,
//   email
// }: {
//   show: boolean;
//   onHide: () => void;
//   email: string;
// }) {
//   return (
//     <Modal show={show} onHide={onHide}>
//       <Modal.Header closeButton>
//         <Modal.Title>Contact Information</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         <p>To protect privacy, contact details are only shared with mutual matches.</p>
//         {email && (
//           <Alert variant="info">
//             <p className="mb-1"><strong>Email:</strong> {email}</p>
//           </Alert>
//         )}
//         <p>To view complete contact details, please send an interest request.</p>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>
//         <Button variant="primary">Send Interest Request</Button>
//       </Modal.Footer>
//     </Modal>
//   );
// }

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   FaHeart, 
//   FaPhone, 
//   FaEnvelope, 
//   FaMapMarkerAlt, 
//   FaUserGraduate, 
//   FaBriefcase, 
//   FaLanguage, 
//   FaChild,
//   FaVenusMars,
//   FaBirthdayCake,
//   FaUserTie,
//   FaHome,
//   FaSmile,
//   FaSave,
//   FaEdit
// } from 'react-icons/fa';
// import { GiFamilyHouse } from 'react-icons/gi';
// import { MdHeight, MdFamilyRestroom } from 'react-icons/md';
// import { Form, Button, Container, Alert, Card, Row, Col, Badge, ProgressBar, Modal } from 'react-bootstrap';
// import BackButton from '@/components/ui/BackButton';
// import SendProposalButton from '@/components/proposals/SendProposalButton';
// import { toast } from 'react-hot-toast';

// interface Profile {
//   id: number|null;
//   userId: number|null;
//   sex: string|null;
//   birthday: string|null;
//   district: string|null;
//   familyDetails: string|null;
//   hobbies: string[]|null;
//   expectations: string|null;
//   education: string|null;
//   occupation: string|null;
//   religion: string|null;
//   caste: string|null;
//   height: number|null;
//   maritalStatus: string|null;
//   motherTongue: string|null;
//   annualIncome: string|null;
//   aboutMe: string|null;
//   photos: Photo[]|null;
//   preferences?: Preference|null;
//   user?: {
//     firstName: string|null;
//     lastName: string|null;
//     email: string|null;
//     isVerified: boolean|null;
//   };
// }

// interface Photo {
//   id: number;
//   url: string;
//   isMain: boolean;
// }

// interface Preference {
//   ageRangeMin: number;
//   ageRangeMax: number;
//   heightRangeMin: number;
//   heightRangeMax: number;
//   preferredReligion: string;
//   preferredCaste: string;
// }

// export default function ProfilePage({ params }: { params: { id: string } }) {
//   const router = useRouter();
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [formState, setFormState] = useState<Partial<Profile>>({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showContactModal, setShowContactModal] = useState(false);
//   const [isShortlisted, setIsShortlisted] = useState(false);
//   const [isShortlistLoading, setIsShortlistLoading] = useState(false);

//   const initFormState = {
//     sex: '',
//     birthday: '',
//     district: '',
//     familyDetails: '',
//     hobbies: [],
//     expectations: '',
//     education: '',
//     occupation: '',
//     religion: '',
//     caste: '',
//     height: 0,
//     maritalStatus: '',
//     motherTongue: '',
//     annualIncome: '',
//     aboutMe: '',
//     photos: []
//   };

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await fetch(`/api/profiles/${params.id}`);
//         if (!response.ok) {
//           throw new Error('Profile not found');
//         }
//         const data = await response.json();
//         setProfile(data.profile);
//         setFormState(data.profile || initFormState);
//         checkIfShortlisted(data.profile.id);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [params.id]);

//   const checkIfShortlisted = async (profileId: number) => {
//     try {
//       const response = await fetch(`/api/shortlists/check?profileId=${profileId}`);
//       if (response.ok) {
//         const data = await response.json();
//         setIsShortlisted(data.isShortlisted);
//       }
//     } catch (error) {
//       console.error('Error checking shortlist status:', error);
//     }
//   };

//   const handleShortlist = async () => {
//     if (isShortlistLoading || !profile) return;

//     setIsShortlistLoading(true);
//     try {
//       const isCurrentlyShortlisted = isShortlisted;
//       setIsShortlisted(!isCurrentlyShortlisted);

//       const method = isCurrentlyShortlisted ? 'DELETE' : 'POST';
//       const response = await fetch('/api/shortlists', {
//         method,
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           profileId: profile.id,
//         }),
//       });

//       if (response.ok) {
//         toast.success(
//           isCurrentlyShortlisted 
//             ? 'Profile removed from shortlist!' 
//             : 'Profile added to shortlist!'
//         );
//       } else {
//         setIsShortlisted(isCurrentlyShortlisted);
//         toast.error(
//           isCurrentlyShortlisted 
//             ? 'Failed to remove from shortlist' 
//             : 'Failed to add to shortlist'
//         );
//       }
//     } catch (error) {
//       setIsShortlisted(prev => !prev);
//       toast.error('Something went wrong!');
//     } finally {
//       setIsShortlistLoading(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormState(prev => ({
//       ...prev,
//       [name]: name === 'hobbies' ? value.split(',') : value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`/api/profiles/${params.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formState),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update profile');
//       }

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile.profile);
//       setIsEditing(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <Container className="py-4 text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-4">
//         <Alert variant="danger">{error}</Alert>
//         <BackButton />
//       </Container>
//     );
//   }

//   if (!profile) {
//     return (
//       <Container className="py-4">
//         <Alert variant="warning">Profile not found</Alert>
//         <BackButton />
//       </Container>
//     );
//   }

//   return (
//     <Container className="py-4">
//       <div className="mb-4">
//         <BackButton />
//       </div>

//       {error && <Alert variant="danger">{error}</Alert>}

//       <Row>
//         <Col lg={8}>
//           <Card className="mb-4 shadow-sm">
//             <Card.Body>
//               <Row>
//                 <Col md={4} className="text-center mb-3 mb-md-0">
//                   <div className="position-relative">
//                     <img 
//                       src={profile.photos?.find(p => p.isMain)?.url || '/default-profile.jpg'} 
//                       alt={profile.user?.firstName} 
//                       className="img-fluid rounded mb-3"
//                       style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
//                     />
//                     <div className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded">
//                       {profile.maritalStatus}
//                     </div>
//                   </div>
//                   {/* <div className="d-grid gap-2">
//                     <Button 
//                       variant={isShortlisted ? "danger" : "outline-danger"}
//                       onClick={handleShortlist}
//                       disabled={isShortlistLoading}
//                     >
//                       <FaHeart className="me-2" /> 
//                       {isShortlistLoading ? 'Processing...' : 
//                        isShortlisted ? 'Shortlisted' : 'Shortlist'}
//                     </Button>
//                     <Button 
//                       variant="outline-primary"
//                       onClick={() => setShowContactModal(true)}
//                     >
//                       <FaPhone className="me-2" /> Contact
//                     </Button>
//                   </div> */}
//                 </Col>
//                 <Col md={8}>
//                   <h2 className="mb-3">
//                     {isEditing ? (
//                       <Form.Control
//                         name="firstName"
//                         value={formState.user?.firstName || ''}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       `${profile.user?.firstName} ${profile.user?.lastName}, ${new Date().getFullYear() - new Date(profile.birthday).getFullYear()}`
//                     )}
//                   </h2>
                  
//                   <div className="d-flex flex-wrap gap-2 mb-3">
//                     {isEditing ? (
//                       <>
//                         <Form.Control
//                           as="select"
//                           name="religion"
//                           value={formState.religion || ''}
//                           onChange={handleChange}
//                           className="w-auto"
//                         >
//                           <option value="">Select Religion</option>
//                           <option value="Hindu">Hindu</option>
//                           <option value="Muslim">Muslim</option>
//                           <option value="Christian">Christian</option>
//                         </Form.Control>
//                         <Form.Control
//                           name="caste"
//                           value={formState.caste || ''}
//                           onChange={handleChange}
//                           placeholder="Caste"
//                           className="w-auto"
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <Badge bg="primary">{profile.religion}</Badge>
//                         <Badge bg="secondary">{profile.caste}</Badge>
//                         <Badge bg="success">{profile.occupation}</Badge>
//                       </>
//                     )}
//                   </div>
                  
//                   <div className="row">
//                     <div className="col-md-6">
//                       <ul className="list-unstyled">
//                         <li className="mb-2">
//                           <FaVenusMars className="me-2 text-muted" />
//                           <strong>Gender:</strong> {isEditing ? (
//                             <Form.Control
//                               as="select"
//                               name="sex"
//                               value={formState.sex || ''}
//                               onChange={handleChange}
//                             >
//                               <option value="">Select Gender</option>
//                               <option value="Male">Male</option>
//                               <option value="Female">Female</option>
//                             </Form.Control>
//                           ) : profile.sex}
//                         </li>
//                         <li className="mb-2">
//                           <MdHeight className="me-2 text-muted" />
//                           <strong>Height:</strong> {isEditing ? (
//                             <Form.Control
//                               type="number"
//                               name="height"
//                               value={formState.height || ''}
//                               onChange={handleChange}
//                             />
//                           ) : `${profile.height} cm`}
//                         </li>
//                         <li className="mb-2">
//                           <FaBirthdayCake className="me-2 text-muted" />
//                           <strong>Age:</strong> {new Date().getFullYear() - new Date(profile.birthday).getFullYear()}
//                         </li>
//                         <li className="mb-2">
//                           <FaUserGraduate className="me-2 text-muted" />
//                           <strong>Education:</strong> {isEditing ? (
//                             <Form.Control
//                               name="education"
//                               value={formState.education || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.education}
//                         </li>
//                       </ul>
//                     </div>
//                     <div className="col-md-6">
//                       <ul className="list-unstyled">
//                         <li className="mb-2">
//                           <FaMapMarkerAlt className="me-2 text-muted" />
//                           <strong>Location:</strong> {isEditing ? (
//                             <Form.Control
//                               name="district"
//                               value={formState.district || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.district}
//                         </li>
//                         <li className="mb-2">
//                           <FaBriefcase className="me-2 text-muted" />
//                           <strong>Occupation:</strong> {isEditing ? (
//                             <Form.Control
//                               name="occupation"
//                               value={formState.occupation || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.occupation}
//                         </li>
//                         <li className="mb-2">
//                           <FaLanguage className="me-2 text-muted" />
//                           <strong>Mother Tongue:</strong> {isEditing ? (
//                             <Form.Control
//                               name="motherTongue"
//                               value={formState.motherTongue || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.motherTongue}
//                         </li>
//                         <li className="mb-2">
//                           <FaUserTie className="me-2 text-muted" />
//                           <strong>Income:</strong> {isEditing ? (
//                             <Form.Control
//                               name="annualIncome"
//                               value={formState.annualIncome || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.annualIncome}
//                         </li>
//                       </ul>
//                     </div>
//                   </div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">About {profile.user?.firstName}</h3>
//             </Card.Header>
//             <Card.Body>
//               {isEditing ? (
//                 <Form.Control
//                   as="textarea"
//                   rows={5}
//                   name="aboutMe"
//                   value={formState.aboutMe || ''}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{profile.aboutMe}</p>
//               )}
              
//               <h4 className="h6 mt-4">Hobbies & Interests</h4>
//               {isEditing ? (
//                 <Form.Control
//                   name="hobbies"
//                   value={formState.hobbies?.join(',') || ''}
//                   onChange={handleChange}
//                   placeholder="Comma separated hobbies"
//                 />
//               ) : (
//                 <div className="d-flex flex-wrap gap-2">
//                   {profile.hobbies?.map((hobby, index) => (
//                     <Badge key={index} bg="light" text="dark" className="border">{hobby}</Badge>
//                   ))}
//                 </div>
//               )}
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Family Details</h3>
//             </Card.Header>
//             <Card.Body>
//               {isEditing ? (
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   name="familyDetails"
//                   value={formState.familyDetails || ''}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{profile.familyDetails}</p>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Contact Options</h3>
//             </Card.Header>
//             <Card.Body>
//               <div className="d-grid gap-2">
//                 <Button variant="outline-primary" onClick={() => setShowContactModal(true)}>
//                   <FaPhone className="me-2" /> View Contact
//                 </Button>
//                 <Button variant="outline-secondary">
//                   <FaEnvelope className="me-2" /> Send Message
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Partner Preferences</h3>
//             </Card.Header>
//             <Card.Body>
//               {profile.preferences ? (
//                 <ul className="list-unstyled">
//                   <li className="mb-2">
//                     <FaVenusMars className="me-2 text-muted" />
//                     <strong>Age:</strong> {profile.preferences.ageRangeMin} - {profile.preferences.ageRangeMax} years
//                   </li>
//                   <li className="mb-2">
//                     <MdHeight className="me-2 text-muted" />
//                     <strong>Height:</strong> {profile.preferences.heightRangeMin} - {profile.preferences.heightRangeMax} cm
//                   </li>
//                   <li className="mb-2">
//                     <FaHome className="me-2 text-muted" />
//                     <strong>Religion:</strong> {profile.preferences.preferredReligion || 'No preference'}
//                   </li>
//                   <li className="mb-2">
//                     <GiFamilyHouse className="me-2 text-muted" />
//                     <strong>Caste:</strong> {profile.preferences.preferredCaste || 'No preference'}
//                   </li>
//                 </ul>
//               ) : (
//                 <p>No preferences specified</p>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <div className="mt-4 d-flex justify-content-between">
//         <SendProposalButton receiverId={profile.id} />
//       </div>

//       <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Contact Information</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>To protect privacy, contact details are only shared with mutual matches.</p>
//           <Alert variant="info">
//             <p className="mb-1"><strong>Email:</strong> {profile.user?.email}</p>
//           </Alert>
//           <p>To view complete contact details, please send an interest request.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowContactModal(false)}>
//             Close
//           </Button>
//           <Button variant="primary">Send Interest Request</Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// }


// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   FaHeart, 
//   FaPhone, 
//   FaEnvelope, 
//   FaMapMarkerAlt, 
//   FaUserGraduate, 
//   FaBriefcase, 
//   FaLanguage, 
//   FaChild,
//   FaVenusMars,
//   FaBirthdayCake,
//   FaUserTie,
//   FaHome,
//   FaSmile,
//   FaSave,
//   FaEdit
// } from 'react-icons/fa';
// import { GiFamilyHouse } from 'react-icons/gi';
// import { MdHeight, MdFamilyRestroom } from 'react-icons/md';
// import { Form, Button, Container, Alert, Card, Row, Col, Badge, ProgressBar, Modal } from 'react-bootstrap';
// import BackButton from '@/components/ui/BackButton';
// import SendProposalButton from '@/components/proposals/SendProposalButton';

// interface Profile {
//   id: number;
//   userId: number;
//   sex: string;
//   birthday: string;
//   district: string;
//   familyDetails: string;
//   hobbies: string[];
//   expectations: string;
//   education: string;
//   occupation: string;
//   religion: string;
//   caste: string;
//   height: number;
//   maritalStatus: string;
//   motherTongue: string;
//   annualIncome: string;
//   aboutMe: string;
//   photos: Photo[];
//   preferences?: Preference;
//   user?: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     isVerified: boolean;
//   };
// }

// interface Photo {
//   id: number;
//   url: string;
//   isMain: boolean;
// }

// interface Preference {
//   ageRangeMin: number;
//   ageRangeMax: number;
//   heightRangeMin: number;
//   heightRangeMax: number;
//   preferredReligion: string;
//   preferredCaste: string;
// }

// export default function ProfilePage({ params }: { params: { id: string } }) {
//   const router = useRouter();
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [formState, setFormState] = useState<Partial<Profile>>({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showContactModal, setShowContactModal] = useState(false);

//   const initFormState = {
//     sex: '',
//     birthday: '',
//     district: '',
//     familyDetails: '',
//     hobbies: [],
//     expectations: '',
//     education: '',
//     occupation: '',
//     religion: '',
//     caste: '',
//     height: 0,
//     maritalStatus: '',
//     motherTongue: '',
//     annualIncome: '',
//     aboutMe: '',
//     photos: []
//   };

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await fetch(`/api/profiles/${params.id}`);
//         if (!response.ok) {
//           throw new Error('Profile not found');
//         }
//         const data = await response.json();
//         setProfile(data.profile);
//         setFormState(data.profile || initFormState);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [params.id]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormState(prev => ({
//       ...prev,
//       [name]: name === 'hobbies' ? value.split(',') : value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`/api/profiles/${params.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formState),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update profile');
//       }

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile.profile);
//       setIsEditing(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <Container className="py-4 text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-4">
//         <Alert variant="danger">{error}</Alert>
//         <BackButton />
//       </Container>
//     );
//   }

//   if (!profile) {
//     return (
//       <Container className="py-4">
//         <Alert variant="warning">Profile not found</Alert>
//         <BackButton />
//       </Container>
//     );
//   }

//   return (
//     <Container className="py-4">
//       <div className="mb-4">
//         <BackButton />
//       </div>

//       {error && <Alert variant="danger">{error}</Alert>}

//       <Row>
//         <Col lg={8}>
//           <Card className="mb-4 shadow-sm">
//             <Card.Body>
//               <Row>
//                 <Col md={4} className="text-center mb-3 mb-md-0">
//                   <div className="position-relative">
//                     <img 
//                       src={profile.photos?.find(p => p.isMain)?.url || '/default-profile.jpg'} 
//                       alt={profile.user?.firstName} 
//                       className="img-fluid rounded mb-3"
//                       style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
//                     />
//                     <div className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded">
//                       {profile.maritalStatus}
//                     </div>
//                   </div>
//                   <div className="d-grid gap-2">
//                     <Button variant="danger">
//                       <FaHeart className="me-2" /> Shortlist
//                     </Button>
//                     <Button 
//                       variant="outline-primary"
//                       onClick={() => setShowContactModal(true)}
//                     >
//                       <FaPhone className="me-2" /> Contact
//                     </Button>
//                   </div>
//                 </Col>
//                 <Col md={8}>
//                   <h2 className="mb-3">
//                     {isEditing ? (
//                       <Form.Control
//                         name="firstName"
//                         value={formState.user?.firstName || ''}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       `${profile.user?.firstName} ${profile.user?.lastName}, ${new Date().getFullYear() - new Date(profile.birthday).getFullYear()}`
//                     )}
//                   </h2>
                  
//                   <div className="d-flex flex-wrap gap-2 mb-3">
//                     {isEditing ? (
//                       <>
//                         <Form.Control
//                           as="select"
//                           name="religion"
//                           value={formState.religion || ''}
//                           onChange={handleChange}
//                           className="w-auto"
//                         >
//                           <option value="">Select Religion</option>
//                           <option value="Hindu">Hindu</option>
//                           <option value="Muslim">Muslim</option>
//                           <option value="Christian">Christian</option>
//                         </Form.Control>
//                         <Form.Control
//                           name="caste"
//                           value={formState.caste || ''}
//                           onChange={handleChange}
//                           placeholder="Caste"
//                           className="w-auto"
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <Badge bg="primary">{profile.religion}</Badge>
//                         <Badge bg="secondary">{profile.caste}</Badge>
//                         <Badge bg="success">{profile.occupation}</Badge>
//                       </>
//                     )}
//                   </div>
                  
//                   <div className="row">
//                     <div className="col-md-6">
//                       <ul className="list-unstyled">
//                         <li className="mb-2">
//                           <FaVenusMars className="me-2 text-muted" />
//                           <strong>Gender:</strong> {isEditing ? (
//                             <Form.Control
//                               as="select"
//                               name="sex"
//                               value={formState.sex || ''}
//                               onChange={handleChange}
//                             >
//                               <option value="">Select Gender</option>
//                               <option value="Male">Male</option>
//                               <option value="Female">Female</option>
//                             </Form.Control>
//                           ) : profile.sex}
//                         </li>
//                         <li className="mb-2">
//                           <MdHeight className="me-2 text-muted" />
//                           <strong>Height:</strong> {isEditing ? (
//                             <Form.Control
//                               type="number"
//                               name="height"
//                               value={formState.height || ''}
//                               onChange={handleChange}
//                             />
//                           ) : `${profile.height} cm`}
//                         </li>
//                         <li className="mb-2">
//                           <FaBirthdayCake className="me-2 text-muted" />
//                           <strong>Age:</strong> {new Date().getFullYear() - new Date(profile.birthday).getFullYear()}
//                         </li>
//                         <li className="mb-2">
//                           <FaUserGraduate className="me-2 text-muted" />
//                           <strong>Education:</strong> {isEditing ? (
//                             <Form.Control
//                               name="education"
//                               value={formState.education || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.education}
//                         </li>
//                       </ul>
//                     </div>
//                     <div className="col-md-6">
//                       <ul className="list-unstyled">
//                         <li className="mb-2">
//                           <FaMapMarkerAlt className="me-2 text-muted" />
//                           <strong>Location:</strong> {isEditing ? (
//                             <Form.Control
//                               name="district"
//                               value={formState.district || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.district}
//                         </li>
//                         <li className="mb-2">
//                           <FaBriefcase className="me-2 text-muted" />
//                           <strong>Occupation:</strong> {isEditing ? (
//                             <Form.Control
//                               name="occupation"
//                               value={formState.occupation || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.occupation}
//                         </li>
//                         <li className="mb-2">
//                           <FaLanguage className="me-2 text-muted" />
//                           <strong>Mother Tongue:</strong> {isEditing ? (
//                             <Form.Control
//                               name="motherTongue"
//                               value={formState.motherTongue || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.motherTongue}
//                         </li>
//                         <li className="mb-2">
//                           <FaUserTie className="me-2 text-muted" />
//                           <strong>Income:</strong> {isEditing ? (
//                             <Form.Control
//                               name="annualIncome"
//                               value={formState.annualIncome || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.annualIncome}
//                         </li>
//                       </ul>
//                     </div>
//                   </div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">About {profile.user?.firstName}</h3>
//             </Card.Header>
//             <Card.Body>
//               {isEditing ? (
//                 <Form.Control
//                   as="textarea"
//                   rows={5}
//                   name="aboutMe"
//                   value={formState.aboutMe || ''}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{profile.aboutMe}</p>
//               )}
              
//               <h4 className="h6 mt-4">Hobbies & Interests</h4>
//               {isEditing ? (
//                 <Form.Control
//                   name="hobbies"
//                   value={formState.hobbies?.join(',') || ''}
//                   onChange={handleChange}
//                   placeholder="Comma separated hobbies"
//                 />
//               ) : (
//                 <div className="d-flex flex-wrap gap-2">
//                   {profile.hobbies?.map((hobby, index) => (
//                     <Badge key={index} bg="light" text="dark" className="border">{hobby}</Badge>
//                   ))}
//                 </div>
//               )}
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Family Details</h3>
//             </Card.Header>
//             <Card.Body>
//               {isEditing ? (
//                 <Form.Control
//                   as="textarea"
//                   rows={3}
//                   name="familyDetails"
//                   value={formState.familyDetails || ''}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{profile.familyDetails}</p>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Contact Options</h3>
//             </Card.Header>
//             <Card.Body>
//               <div className="d-grid gap-2">
//                 <Button variant="outline-primary" onClick={() => setShowContactModal(true)}>
//                   <FaPhone className="me-2" /> View Contact
//                 </Button>
//                 <Button variant="outline-secondary">
//                   <FaEnvelope className="me-2" /> Send Message
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>

//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Partner Preferences</h3>
//             </Card.Header>
//             <Card.Body>
//               {profile.preferences ? (
//                 <ul className="list-unstyled">
//                   <li className="mb-2">
//                     <FaVenusMars className="me-2 text-muted" />
//                     <strong>Age:</strong> {profile.preferences.ageRangeMin} - {profile.preferences.ageRangeMax} years
//                   </li>
//                   <li className="mb-2">
//                     <MdHeight className="me-2 text-muted" />
//                     <strong>Height:</strong> {profile.preferences.heightRangeMin} - {profile.preferences.heightRangeMax} cm
//                   </li>
//                   <li className="mb-2">
//                     <FaHome className="me-2 text-muted" />
//                     <strong>Religion:</strong> {profile.preferences.preferredReligion || 'No preference'}
//                   </li>
//                   <li className="mb-2">
//                     <GiFamilyHouse className="me-2 text-muted" />
//                     <strong>Caste:</strong> {profile.preferences.preferredCaste || 'No preference'}
//                   </li>
//                 </ul>
//               ) : (
//                 <p>No preferences specified</p>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>

//       <div className="mt-4 d-flex justify-content-between">
//         <SendProposalButton receiverId={profile.id} />
//       </div>

//       <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Contact Information</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>To protect privacy, contact details are only shared with mutual matches.</p>
//           <Alert variant="info">
//             <p className="mb-1"><strong>Email:</strong> {profile.user?.email}</p>
//           </Alert>
//           <p>To view complete contact details, please send an interest request.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowContactModal(false)}>
//             Close
//           </Button>
//           <Button variant="primary">Send Interest Request</Button>
//         </Modal.Footer>
//       </Modal>
//     </Container>
//   );
// }


// 'use client';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { 
//   FaHeart, 
//   FaPhone, 
//   FaEnvelope, 
//   FaMapMarkerAlt, 
//   FaUserGraduate, 
//   FaBriefcase, 
//   FaLanguage, 
//   FaChild,
//   FaVenusMars,
//   FaBirthdayCake,
//   FaUserTie,
//   FaHome,
//   FaSmile,
//   FaSave,
//   FaEdit
// } from 'react-icons/fa';
// import { GiFamilyHouse } from 'react-icons/gi';
// import { MdHeight, MdFamilyRestroom } from 'react-icons/md';
// import { Form, Button, Container, Alert, Card, Row, Col, Badge, ProgressBar, Modal } from 'react-bootstrap';
// import BackButton from '@/components/ui/BackButton';
// import SendProposalButton from '@/components/proposals/SendProposalButton';

// interface Profile {
//   id: number;
//   userId: number;
//   sex: string;
//   birthday: string;
//   district: string;
//   familyDetails: string;
//   hobbies: string[];
//   expectations: string;
//   education: string;
//   occupation: string;
//   religion: string;
//   caste: string;
//   height: number;
//   maritalStatus: string;
//   motherTongue: string;
//   annualIncome: string;
//   aboutMe: string;
//   photos: Photo[];
//   preferences?: Preference;
//   user?: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     isVerified: boolean;
//   };
// }

// interface Photo {
//   id: number;
//   url: string;
//   isMain: boolean;
// }

// interface Preference {
//   ageRangeMin: number;
//   ageRangeMax: number;
//   heightRangeMin: number;
//   heightRangeMax: number;
//   preferredReligion: string;
//   preferredCaste: string;
// }

// export default function ProfilePage({ params }: { params: { id: string } }) {
//   const router = useRouter();
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [formState, setFormState] = useState<Partial<Profile>>({});
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [showContactModal, setShowContactModal] = useState(false);

//   // Initialize form with empty values
//   const initFormState = {
//     sex: '',
//     birthday: '',
//     district: '',
//     familyDetails: '',
//     hobbies: [],
//     expectations: '',
//     education: '',
//     occupation: '',
//     religion: '',
//     caste: '',
//     height: 0,
//     maritalStatus: '',
//     motherTongue: '',
//     annualIncome: '',
//     aboutMe: '',
//     photos: []
//   };

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await fetch(`/api/profiles/${params.id}`);
//         if (!response.ok) {
//           throw new Error('Profile not found');
//         }
//         const data = await response.json();
//         setProfile(data.profile);
//         setFormState(data.profile || initFormState);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [params.id]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormState(prev => ({
//       ...prev,
//       [name]: name === 'hobbies' ? value.split(',') : value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     try {
//       const response = await fetch(`/api/profiles/${params.id}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formState),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update profile');
//       }

//       const updatedProfile = await response.json();
//       setProfile(updatedProfile.profile);
//       setIsEditing(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <Container className="py-4 text-center">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container className="py-4">
//         <Alert variant="danger">{error}</Alert>
//       </Container>
//     );
//   }

//   if (!profile) {
//     return (
//       <Container className="py-4">
//         <Alert variant="warning">Profile not found</Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container className="py-4">
//       {error && <Alert variant="danger">{error}</Alert>}

//       {/* Edit/Save buttons */}
//       {/* <div className="d-flex justify-content-end mb-3">
//        <BackButton />
//         {isEditing ? (
//           <>
//             <Button variant="success" className="me-2" onClick={handleSubmit} disabled={isLoading}>
//               <FaSave className="me-2" />
//               {isLoading ? 'Saving...' : 'Save Profile'}
//             </Button>
//             <Button variant="secondary" onClick={() => setIsEditing(false)}>
//               Cancel
//             </Button>
//           </>
//         ) : (
//           <Button variant="primary" onClick={() => setIsEditing(true)}>
//             <FaEdit className="me-2" />
//             Edit Profile
//           </Button>
//         )}
//       </div> */}

//       <Row>
//         <Col lg={8}>
//           {/* Profile Header Card */}
//           <Card className="mb-4 shadow-sm">
//             <Card.Body>
//               <Row>
//                 <Col md={4} className="text-center mb-3 mb-md-0">
//                   <div className="position-relative">
//                     <img 
//                       src={profile.photos?.find(p => p.isMain)?.url || '/default-profile.jpg'} 
//                       alt={profile.user?.firstName} 
//                       className="img-fluid rounded mb-3"
//                       style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
//                     />
//                     <div className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded">
//                       {profile.maritalStatus}
//                     </div>
//                   </div>
//                   <div className="d-grid gap-2">
//                     <Button variant="danger">
//                       <FaHeart className="me-2" /> Shortlist
//                     </Button>
//                     <Button 
//                       variant="outline-primary"
//                       onClick={() => setShowContactModal(true)}
//                     >
//                       <FaPhone className="me-2" /> Contact
//                     </Button>
//                   </div>
//                 </Col>
//                 <Col md={8}>
//                   <h2 className="mb-3">
//                     {isEditing ? (
//                       <Form.Control
//                         name="firstName"
//                         value={formState.user?.firstName || ''}
//                         onChange={handleChange}
//                       />
//                     ) : (
//                       `${profile.user?.firstName} ${profile.user?.lastName}, ${new Date().getFullYear() - new Date(profile.birthday).getFullYear()}`
//                     )}
//                   </h2>
                  
//                   <div className="d-flex flex-wrap gap-2 mb-3">
//                     {isEditing ? (
//                       <>
//                         <Form.Control
//                           as="select"
//                           name="religion"
//                           value={formState.religion || ''}
//                           onChange={handleChange}
//                           className="w-auto"
//                         >
//                           <option value="">Select Religion</option>
//                           <option value="Hindu">Hindu</option>
//                           <option value="Muslim">Muslim</option>
//                           <option value="Christian">Christian</option>
//                         </Form.Control>
//                         <Form.Control
//                           name="caste"
//                           value={formState.caste || ''}
//                           onChange={handleChange}
//                           placeholder="Caste"
//                           className="w-auto"
//                         />
//                       </>
//                     ) : (
//                       <>
//                         <Badge bg="primary">{profile.religion}</Badge>
//                         <Badge bg="secondary">{profile.caste}</Badge>
//                         <Badge bg="success">{profile.occupation}</Badge>
//                       </>
//                     )}
//                   </div>
                  
//                   <div className="row">
//                     <div className="col-md-6">
//                       <ul className="list-unstyled">
//                         <li className="mb-2">
//                           <FaVenusMars className="me-2 text-muted" />
//                           <strong>Gender:</strong> {isEditing ? (
//                             <Form.Control
//                               as="select"
//                               name="sex"
//                               value={formState.sex || ''}
//                               onChange={handleChange}
//                             >
//                               <option value="">Select Gender</option>
//                               <option value="Male">Male</option>
//                               <option value="Female">Female</option>
//                             </Form.Control>
//                           ) : profile.sex}
//                         </li>
//                         <li className="mb-2">
//                           <MdHeight className="me-2 text-muted" />
//                           <strong>Height:</strong> {isEditing ? (
//                             <Form.Control
//                               type="number"
//                               name="height"
//                               value={formState.height || ''}
//                               onChange={handleChange}
//                             />
//                           ) : `${profile.height} cm`}
//                         </li>
//                         {/* More fields... */}
//                       </ul>
//                     </div>
//                     <div className="col-md-6">
//                       <ul className="list-unstyled">
//                         <li className="mb-2">
//                           <FaMapMarkerAlt className="me-2 text-muted" />
//                           <strong>Location:</strong> {isEditing ? (
//                             <Form.Control
//                               name="district"
//                               value={formState.district || ''}
//                               onChange={handleChange}
//                             />
//                           ) : profile.district}
//                         </li>
//                         {/* More fields... */}
//                       </ul>
//                     </div>
//                   </div>
//                 </Col>
//               </Row>
//             </Card.Body>
//           </Card>

//           {/* About Section */}
//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">About {profile.user?.firstName}</h3>
//             </Card.Header>
//             <Card.Body>
//               {isEditing ? (
//                 <Form.Control
//                   as="textarea"
//                   rows={5}
//                   name="aboutMe"
//                   value={formState.aboutMe || ''}
//                   onChange={handleChange}
//                 />
//               ) : (
//                 <p>{profile.aboutMe}</p>
//               )}
              
//               <h4 className="h6 mt-4">Hobbies & Interests</h4>
//               {isEditing ? (
//                 <Form.Control
//                   name="hobbies"
//                   value={formState.hobbies?.join(',') || ''}
//                   onChange={handleChange}
//                   placeholder="Comma separated hobbies"
//                 />
//               ) : (
//                 <div className="d-flex flex-wrap gap-2">
//                   {profile.hobbies?.map((hobby, index) => (
//                     <Badge key={index} bg="light" text="dark" className="border">{hobby}</Badge>
//                   ))}
//                 </div>
//               )}
//             </Card.Body>
//           </Card>
//         </Col>

//         <Col lg={4}>
//           {/* Contact Options */}
//           <Card className="mb-4 shadow-sm">
//             <Card.Header className="bg-light">
//               <h3 className="h5 mb-0">Contact Options</h3>
//             </Card.Header>
//             <Card.Body>
//               <div className="d-grid gap-2">
//                 <Button variant="outline-primary" onClick={() => setShowContactModal(true)}>
//                   <FaPhone className="me-2" /> View Contact
//                 </Button>
//                 <Button variant="outline-secondary">
//                   <FaEnvelope className="me-2" /> Send Message
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//       <SendProposalButton receiverId={profile.id} />
//       {/* Contact Modal */}
//       <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Contact Information</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <p>To protect privacy, contact details are only shared with mutual matches.</p>
//           <Alert variant="info">
//             <p className="mb-1"><strong>Email:</strong> {profile.user?.email}</p>
//           </Alert>
//           <p>To view complete contact details, please send an interest request.</p>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowContactModal(false)}>
//             Close
//           </Button>
//           <Button variant="primary">Send Interest Request</Button>
//         </Modal.Footer>
       
//       </Modal>
      
//       <BackButton />
//     </Container>
//   );
// }

// // src/app/profiles/[id]/page.tsx (Update to include SendProposalButton)
// "use client";

// import React, { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import Image from 'next/image';
// import { useSession } from 'next-auth/react';
// import SendProposalButton from '@/components/proposals/SendProposalButton';


// interface ProfileData {
//   id: number;
//   firstName: string;
//   lastName: string;
//   gender: string;
//   age: number;
//   profilePicture: string;
//   location: string;
//   occupation: string;
//   education: string;
//   religion: string;
//   caste: string;
//   bio: string;
//   // Add other profile fields as needed
// }

// export default function ProfileDetailPage() {
//   const { id } = useParams();
//   const { data: session } = useSession();
//   const [profile, setProfile] = useState<ProfileData | null>(null);
//   const [loading, setLoading] = useState(true);
  
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const response = await fetch(`/api/profiles/${id}`);
//         if (response.ok) {
//           const data = await response.json();
//           setProfile(data);
//         } else {
//           console.error('Failed to fetch profile');
//         }
//       } catch (error) {
//         console.error('Error fetching profile:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     if (id) {
//       fetchProfile();
//     }
//   }, [id]);
  
//   if (loading) {
//     return <div className="container mx-auto p-6">Loading profile...</div>;
//   }
  
//   if (!profile) {
//     return <div className="container mx-auto p-6">Profile not found</div>;
//   }
  
//   // Check if this is the user's own profile
//   const isOwnProfile = session?.user?.id === Number(id);
  
//   return (
//     <div className="container mx-auto p-4 md:p-6">
//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         {/* Profile header */}
//         <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-500">
//           <div className="absolute -bottom-16 left-6">
//             <div className="relative w-32 h-32 rounded-full border-4 border-white overflow-hidden">
//               {profile.profilePicture ? (
//                 <Image
//                   src={profile.profilePicture}
//                   alt={`${profile.firstName}'s profile picture`}
//                   fill
//                   className="object-cover"
//                 />
//               ) : (
//                 <div className="w-full h-full bg-gray-200 flex items-center justify-center">
//                   <span className="text-gray-500 text-4xl">
//                     {profile.firstName?.[0] || '?'}
//                   </span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         {/* Profile actions */}
//         <div className="pt-20 pb-4 px-6 flex justify-between items-center">
//           <div>
//             <h1 className="text-2xl font-bold">
//               {profile.firstName} {profile.lastName}
//             </h1>
//             <p className="text-gray-600">
//               {profile.age} years • {profile.location}
//             </p>
//           </div>
          
//           {/* Display send proposal button only if not viewing own profile */}
//           {!isOwnProfile && (
//             <SendProposalButton receiverId={Number(id)} />
//           )}
//         </div>
        
//         {/* Profile details */}
//         <div className="px-6 py-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
//               <table className="w-full">
//                 <tbody>
//                   <tr>
//                     <td className="py-2 text-gray-600">Gender</td>
//                     <td className="py-2">{profile.gender}</td>
//                   </tr>
//                   <tr>
//                     <td className="py-2 text-gray-600">Religion</td>
//                     <td className="py-2">{profile.religion}</td>
//                   </tr>
//                   <tr>
//                     <td className="py-2 text-gray-600">Caste</td>
//                     <td className="py-2">{profile.caste}</td>
//                   </tr>
//                   <tr>
//                     <td className="py-2 text-gray-600">Education</td>
//                     <td className="py-2">{profile.education}</td>
//                   </tr>
//                   <tr>
//                     <td className="py-2 text-gray-600">Occupation</td>
//                     <td className="py-2">{profile.occupation}</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
            
//             <div>
//               <h2 className="text-lg font-semibold mb-4">About Me</h2>
//               <p className="text-gray-700">{profile.bio}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// // 'use client';
// // import { useState, useEffect } from 'react';
// // import { useRouter } from 'next/navigation';
// // import { 
// //   FaHeart, 
// //   FaPhone, 
// //   FaEnvelope, 
// //   FaMapMarkerAlt, 
// //   FaUserGraduate, 
// //   FaBriefcase, 
// //   FaLanguage, 
// //   FaChild,
// //   FaVenusMars,
// //   FaBirthdayCake,
// //   FaUserTie,
// //   FaHome,
// //   FaSmile,
// //   FaSave,
// //   FaEdit
// // } from 'react-icons/fa';
// // import { GiFamilyHouse } from 'react-icons/gi';
// // import { MdHeight, MdFamilyRestroom } from 'react-icons/md';
// // import { Form, Button, Container, Alert, Card, Row, Col, Badge, ProgressBar, Modal } from 'react-bootstrap';
// // import BackButton from '@/components/ui/BackButton';

// // interface Profile {
// //   id: number;
// //   userId: number;
// //   sex: string;
// //   birthday: string;
// //   district: string;
// //   familyDetails: string;
// //   hobbies: string[];
// //   expectations: string;
// //   education: string;
// //   occupation: string;
// //   religion: string;
// //   caste: string;
// //   height: number;
// //   maritalStatus: string;
// //   motherTongue: string;
// //   annualIncome: string;
// //   aboutMe: string;
// //   photos: Photo[];
// //   preferences?: Preference;
// //   user?: {
// //     firstName: string;
// //     lastName: string;
// //     email: string;
// //     isVerified: boolean;
// //   };
// // }

// // interface Photo {
// //   id: number;
// //   url: string;
// //   isMain: boolean;
// // }

// // interface Preference {
// //   ageRangeMin: number;
// //   ageRangeMax: number;
// //   heightRangeMin: number;
// //   heightRangeMax: number;
// //   preferredReligion: string;
// //   preferredCaste: string;
// // }

// // export default function ProfilePage({ params }: { params: { id: string } }) {
// //   const router = useRouter();
// //   const [profile, setProfile] = useState<Profile | null>(null);
// //   const [formState, setFormState] = useState<Partial<Profile>>({});
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const [showContactModal, setShowContactModal] = useState(false);

// //   // Initialize form with empty values
// //   const initFormState = {
// //     sex: '',
// //     birthday: '',
// //     district: '',
// //     familyDetails: '',
// //     hobbies: [],
// //     expectations: '',
// //     education: '',
// //     occupation: '',
// //     religion: '',
// //     caste: '',
// //     height: 0,
// //     maritalStatus: '',
// //     motherTongue: '',
// //     annualIncome: '',
// //     aboutMe: '',
// //     photos: []
// //   };

// //   useEffect(() => {
// //     const fetchProfile = async () => {
// //       try {
// //         const response = await fetch(`/api/profiles/${params.id}`);
// //         if (!response.ok) {
// //           throw new Error('Profile not found');
// //         }
// //         const data = await response.json();
// //         setProfile(data.profile);
// //         setFormState(data.profile || initFormState);
// //       } catch (err) {
// //         setError(err.message);
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchProfile();
// //   }, [params.id]);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
// //     const { name, value } = e.target;
// //     setFormState(prev => ({
// //       ...prev,
// //       [name]: name === 'hobbies' ? value.split(',') : value
// //     }));
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setIsLoading(true);
    
// //     try {
// //       const response = await fetch(`/api/profiles/${params.id}`, {
// //         method: 'PUT',
// //         headers: {
// //           'Content-Type': 'application/json',
// //         },
// //         body: JSON.stringify(formState),
// //       });

// //       if (!response.ok) {
// //         throw new Error('Failed to update profile');
// //       }

// //       const updatedProfile = await response.json();
// //       setProfile(updatedProfile.profile);
// //       setIsEditing(false);
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <Container className="py-4 text-center">
// //         <div className="spinner-border text-primary" role="status">
// //           <span className="visually-hidden">Loading...</span>
// //         </div>
// //       </Container>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <Container className="py-4">
// //         <Alert variant="danger">{error}</Alert>
// //       </Container>
// //     );
// //   }

// //   if (!profile) {
// //     return (
// //       <Container className="py-4">
// //         <Alert variant="warning">Profile not found</Alert>
// //       </Container>
// //     );
// //   }

// //   return (
// //     <Container className="py-4">
// //       {error && <Alert variant="danger">{error}</Alert>}

// //       {/* Edit/Save buttons */}
// //       <div className="d-flex justify-content-end mb-3">
// //        <BackButton />
// //         {isEditing ? (
// //           <>
// //             <Button variant="success" className="me-2" onClick={handleSubmit} disabled={isLoading}>
// //               <FaSave className="me-2" />
// //               {isLoading ? 'Saving...' : 'Save Profile'}
// //             </Button>
// //             <Button variant="secondary" onClick={() => setIsEditing(false)}>
// //               Cancel
// //             </Button>
// //           </>
// //         ) : (
// //           <Button variant="primary" onClick={() => setIsEditing(true)}>
// //             <FaEdit className="me-2" />
// //             Edit Profile
// //           </Button>
// //         )}
// //       </div>

// //       <Row>
// //         <Col lg={8}>
// //           {/* Profile Header Card */}
// //           <Card className="mb-4 shadow-sm">
// //             <Card.Body>
// //               <Row>
// //                 <Col md={4} className="text-center mb-3 mb-md-0">
// //                   <div className="position-relative">
// //                     <img 
// //                       src={profile.photos?.find(p => p.isMain)?.url || '/default-profile.jpg'} 
// //                       alt={profile.user?.firstName} 
// //                       className="img-fluid rounded mb-3"
// //                       style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }}
// //                     />
// //                     <div className="position-absolute top-0 end-0 bg-primary text-white px-2 py-1 rounded">
// //                       {profile.maritalStatus}
// //                     </div>
// //                   </div>
// //                   <div className="d-grid gap-2">
// //                     <Button variant="danger">
// //                       <FaHeart className="me-2" /> Shortlist
// //                     </Button>
// //                     <Button 
// //                       variant="outline-primary"
// //                       onClick={() => setShowContactModal(true)}
// //                     >
// //                       <FaPhone className="me-2" /> Contact
// //                     </Button>
// //                   </div>
// //                 </Col>
// //                 <Col md={8}>
// //                   <h2 className="mb-3">
// //                     {isEditing ? (
// //                       <Form.Control
// //                         name="firstName"
// //                         value={formState.user?.firstName || ''}
// //                         onChange={handleChange}
// //                       />
// //                     ) : (
// //                       `${profile.user?.firstName} ${profile.user?.lastName}, ${new Date().getFullYear() - new Date(profile.birthday).getFullYear()}`
// //                     )}
// //                   </h2>
                  
// //                   <div className="d-flex flex-wrap gap-2 mb-3">
// //                     {isEditing ? (
// //                       <>
// //                         <Form.Control
// //                           as="select"
// //                           name="religion"
// //                           value={formState.religion || ''}
// //                           onChange={handleChange}
// //                           className="w-auto"
// //                         >
// //                           <option value="">Select Religion</option>
// //                           <option value="Hindu">Hindu</option>
// //                           <option value="Muslim">Muslim</option>
// //                           <option value="Christian">Christian</option>
// //                         </Form.Control>
// //                         <Form.Control
// //                           name="caste"
// //                           value={formState.caste || ''}
// //                           onChange={handleChange}
// //                           placeholder="Caste"
// //                           className="w-auto"
// //                         />
// //                       </>
// //                     ) : (
// //                       <>
// //                         <Badge bg="primary">{profile.religion}</Badge>
// //                         <Badge bg="secondary">{profile.caste}</Badge>
// //                         <Badge bg="success">{profile.occupation}</Badge>
// //                       </>
// //                     )}
// //                   </div>
                  
// //                   <div className="row">
// //                     <div className="col-md-6">
// //                       <ul className="list-unstyled">
// //                         <li className="mb-2">
// //                           <FaVenusMars className="me-2 text-muted" />
// //                           <strong>Gender:</strong> {isEditing ? (
// //                             <Form.Control
// //                               as="select"
// //                               name="sex"
// //                               value={formState.sex || ''}
// //                               onChange={handleChange}
// //                             >
// //                               <option value="">Select Gender</option>
// //                               <option value="Male">Male</option>
// //                               <option value="Female">Female</option>
// //                             </Form.Control>
// //                           ) : profile.sex}
// //                         </li>
// //                         <li className="mb-2">
// //                           <MdHeight className="me-2 text-muted" />
// //                           <strong>Height:</strong> {isEditing ? (
// //                             <Form.Control
// //                               type="number"
// //                               name="height"
// //                               value={formState.height || ''}
// //                               onChange={handleChange}
// //                             />
// //                           ) : `${profile.height} cm`}
// //                         </li>
// //                         {/* More fields... */}
// //                       </ul>
// //                     </div>
// //                     <div className="col-md-6">
// //                       <ul className="list-unstyled">
// //                         <li className="mb-2">
// //                           <FaMapMarkerAlt className="me-2 text-muted" />
// //                           <strong>Location:</strong> {isEditing ? (
// //                             <Form.Control
// //                               name="district"
// //                               value={formState.district || ''}
// //                               onChange={handleChange}
// //                             />
// //                           ) : profile.district}
// //                         </li>
// //                         {/* More fields... */}
// //                       </ul>
// //                     </div>
// //                   </div>
// //                 </Col>
// //               </Row>
// //             </Card.Body>
// //           </Card>

// //           {/* About Section */}
// //           <Card className="mb-4 shadow-sm">
// //             <Card.Header className="bg-light">
// //               <h3 className="h5 mb-0">About {profile.user?.firstName}</h3>
// //             </Card.Header>
// //             <Card.Body>
// //               {isEditing ? (
// //                 <Form.Control
// //                   as="textarea"
// //                   rows={5}
// //                   name="aboutMe"
// //                   value={formState.aboutMe || ''}
// //                   onChange={handleChange}
// //                 />
// //               ) : (
// //                 <p>{profile.aboutMe}</p>
// //               )}
              
// //               <h4 className="h6 mt-4">Hobbies & Interests</h4>
// //               {isEditing ? (
// //                 <Form.Control
// //                   name="hobbies"
// //                   value={formState.hobbies?.join(',') || ''}
// //                   onChange={handleChange}
// //                   placeholder="Comma separated hobbies"
// //                 />
// //               ) : (
// //                 <div className="d-flex flex-wrap gap-2">
// //                   {profile.hobbies?.map((hobby, index) => (
// //                     <Badge key={index} bg="light" text="dark" className="border">{hobby}</Badge>
// //                   ))}
// //                 </div>
// //               )}
// //             </Card.Body>
// //           </Card>
// //         </Col>

// //         <Col lg={4}>
// //           {/* Contact Options */}
// //           <Card className="mb-4 shadow-sm">
// //             <Card.Header className="bg-light">
// //               <h3 className="h5 mb-0">Contact Options</h3>
// //             </Card.Header>
// //             <Card.Body>
// //               <div className="d-grid gap-2">
// //                 <Button variant="outline-primary" onClick={() => setShowContactModal(true)}>
// //                   <FaPhone className="me-2" /> View Contact
// //                 </Button>
// //                 <Button variant="outline-secondary">
// //                   <FaEnvelope className="me-2" /> Send Message
// //                 </Button>
// //               </div>
// //             </Card.Body>
// //           </Card>
// //         </Col>
// //       </Row>

// //       {/* Contact Modal */}
// //       <Modal show={showContactModal} onHide={() => setShowContactModal(false)}>
// //         <Modal.Header closeButton>
// //           <Modal.Title>Contact Information</Modal.Title>
// //         </Modal.Header>
// //         <Modal.Body>
// //           <p>To protect privacy, contact details are only shared with mutual matches.</p>
// //           <Alert variant="info">
// //             <p className="mb-1"><strong>Email:</strong> {profile.user?.email}</p>
// //           </Alert>
// //           <p>To view complete contact details, please send an interest request.</p>
// //         </Modal.Body>
// //         <Modal.Footer>
// //           <Button variant="secondary" onClick={() => setShowContactModal(false)}>
// //             Close
// //           </Button>
// //           <Button variant="primary">Send Interest Request</Button>
// //         </Modal.Footer>
// //       </Modal>
// //     </Container>
// //   );
// // }