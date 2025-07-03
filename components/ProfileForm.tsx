// 'use client';

// import { useState, useRef, ChangeEvent } from 'react';
// import { useSession } from 'next-auth/react';
// import Image from 'next/image';
// import { FaTrash, FaUpload, FaLock, FaEdit, FaSave, FaStar, FaRegStar, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
// import { Button, Form, Alert, Spinner, Badge } from 'react-bootstrap';
// import { toast } from 'react-hot-toast';

// type Profile = {
//   id?: number;
//   userId?: number;
//   sex?: 'Male' | 'Female' | 'Other' | null;
//   birthday?: string | null;
//   district?: string | null;
//   familyDetails?: string | null;
//   hobbies?: string | null;
//   expectations?: string | null;
//   education?: string | null;
//   occupation?: string | null;
//   religion?: string | null;
//   caste?: string | null;
//   height?: number | null;
//   maritalStatus?: string | null;
//   motherTongue?: string | null;
//   annualIncome?: string | null;
//   aboutMe?: string | null;
//   photos?: {
//     id: number;
//     url: string;
//     isMain: boolean;
//     isApproved: boolean;
//     originalName?: string;
//   }[];
//   isOwnProfile?: boolean;
// };

// export default function ProfileForm({ profile }: { profile?: Profile }) {
//   const { data: session } = useSession();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);
//   const [photos, setPhotos] = useState(profile?.photos || []);
//   const [formData, setFormData] = useState<Omit<Profile, 'photos'>>({
//     familyDetails: profile?.familyDetails || '',
//     hobbies: profile?.hobbies || '',
//     expectations: profile?.expectations || '',
//     education: profile?.education || '',
//     occupation: profile?.occupation || '',
//     religion: profile?.religion || '',
//     caste: profile?.caste || '',
//     height: profile?.height || null,
//     maritalStatus: profile?.maritalStatus || '',
//     motherTongue: profile?.motherTongue || '',
//     annualIncome: profile?.annualIncome || '',
//     aboutMe: profile?.aboutMe || '',
//     sex: profile?.sex || null,
//     birthday: profile?.birthday || '',
//     district: profile?.district || '',
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [isEditing, setIsEditing] = useState(false);

//   const isOwnProfile = profile?.isOwnProfile !== false;

//   const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
//     if (!isOwnProfile) {
//       toast.error('You can only upload photos to your own profile');
//       return;
//     }

//     const files = e.target.files;
//     if (!files || files.length === 0) {
//       toast.error('No files selected');
//       return;
//     }

//     // Check photo limit
//     const MAX_PHOTOS = 10;
//     if (photos.length >= MAX_PHOTOS) {
//       toast.error(`Maximum ${MAX_PHOTOS} photos allowed`);
//       return;
//     }

//     if (photos.length + files.length > MAX_PHOTOS) {
//       toast.error(`Cannot upload ${files.length} files. Maximum ${MAX_PHOTOS} photos allowed. You have ${photos.length} photos already.`);
//       return;
//     }

//     setUploading(true);
//     setError('');
    
//     try {
//       const formData = new FormData();
//       const validFiles = Array.from(files).filter(file => {
//         if (!file.type.startsWith('image/')) {
//           toast.error(`${file.name}: Only image files allowed`);
//           return false;
//         }
//         if (file.size > 5 * 1024 * 1024) {
//           toast.error(`${file.name}: File must be <5MB`);
//           return false;
//         }
//         return true;
//       });

//       if (validFiles.length === 0) {
//         toast.error('No valid files to upload');
//         return;
//       }

//       validFiles.forEach(file => {
//         formData.append('files', file);
//       });

//       const response = await fetch('/api/profile/photos/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       const responseData = await response.json().catch(() => ({}));

//       if (!response.ok) {
//         let errorMessage = 'Failed to upload photos';
        
//         if (Array.isArray(responseData?.details)) {
//           errorMessage = responseData.details.join('\n');
//         } else if (typeof responseData?.details === 'string') {
//           errorMessage = responseData.details;
//         } else if (responseData?.error) {
//           errorMessage = responseData.error;
//         } else if (responseData?.message) {
//           errorMessage = responseData.message;
//         }

//         throw new Error(errorMessage);
//       }

//       if (!responseData.photos) {
//         throw new Error('Invalid response from server');
//       }

//       setPhotos(prev => [...prev, ...responseData.photos]);
//       toast.success(responseData.message || 'Photos uploaded successfully');
      
//       // Show warnings if any
//       if (responseData.warnings && responseData.warnings.length > 0) {
//         responseData.warnings.forEach((warning: string) => {
//           toast.error(warning);
//         });
//       }

//     } catch (error: any) {
//       console.error('Upload error:', error);
//       const displayError = error.message || 'Failed to upload photos';
//       setError(displayError);
//       toast.error(displayError);
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const handleSetMainPhoto = async (photoId: number) => {
//     if (!isOwnProfile) {
//       toast.error('You can only modify your own profile');
//       return;
//     }

//     try {
//       const response = await fetch('/api/profile/photos/main', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ photoId }),
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData?.error || 'Failed to set main photo');
//       }

//       const updatedPhotos = photos.map(photo => ({
//         ...photo,
//         isMain: photo.id === photoId,
//       }));
//       setPhotos(updatedPhotos);
//       toast.success('Main photo updated');
//     } catch (error: any) {
//       console.error('Error setting main photo:', error);
//       toast.error(error.message || 'Failed to set main photo');
//     }
//   };

//   const handleDeletePhoto = async (photoId: number) => {
//     if (!isOwnProfile) {
//       toast.error('You can only modify your own profile');
//       return;
//     }

//     if (!confirm('Are you sure you want to delete this photo?')) return;
    
//     try {
//       const response = await fetch(`/api/profile/photos/${photoId}`, {
//         method: 'DELETE',
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData?.error || 'Failed to delete photo');
//       }

//       setPhotos(photos.filter(photo => photo.id !== photoId));
//       toast.success('Photo deleted');
//     } catch (error: any) {
//       console.error('Error deleting photo:', error);
//       toast.error(error.message || 'Failed to delete photo');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!isOwnProfile) {
//       toast.error('You can only edit your own profile');
//       return;
//     }

//     setIsSubmitting(true);
//     setError('');

//     try {
//       const response = await fetch('/api/profile', {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to update profile');
//       }

//       toast.success('Profile updated successfully');
//       setIsEditing(false);
//     } catch (error: any) {
//       console.error('Error updating profile:', error);
//       setError(error.message || 'Failed to update profile');
//       toast.error(error.message || 'Failed to update profile');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   return (
//     <div className="profile-form-container">
//       {error && <Alert variant="danger">{error}</Alert>}

//       <Form onSubmit={handleSubmit}>
//         <div className="mb-4">
//           <h4>Photos</h4>
//           <div className="photo-upload-container mb-3">
//             {isOwnProfile && (
//               <>
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   onChange={handlePhotoUpload}
//                   style={{ display: 'none' }}
//                 />
//                 <Button
//                   variant="primary"
//                   onClick={() => fileInputRef.current?.click()}
//                   disabled={uploading || photos.length >= 10}
//                 >
//                   {uploading ? <Spinner size="sm" /> : <><FaUpload /> Upload Photos</>}
//                 </Button>
//                 <small className="text-muted ms-2">Max 10 photos (max 5MB each)</small>
//               </>
//             )}
//           </div>

//           <div className="photo-grid">
//             {photos.map(photo => (
//               <div key={photo.id} className="photo-thumbnail-container">
//                 <div className="photo-thumbnail">
//                   <Image
//                     src={photo.url}
//                     alt="Profile photo"
//                     width={150}
//                     height={150}
//                     className="img-thumbnail"
//                   />
//                   <div className="photo-actions">
//                     {photo.isMain ? (
//                       <Badge bg="success" className="main-badge">
//                         <FaStar /> Main
//                       </Badge>
//                     ) : isOwnProfile ? (
//                       <Button
//                         variant="outline-success"
//                         size="sm"
//                         onClick={() => handleSetMainPhoto(photo.id)}
//                         title="Set as main"
//                       >
//                         <FaRegStar />
//                       </Button>
//                     ) : null}
                    
//                     {isOwnProfile && (
//                       <Button
//                         variant="outline-danger"
//                         size="sm"
//                         onClick={() => handleDeletePhoto(photo.id)}
//                         title="Delete photo"
//                       >
//                         <FaTrash />
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//                 {!photo.isApproved && (
//                   <Badge bg="warning" text="dark" className="approval-badge">
//                     Pending Approval
//                   </Badge>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="mb-4">
//           <h4>Basic Information</h4>
//           <div className="row">
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Sex</Form.Label>
//                 <Form.Select
//                   name="sex"
//                   value={formData.sex || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 >
//                   <option value="">Select</option>
//                   <option value="Male">Male</option>
//                   <option value="Female">Female</option>
//                   <option value="Other">Other</option>
//                 </Form.Select>
//               </Form.Group>
//             </div>
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Birthday</Form.Label>
//                 <Form.Control
//                   type="date"
//                   name="birthday"
//                   value={formData.birthday || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//           </div>

//           <div className="row">
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>District</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="district"
//                   value={formData.district || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Height (cm)</Form.Label>
//                 <Form.Control
//                   type="number"
//                   name="height"
//                   value={formData.height || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//           </div>
//         </div>

//         <div className="mb-4">
//           <h4>Personal Details</h4>
//           <Form.Group className="mb-3">
//             <Form.Label>About Me</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="aboutMe"
//               value={formData.aboutMe || ''}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Family Details</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="familyDetails"
//               value={formData.familyDetails || ''}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Hobbies & Interests</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="hobbies"
//               value={formData.hobbies || ''}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Expectations</Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               name="expectations"
//               value={formData.expectations || ''}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </Form.Group>
//         </div>

//         <div className="mb-4">
//           <h4>Professional Details</h4>
//           <div className="row">
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Education</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="education"
//                   value={formData.education || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Occupation</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="occupation"
//                   value={formData.occupation || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//           </div>

//           <Form.Group className="mb-3">
//             <Form.Label>Annual Income</Form.Label>
//             <Form.Control
//               type="text"
//               name="annualIncome"
//               value={formData.annualIncome || ''}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </Form.Group>
//         </div>

//         <div className="mb-4">
//           <h4>Religious & Cultural Details</h4>
//           <div className="row">
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Religion</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="religion"
//                   value={formData.religion || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Caste</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="caste"
//                   value={formData.caste || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//           </div>

//           <div className="row">
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Marital Status</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="maritalStatus"
//                   value={formData.maritalStatus || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//             <div className="col-md-6">
//               <Form.Group className="mb-3">
//                 <Form.Label>Mother Tongue</Form.Label>
//                 <Form.Control
//                   type="text"
//                   name="motherTongue"
//                   value={formData.motherTongue || ''}
//                   onChange={handleChange}
//                   disabled={!isEditing}
//                 />
//               </Form.Group>
//             </div>
//           </div>
//         </div>

//         {isOwnProfile && (
//           <div className="form-actions">
//             {isEditing ? (
//               <>
//                 <Button variant="primary" type="submit" disabled={isSubmitting}>
//                   {isSubmitting ? <Spinner size="sm" /> : <><FaSave /> Save Changes</>}
//                 </Button>
//                 <Button
//                   variant="secondary"
//                   className="ms-2"
//                   onClick={() => setIsEditing(false)}
//                   disabled={isSubmitting}
//                 >
//                   <FaTimes /> Cancel
//                 </Button>
//               </>
//             ) : (
//               <Button variant="primary" onClick={() => setIsEditing(true)}>
//                 <FaEdit /> Edit Profile
//               </Button>
//             )}
//           </div>
//         )}
//       </Form>
//     </div>
//   );
// }
    // Client-



'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { FaTrash, FaUpload, FaLock, FaEdit, FaSave } from 'react-icons/fa';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

type Profile = {
  id?: number;
  userId?: number;
  sex?: 'Male' | 'Female' | 'Other' | null;
  birthday?: string | null;
  district?: string | null;
  familyDetails?: string | null;
  hobbies?: string | null; // Changed from string[] to string
  expectations?: string | null;
  education?: string | null;
  occupation?: string | null;
  religion?: string | null;
  caste?: string | null;
  height?: number | null;
  maritalStatus?: string | null;
  motherTongue?: string | null;
  annualIncome?: string | null;
  aboutMe?: string | null;
  photos?: {
    id: number;
    url: string;
    isMain: boolean;
    isApproved: boolean;
  }[];
};

export default function ProfileForm({ profile }: { profile?: Profile }) {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState(profile?.photos || []);
  const [formData, setFormData] = useState<Omit<Profile, 'photos'>>({
    familyDetails: profile?.familyDetails || '',
    hobbies: profile?.hobbies || '', // Changed from array to string
    expectations: profile?.expectations || '',
    education: profile?.education || '',
    occupation: profile?.occupation || '',
    religion: profile?.religion || '',
    caste: profile?.caste || '',
    height: profile?.height || null,
    maritalStatus: profile?.maritalStatus || '',
    motherTongue: profile?.motherTongue || '',
    annualIncome: profile?.annualIncome || '',
    aboutMe: profile?.aboutMe || '',
    sex: profile?.sex || null,
    birthday: profile?.birthday || '',
    district: profile?.district || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      toast.error('No files selected');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name}: Only image files allowed`);
          return false;
        }
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name}: File must be <5MB`);
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) {
        toast.error('No valid files to upload');
        return;
      }

      validFiles.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/profile/photos/upload', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMessage = 'Failed to upload photos';
        
        // Handle different error response formats
        if (Array.isArray(responseData?.details)) {
          errorMessage = responseData.details.join('\n');
        } else if (typeof responseData?.details === 'string') {
          errorMessage = responseData.details;
        } else if (responseData?.error) {
          errorMessage = responseData.error;
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        }

        throw new Error(errorMessage);
      }

      if (!responseData.photos) {
        throw new Error('Invalid response from server');
      }

      setPhotos(prev => [...prev, ...responseData.photos]);
      toast.success('Photos uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      const displayError = error.message || 'Failed to upload photos';
      setError(displayError);
      toast.error(displayError);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetMainPhoto = async (photoId: number) => {
    try {
      const response = await fetch('/api/profile/photos/main', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to set main photo');
      }

      const updatedPhotos = photos.map(photo => ({
        ...photo,
        isMain: photo.id === photoId,
      }));
      setPhotos(updatedPhotos);
      toast.success('Main photo updated');
    } catch (error: any) {
      console.error('Error setting main photo:', error);
      toast.error(error.message || 'Failed to set main photo');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;
    
    try {
      const response = await fetch(`/api/profile/photos/${photoId}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData?.error || 'Failed to delete photo');
      }

      setPhotos(photos.filter(photo => photo.id !== photoId));
      toast.success('Photo deleted');
    } catch (error: any) {
      console.error('Error deleting photo:', error);
      toast.error(error.message || 'Failed to delete photo');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Client-side validation
    if (!formData.sex || !formData.birthday || !formData.district) {
      setError('Please fill in all required fields (Sex, Birthday, District)');
      setIsSubmitting(false);
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      console.log('Submitting form data:', formData); // Debug log

      const response = await fetch('/api/profile', {
        method: profile?.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          height: formData.height ? Number(formData.height) : null,
        }),
      });

      const responseData = await response.json();
      console.log('Server response:', responseData); // Debug log

      if (!response.ok) {
        throw new Error(responseData?.error || responseData?.details || 'Failed to save profile');
      }

      toast.success('Profile saved successfully');
      window.location.reload();
    } catch (error: any) {
      console.error('Save error:', error);
      const errorMessage = error.message || 'Failed to save profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value // Removed the hobbies array conversion
    }));
  };

  const calculateAge = (birthday: string | null | undefined) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <form onSubmit={handleSubmit} className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h4 className="mb-0">Edit Profile</h4>
      </div>
      
      <div className="card-body">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="row g-3">
          {/* Basic Information Section */}
          <div className="col-12">
            <h5 className="text-primary border-bottom pb-2">Basic Information</h5>
          </div>

          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Sex*</Form.Label>
              <Form.Select
                name="sex"
                value={formData.sex || ''}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Birthday*</Form.Label>
              <Form.Control
                type="date"
                name="birthday"
                value={formData.birthday || ''}
                onChange={handleInputChange}
                max={new Date().toISOString().split('T')[0]}
                required
              />
              {formData.birthday && (
                <Form.Text className="text-muted">
                  Age: {calculateAge(formData.birthday)} years
                </Form.Text>
              )}
            </Form.Group>
          </div>

          <div className="col-12">
            <Form.Group>
              <Form.Label>District*</Form.Label>
              <Form.Control
                type="text"
                name="district"
                value={formData.district || ''}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </div>

          {/* Personal Details Section */}
          <div className="col-12 mt-4">
            <h5 className="text-primary border-bottom pb-2">Personal Details</h5>
          </div>

          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Height (cm)</Form.Label>
              <Form.Control
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={handleInputChange}
                min="100"
                max="250"
                step="0.1"
              />
            </Form.Group>
          </div>

          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Marital Status</Form.Label>
              <Form.Select
                name="maritalStatus"
                value={formData.maritalStatus || ''}
                onChange={handleInputChange}
              >
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Separated">Separated</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Education</Form.Label>
              <Form.Control
                type="text"
                name="education"
                value={formData.education || ''}
                onChange={handleInputChange}
                placeholder="Highest education level"
              />
            </Form.Group>
          </div>

          <div className="col-md-6">
            <Form.Group>
              <Form.Label>Occupation</Form.Label>
              <Form.Control
                type="text"
                name="occupation"
                value={formData.occupation || ''}
                onChange={handleInputChange}
                placeholder="Current profession"
              />
            </Form.Group>
          </div>

          <div className="col-12">
            <Form.Group>
              <Form.Label>About Me</Form.Label>
              <Form.Control
                as="textarea"
                name="aboutMe"
                value={formData.aboutMe || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe yourself..."
              />
            </Form.Group>
          </div>

          <div className="col-12">
            <Form.Group>
              <Form.Label>Hobbies & Interests</Form.Label>
              <Form.Control
                as="textarea"
                name="hobbies"
                value={formData.hobbies || ''} // Removed the join() call
                onChange={handleInputChange}
                rows={2}
                placeholder="Reading, Traveling, Sports (comma separated)"
              />
            </Form.Group>
          </div>

          {/* Photo Upload Section */}
          <div className="col-12 mt-3">
            <h5 className="text-primary border-bottom pb-2">Profile Photos</h5>
            <div className="mb-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                multiple
                accept="image/*"
                className="d-none"
                disabled={uploading}
              />
              <Button
                variant="outline-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <FaUpload className="me-2" />
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </Button>
              <Form.Text className="d-block mt-1 text-muted">
                JPEG, PNG under 5MB. First photo becomes main profile picture.
              </Form.Text>
            </div>

            <div className="d-flex flex-wrap gap-3">
              {photos.length === 0 ? (
                <div className="text-muted">No photos uploaded yet</div>
              ) : (
                photos.map(photo => (
                  <div key={photo.id} className="position-relative" style={{ width: '150px', height: '150px' }}>
                    <Image
                      src={photo.url}
                      alt="Profile photo"
                      fill
                      className="rounded object-cover border"
                      style={{ borderColor: photo.isMain ? 'var(--bs-primary)' : '#dee2e6' }}
                    />
                    <div className="position-absolute top-0 end-0 p-1">
                      <Button
                        variant={photo.isMain ? 'primary' : 'secondary'}
                        size="sm"
                        className="rounded-circle p-1"
                        onClick={() => handleSetMainPhoto(photo.id)}
                        title={photo.isMain ? 'Main photo' : 'Set as main'}
                      >
                        {photo.isMain ? '★' : '☆'}
                      </Button>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute bottom-0 end-0 m-1 rounded-circle p-1"
                      onClick={() => handleDeletePhoto(photo.id)}
                      title="Delete photo"
                    >
                      <FaTrash size={12} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="col-12 mt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

// 'use client';

// import { useState, useRef, ChangeEvent } from 'react';
// import { useSession } from 'next-auth/react';
// import Image from 'next/image';
// import { FaTrash, FaUpload, FaLock, FaEdit, FaSave } from 'react-icons/fa';
// import { Button, Form, Alert, Spinner } from 'react-bootstrap';
// import { toast } from 'react-hot-toast';

// type Profile = {
//   id?: number;
//   userId?: number;
//   sex?: 'Male' | 'Female' | 'Other' | null;
//   birthday?: string | null;
//   district?: string | null;
//   familyDetails?: string | null;
//   hobbies?: string[] | null;
//   expectations?: string | null;
//   education?: string | null;
//   occupation?: string | null;
//   religion?: string | null;
//   caste?: string | null;
//   height?: number | null;
//   maritalStatus?: string | null;
//   motherTongue?: string | null;
//   annualIncome?: string | null;
//   aboutMe?: string | null;
//   photos?: {
//     id: number;
//     url: string;
//     isMain: boolean;
//     isApproved: boolean;
//   }[];
// };

// export default function ProfileForm({ profile }: { profile?: Profile }) {
//   const { data: session } = useSession();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);
//   const [photos, setPhotos] = useState(profile?.photos || []);
//   const [formData, setFormData] = useState<Omit<Profile, 'photos'>>({
//     familyDetails: profile?.familyDetails || '',
//     hobbies: profile?.hobbies || [],
//     expectations: profile?.expectations || '',
//     education: profile?.education || '',
//     occupation: profile?.occupation || '',
//     religion: profile?.religion || '',
//     caste: profile?.caste || '',
//     height: profile?.height || null,
//     maritalStatus: profile?.maritalStatus || '',
//     motherTongue: profile?.motherTongue || '',
//     annualIncome: profile?.annualIncome || '',
//     aboutMe: profile?.aboutMe || '',
//     sex: profile?.sex || null,
//     birthday: profile?.birthday || '',
//     district: profile?.district || '',
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');

//   const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) {
//       toast.error('No files selected');
//       return;
//     }

//     setUploading(true);
//     setError('');
    
//     try {
//       const formData = new FormData();
//       const validFiles = Array.from(files).filter(file => {
//         if (!file.type.startsWith('image/')) {
//           toast.error(`${file.name}: Only image files allowed`);
//           return false;
//         }
//         if (file.size > 5 * 1024 * 1024) {
//           toast.error(`${file.name}: File must be <5MB`);
//           return false;
//         }
//         return true;
//       });

//       if (validFiles.length === 0) {
//         toast.error('No valid files to upload');
//         return;
//       }

//       validFiles.forEach(file => {
//         formData.append('files', file);
//       });

//       const response = await fetch('/api/profile/photos/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       const responseData = await response.json().catch(() => ({}));

//       if (!response.ok) {
//         let errorMessage = 'Failed to upload photos';
        
//         // Handle different error response formats
//         if (Array.isArray(responseData?.details)) {
//           errorMessage = responseData.details.join('\n');
//         } else if (typeof responseData?.details === 'string') {
//           errorMessage = responseData.details;
//         } else if (responseData?.error) {
//           errorMessage = responseData.error;
//         } else if (responseData?.message) {
//           errorMessage = responseData.message;
//         }

//         throw new Error(errorMessage);
//       }

//       if (!responseData.photos) {
//         throw new Error('Invalid response from server');
//       }

//       setPhotos(prev => [...prev, ...responseData.photos]);
//       toast.success('Photos uploaded successfully');
//     } catch (error: any) {
//       console.error('Upload error:', error);
//       const displayError = error.message || 'Failed to upload photos';
//       setError(displayError);
//       toast.error(displayError);
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const handleSetMainPhoto = async (photoId: number) => {
//     try {
//       const response = await fetch('/api/profile/photos/main', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ photoId }),
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData?.error || 'Failed to set main photo');
//       }

//       const updatedPhotos = photos.map(photo => ({
//         ...photo,
//         isMain: photo.id === photoId,
//       }));
//       setPhotos(updatedPhotos);
//       toast.success('Main photo updated');
//     } catch (error: any) {
//       console.error('Error setting main photo:', error);
//       toast.error(error.message || 'Failed to set main photo');
//     }
//   };

//   const handleDeletePhoto = async (photoId: number) => {
//     if (!confirm('Are you sure you want to delete this photo?')) return;
    
//     try {
//       const response = await fetch(`/api/profile/photos/${photoId}`, {
//         method: 'DELETE',
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData?.error || 'Failed to delete photo');
//       }

//       setPhotos(photos.filter(photo => photo.id !== photoId));
//       toast.success('Photo deleted');
//     } catch (error: any) {
//       console.error('Error deleting photo:', error);
//       toast.error(error.message || 'Failed to delete photo');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError('');

//     try {
//       const response = await fetch('/api/profile', {
//         method: profile?.id ? 'PUT' : 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           height: formData.height ? Number(formData.height) : null,
//         }),
//       });

//       const responseData = await response.json();

//       if (!response.ok) {
//         throw new Error(responseData?.error || 'Failed to save profile');
//       }

//       toast.success('Profile saved successfully');
//       window.location.reload();
//     } catch (error: any) {
//       console.error('Save error:', error);
//       setError(error.message);
//       toast.error(error.message || 'Failed to save profile');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'hobbies' ? value.split(',').map(h => h.trim()) : value
//     }));
//   };

//   const calculateAge = (birthday: string | null | undefined) => {
//     if (!birthday) return '';
//     const birthDate = new Date(birthday);
//     const diff = Date.now() - birthDate.getTime();
//     const ageDate = new Date(diff);
//     return Math.abs(ageDate.getUTCFullYear() - 1970);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="card shadow-sm">
//       <div className="card-header bg-primary text-white">
//         <h4 className="mb-0">Edit Profile</h4>
//       </div>
      
//       <div className="card-body">
//         {error && <Alert variant="danger">{error}</Alert>}

//         <div className="row g-3">
//           {/* Basic Information Section */}
//           <div className="col-12">
//             <h5 className="text-primary border-bottom pb-2">Basic Information</h5>
//           </div>

//           <div className="col-md-6">
//             <Form.Group>
//               <Form.Label>Sex*</Form.Label>
//               <Form.Select
//                 name="sex"
//                 value={formData.sex || ''}
//                 onChange={handleInputChange}
//                 required
//               >
//                 <option value="">Select Gender</option>
//                 <option value="Male">Male</option>
//                 <option value="Female">Female</option>
//                 <option value="Other">Other</option>
//               </Form.Select>
//             </Form.Group>
//           </div>

//           <div className="col-md-6">
//             <Form.Group>
//               <Form.Label>Birthday*</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="birthday"
//                 value={formData.birthday || ''}
//                 onChange={handleInputChange}
//                 max={new Date().toISOString().split('T')[0]}
//                 required
//               />
//               {formData.birthday && (
//                 <Form.Text className="text-muted">
//                   Age: {calculateAge(formData.birthday)} years
//                 </Form.Text>
//               )}
//             </Form.Group>
//           </div>

//           <div className="col-12">
//             <Form.Group>
//               <Form.Label>District*</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="district"
//                 value={formData.district || ''}
//                 onChange={handleInputChange}
//                 required
//               />
//             </Form.Group>
//           </div>

//           {/* Personal Details Section */}
//           <div className="col-12 mt-4">
//             <h5 className="text-primary border-bottom pb-2">Personal Details</h5>
//           </div>

//           <div className="col-md-6">
//             <Form.Group>
//               <Form.Label>Height (cm)</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="height"
//                 value={formData.height || ''}
//                 onChange={handleInputChange}
//                 min="100"
//                 max="250"
//                 step="0.1"
//               />
//             </Form.Group>
//           </div>

//           <div className="col-md-6">
//             <Form.Group>
//               <Form.Label>Marital Status</Form.Label>
//               <Form.Select
//                 name="maritalStatus"
//                 value={formData.maritalStatus || ''}
//                 onChange={handleInputChange}
//               >
//                 <option value="">Select Status</option>
//                 <option value="Single">Single</option>
//                 <option value="Separated">Separated</option>
//                 <option value="Divorced">Divorced</option>
//                 <option value="Widowed">Widowed</option>
//               </Form.Select>
//             </Form.Group>
//           </div>

//           <div className="col-md-6">
//             <Form.Group>
//               <Form.Label>Education</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="education"
//                 value={formData.education || ''}
//                 onChange={handleInputChange}
//                 placeholder="Highest education level"
//               />
//             </Form.Group>
//           </div>

//           <div className="col-md-6">
//             <Form.Group>
//               <Form.Label>Occupation</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="occupation"
//                 value={formData.occupation || ''}
//                 onChange={handleInputChange}
//                 placeholder="Current profession"
//               />
//             </Form.Group>
//           </div>

//           <div className="col-12">
//             <Form.Group>
//               <Form.Label>About Me</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="aboutMe"
//                 value={formData.aboutMe || ''}
//                 onChange={handleInputChange}
//                 rows={4}
//                 placeholder="Describe yourself..."
//               />
//             </Form.Group>
//           </div>

//           <div className="col-12">
//             <Form.Group>
//               <Form.Label>Hobbies & Interests</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="hobbies"
//                 value={formData.hobbies?.join(', ') || ''}
//                 onChange={handleInputChange}
//                 rows={2}
//                 placeholder="Reading, Traveling, Sports (comma separated)"
//               />
//             </Form.Group>
//           </div>

//           {/* Photo Upload Section */}
//           <div className="col-12 mt-3">
//             <h5 className="text-primary border-bottom pb-2">Profile Photos</h5>
//             <div className="mb-3">
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handlePhotoUpload}
//                 multiple
//                 accept="image/*"
//                 className="d-none"
//                 disabled={uploading}
//               />
//               <Button
//                 variant="outline-primary"
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={uploading}
//               >
//                 <FaUpload className="me-2" />
//                 {uploading ? 'Uploading...' : 'Upload Photos'}
//               </Button>
//               <Form.Text className="d-block mt-1 text-muted">
//                 JPEG, PNG under 5MB. First photo becomes main profile picture.
//               </Form.Text>
//             </div>

//             <div className="d-flex flex-wrap gap-3">
//               {photos.length === 0 ? (
//                 <div className="text-muted">No photos uploaded yet</div>
//               ) : (
//                 photos.map(photo => (
//                   <div key={photo.id} className="position-relative" style={{ width: '150px', height: '150px' }}>
//                     <Image
//                       src={photo.url}
//                       alt="Profile photo"
//                       fill
//                       className="rounded object-cover border"
//                       style={{ borderColor: photo.isMain ? 'var(--bs-primary)' : '#dee2e6' }}
//                     />
//                     <div className="position-absolute top-0 end-0 p-1">
//                       <Button
//                         variant={photo.isMain ? 'primary' : 'secondary'}
//                         size="sm"
//                         className="rounded-circle p-1"
//                         onClick={() => handleSetMainPhoto(photo.id)}
//                         title={photo.isMain ? 'Main photo' : 'Set as main'}
//                       >
//                         {photo.isMain ? '★' : '☆'}
//                       </Button>
//                     </div>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       className="position-absolute bottom-0 end-0 m-1 rounded-circle p-1"
//                       onClick={() => handleDeletePhoto(photo.id)}
//                       title="Delete photo"
//                     >
//                       <FaTrash size={12} />
//                     </Button>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           <div className="col-12 mt-4">
//             <Button
//               type="submit"
//               variant="primary"
//               size="lg"
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Saving...
//                 </>
//               ) : (
//                 <>
//                   <FaSave className="me-2" />
//                   Save Profile
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </form>
//   );
// }



// // components/ProfileForm.tsx
// 'use client'

// import { useState, useRef, ChangeEvent } from 'react';
// import { useSession } from 'next-auth/react';
// import Image from 'next/image';
// import { FaTrash, FaUpload, FaLock } from 'react-icons/fa';
// import { Button } from 'react-bootstrap';

// type Profile = {
//   id?: number;
//   userId?: number;
//   education?: string | null;
//   occupation?: string | null;
//   religion?: string | null;
//   caste?: string | null;
//   height?: number | null;
//   maritalStatus?: string | null;
//   motherTongue?: string | null;
//   annualIncome?: string | null;
//   aboutMe?: string | null;
//   familyDetails?: string | null;
//   hobbies?: string[] | null;
//   expectations?: string | null;
//   sex?: 'Male' | 'Female' | 'Other' | null;
//   birthday?: string | null;
//   district?: string | null;
//   photos?: {
//     id: number;
//     url: string;
//     isMain: boolean;
//     isApproved: boolean;
//   }[];
// };

// export default function ProfileForm({ profile }: { profile?: Profile }) {
//   const { data: session } = useSession();
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [uploading, setUploading] = useState(false);
//   const [photos, setPhotos] = useState(profile?.photos || []);
//   const [formData, setFormData] = useState<Omit<Profile, 'photos'>>({
//     familyDetails: profile?.familyDetails || '',
//     hobbies: profile?.hobbies || [],
//     expectations: profile?.expectations || '',
//     education: profile?.education || '',
//     occupation: profile?.occupation || '',
//     religion: profile?.religion || '',
//     caste: profile?.caste || '',
//     height: profile?.height || null,
//     maritalStatus: profile?.maritalStatus || '',
//     motherTongue: profile?.motherTongue || '',
//     annualIncome: profile?.annualIncome || '',
//     aboutMe: profile?.aboutMe || '',
//     sex: profile?.sex || null,
//     birthday: profile?.birthday || '',
//     district: profile?.district || '',
//   });

  
//   const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) {
//       toast.error('No files selected');
//       return;
//     }

//     setUploading(true);
    
//     try {
//       const formData = new FormData();
//       for (let i = 0; i < files.length; i++) {
//         // Validate file type and size
//         if (!files[i].type.startsWith('image/')) {
//           toast.error('Only image files are allowed');
//           continue;
//         }
//         if (files[i].size > 5 * 1024 * 1024) { // 5MB limit
//           toast.error('File size must be less than 5MB');
//           continue;
//         }
//         formData.append('files', files[i]);
//       }

//       // Check if any valid files were added
//       if (formData.getAll('files').length === 0) {
//         toast.error('No valid files to upload');
//         return;
//       }

//       const response = await fetch('/api/profile/photos', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.error || 'Failed to upload photos');
//       }

//       const result = await response.json();
//       setPhotos([...photos, ...result.photos]);
//       toast.success('Photos uploaded successfully');
//     } catch (error: any) {
//       console.error('Upload error:', error);
//       toast.error(error.message || 'Failed to upload photos');
//     } finally {
//       setUploading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const handleSetMainPhoto = async (photoId: number) => {
//     try {
//       const response = await fetch('/api/profile/photos/main', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ photoId }),
//       });

//       if (!response.ok) {
//         throw new Error('Failed to set main photo');
//       }

//       const updatedPhotos = photos.map(photo => ({
//         ...photo,
//         isMain: photo.id === photoId,
//       }));
//       setPhotos(updatedPhotos);
//     } catch (error) {
//       console.error('Error setting main photo:', error);
//     }
//   };

//   const handleDeletePhoto = async (photoId: number) => {
//     try {
//       const response = await fetch(`/api/profile/photos/${photoId}`, {
//         method: 'DELETE',
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete photo');
//       }

//       setPhotos(photos.filter(photo => photo.id !== photoId));
//     } catch (error) {
//       console.error('Error deleting photo:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('/api/profile', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           height: formData.height ? Number(formData.height) : null,
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to save profile');
//       }
      
//       const result = await response.json();
//       alert('Profile updated successfully!');
//       window.location.reload();
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Failed to update profile. Please try again.');
//     }
//   };

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'hobbies' ? value.split(',').map(h => h.trim()) : value
//     }));
//   };

//   const calculateAge = (birthday: string | null | undefined) => {
//     if (!birthday) return '';
//     const birthDate = new Date(birthday);
//     const diff = Date.now() - birthDate.getTime();
//     const ageDate = new Date(diff);
//     return Math.abs(ageDate.getUTCFullYear() - 1970);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="card shadow-sm">
//       <div className="card-header bg-primary text-white">
//         <h4 className="mb-0">Edit Profile</h4>
//       </div>
//       <div className="card-body">
//         <div className="row g-3">
//           {/* Basic Information Section */}
//           <div className="col-12">
//             <h5 className="text-primary border-bottom pb-2">Basic Information</h5>
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Sex*</label>
//             <select
//               name="sex"
//               value={formData.sex || ''}
//               onChange={handleInputChange}
//               className="form-select"
//               required
//             >
//               <option value="">Select Gender</option>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Birthday*</label>
//             <input
//               type="date"
//               name="birthday"
//               value={formData.birthday || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               max={new Date().toISOString().split('T')[0]}
//               required
//             />
//             {formData.birthday && (
//               <small className="form-text text-muted">
//                 Age: {calculateAge(formData.birthday)} years
//               </small>
//             )}
//           </div>

//           <div className="col-12">
//             <label className="form-label">District*</label>
//             <input
//               type="text"
//               name="district"
//               value={formData.district || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               required
//             />
//           </div>

//           {/* Personal Details Section */}
//           <div className="col-12 mt-4">
//             <h5 className="text-primary border-bottom pb-2">Personal Details</h5>
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Height (cm)</label>
//             <input
//               type="number"
//               name="height"
//               value={formData.height || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               step="0.1"
//               min="0"
//             />
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Marital Status</label>
//             <select
//               name="maritalStatus"
//               value={formData.maritalStatus || ''}
//               onChange={handleInputChange}
//               className="form-select"
//             >
//               <option value="">Select Status</option>
//               <option value="Single">Single</option>
//               <option value="Separated">Separated</option>
//               <option value="Divorced">Divorced</option>
//               <option value="Widowed">Widowed</option>
//             </select>
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Education</label>
//             <input
//               type="text"
//               name="education"
//               value={formData.education || ''}
//               onChange={handleInputChange}
//               className="form-control"
//             />
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Occupation</label>
//             <input
//               type="text"
//               name="occupation"
//               value={formData.occupation || ''}
//               onChange={handleInputChange}
//               className="form-control"
//             />
//           </div>

//           <div className="col-12">
//             <label className="form-label">About Me</label>
//             <textarea
//               name="aboutMe"
//               value={formData.aboutMe || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               rows={3}
//             />
//           </div>

//           <div className="col-12">
//             <label className="form-label">Hobbies</label>
//             <textarea
//               name="hobbies"
//               value={formData.hobbies?.join(', ') || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               rows={2}
//               placeholder="Reading, Traveling, Sports"
//             />
//           </div>

//           {/* Photo Upload Section */}
//           <div className="col-12 mt-3">
//             <h5 className="text-primary border-bottom pb-2">Photos</h5>
//             <div className="mb-3">
//               <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handlePhotoUpload}
//                 multiple
//                 accept="image/*"
//                 className="d-none"
//                 disabled={uploading}
//               />
//               <Button
//                 variant="outline-primary"
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={uploading}
//               >
//                 <FaUpload className="me-2" />
//                 {uploading ? 'Uploading...' : 'Upload Photos'}
//               </Button>
//               <small className="text-muted d-block mt-1">
//                 Upload clear photos of yourself. First photo will be used as main profile picture.
//               </small>
//             </div>

//             <div className="d-flex flex-wrap gap-3">
//               {photos.map(photo => (
//                 <div key={photo.id} className="position-relative" style={{ width: '150px', height: '150px' }}>
//                   <Image
//                     src={photo.url}
//                     alt="Profile photo"
//                     fill
//                     className="rounded object-cover"
//                     style={{ border: photo.isMain ? '3px solid var(--bs-primary)' : '1px solid #dee2e6' }}
//                   />
//                   <div className="position-absolute top-0 end-0 p-1">
//                     <Button
//                       variant={photo.isMain ? 'primary' : 'secondary'}
//                       size="sm"
//                       className="rounded-circle p-1"
//                       onClick={() => handleSetMainPhoto(photo.id)}
//                       title={photo.isMain ? 'Main photo' : 'Set as main'}
//                     >
//                       {photo.isMain ? '★' : '☆'}
//                     </Button>
//                   </div>
//                   <Button
//                     variant="danger"
//                     size="sm"
//                     className="position-absolute bottom-0 end-0 m-1 rounded-circle p-1"
//                     onClick={() => handleDeletePhoto(photo.id)}
//                     title="Delete photo"
//                   >
//                     <FaTrash size={12} />
//                   </Button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="col-12 mt-4">
//             <button
//               type="submit"
//               className="btn btn-primary px-4 py-2"
//             >
//               Save Profile
//             </button>
//           </div>
//         </div>
//       </div>
//     </form>
//   );
// }



// // components/ProfileForm.tsx
// 'use client'

// import { useState } from 'react';
// import { useSession } from 'next-auth/react';

// type Profile = {
//   education?: string|null;
//   occupation?: string|null;
//   religion?: string|null;
//   caste?: string|null;
//   height?: number|undefined;
//   maritalStatus?: string|undefined;
//   motherTongue?: string|null;
//   annualIncome?: string|null;
//   aboutMe?: string|null;
//   familyDetails?: string|null;
//   hobbies?: string|null;
//   expectations?: string|null;
//   sex?: 'Male' | 'Female' | 'Other'|undefined;
//   birthday?: string|undefined;
//   district?: string|undefined;
// };

// export default function ProfileForm({ profile }: { profile?: Profile }) {
//   const { data: session } = useSession();
//   const [formData, setFormData] = useState<Profile>({
//     familyDetails: profile?.familyDetails || '',
//     hobbies: profile?.hobbies || '',
//     expectations: profile?.expectations || '',
//     education: profile?.education || '',
//     occupation: profile?.occupation || '',
//     religion: profile?.religion || '',
//     caste: profile?.caste || '',
//     height: profile?.height || undefined,
//     maritalStatus: profile?.maritalStatus || '',
//     motherTongue: profile?.motherTongue || '',
//     annualIncome: profile?.annualIncome || '',
//     aboutMe: profile?.aboutMe || '',
//     sex: profile?.sex || undefined,
//     birthday: profile?.birthday || '',
//     district: profile?.district || '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('/api/profile', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           height: formData.height ? Number(formData.height) : null,
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to save profile');
//       }
      
//       const result = await response.json();
//       alert('Profile updated successfully!');
//       window.location.reload(); // Refresh to show updated info
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Failed to update profile. Please try again.');
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const calculateAge = (birthday: string) => {
//     if (!birthday) return '';
//     const birthDate = new Date(birthday);
//     const diff = Date.now() - birthDate.getTime();
//     const ageDate = new Date(diff);
//     return Math.abs(ageDate.getUTCFullYear() - 1970);
//   };

//   // components/ProfileForm.tsx
// const submitProfile = (data) => {
//   if (existingProfile) {
//     useProfileStore.getState().updateProfile(existingProfile.id, data)
//   } else {
//     useProfileStore.getState().addProfile(data)
//   }
// }

//   return (
//     <form onSubmit={handleSubmit} className="card shadow-sm">
//       <div className="card-header bg-primary text-white">
//         <h4 className="mb-0">Edit Profile</h4>
//       </div>
//       <div className="card-body">
//         <div className="row g-3">
//           {/* Basic Information Section */}
//           <div className="col-12">
//             <h5 className="text-primary border-bottom pb-2">Basic Information</h5>
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Sex*</label>
//             <select
//               name="sex"
//               value={formData.sex || ''}
//               onChange={handleInputChange}
//               className="form-select"
//               required
//             >
//               <option value="">Select Gender</option>
//               <option value="Male">Male</option>
//               <option value="Female">Female</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Birthday*</label>
//             <input
//               type="date"
//               name="birthday"
//               value={formData.birthday || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               max={new Date().toISOString().split('T')[0]}
//               required
//             />
//             {formData.birthday && (
//               <small className="form-text text-muted">
//                 Age: {calculateAge(formData.birthday)} years
//               </small>
//             )}
//           </div>

//           <div className="col-12">
//             <label className="form-label">District*</label>
//             <input
//               type="text"
//               name="district"
//               value={formData.district || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               required
//             />
//           </div>

//           {/* Personal Details Section */}
//           <div className="col-12 mt-4">
//             <h5 className="text-primary border-bottom pb-2">Personal Details</h5>
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Height (cm)</label>
//             <input
//               type="number"
//               name="height"
//               value={formData.height || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               step="0.1"
//               min="0"
//             />
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Marital Status</label>
//             <select
//               name="maritalStatus"
//               value={formData.maritalStatus || ''}
//               onChange={handleInputChange}
//               className="form-select"
//             >
//               <option value="">Select Status</option>
//               <option value="Single">Single</option>
//               <option value="Seperated">Seperated</option>
//               <option value="Divorced">Divorced</option>
//               <option value="Widowed">Widowed</option>
//             </select>
//           </div>

//           {/* Add more fields here following the same pattern */}
//           <div className="col-md-6">
//             <label className="form-label">Education</label>
//             <input
//               type="text"
//               name="education"
//               value={formData.education || ''}
//               onChange={handleInputChange}
//               className="form-control"
//             />
//           </div>

//           <div className="col-md-6">
//             <label className="form-label">Occupation</label>
//             <input
//               type="text"
//               name="occupation"
//               value={formData.occupation || ''}
//               onChange={handleInputChange}
//               className="form-control"
//             />
//           </div>

//           <div className="col-12">
//             <label className="form-label">About Me</label>
//             <textarea
//               name="aboutMe"
//               value={formData.aboutMe || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               rows={3}
//             />
//           </div>

//           <div className="col-12">
//             <label className="form-label">Hobbies</label>
//             <textarea
//               name="hobbies"
//               value={formData.hobbies || ''}
//               onChange={handleInputChange}
//               className="form-control"
//               rows={2}
//             />
//           </div>

//           <div className="col-12 mt-4">
//             <button
//               type="submit"
//               className="btn btn-primary px-4 py-2"
//             >
//               Save Profile
//             </button>
//           </div>
//         </div>
//       </div>
//     </form>
//   );
// }

// // components/ProfileForm.tsx
// 'use client'

// import { useState } from 'react';
// import { useSession } from 'next-auth/react';

// type Profile = {
//   education?: string;
//   occupation?: string;
//   religion?: string;
//   caste?: string;
//   height?: number;
//   maritalStatus?: string;
//   motherTongue?: string;
//   annualIncome?: string;
//   aboutMe?: string;
//   familyDetails?: string;
//   hobbies?: string;
//   expectations?: string;
//   sex?: 'Male' | 'Female' | 'Other';
//   birthday?: string;
//   district?: string;
// };

// export default function ProfileForm({ profile }: { profile?: Profile }) {
//   const { data: session } = useSession();
//   const [formData, setFormData] = useState<Profile>({
//     familyDetails: profile?.familyDetails || '',
//     hobbies: profile?.hobbies || '',
//     expectations: profile?.expectations || '',
//     education: profile?.education || '',
//     occupation: profile?.occupation || '',
//     religion: profile?.religion || '',
//     caste: profile?.caste || '',
//     height: profile?.height || undefined,
//     maritalStatus: profile?.maritalStatus || '',
//     motherTongue: profile?.motherTongue || '',
//     annualIncome: profile?.annualIncome || '',
//     aboutMe: profile?.aboutMe || '',
//     sex: profile?.sex || undefined,
//     birthday: profile?.birthday || '',
//     district: profile?.district || '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('/api/profile', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...formData,
//           height: formData.height ? Number(formData.height) : null,
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to save profile');
//       }
      
//       const result = await response.json();
//       alert('Profile updated successfully!');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Failed to update profile. Please try again.');
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Calculate age from birthday
//   const calculateAge = (birthday: string) => {
//     if (!birthday) return '';
//     const birthDate = new Date(birthday);
//     const diff = Date.now() - birthDate.getTime();
//     const ageDate = new Date(diff);
//     return Math.abs(ageDate.getUTCFullYear() - 1970);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Basic Information Section */}
//         <div className="col-span-2">
//           <h3 className="text-xl font-semibold border-b pb-2">Basic Information</h3>
//         </div>

//         <div>
//           <label className="block mb-2 text-sm font-medium text-gray-700">Sex*</label>
//           <select
//             name="sex"
//             value={formData.sex || ''}
//             onChange={handleInputChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             required
//           >
//             <option value="">Select Gender</option>
//             <option value="Male">Male</option>
//             <option value="Female">Female</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>

//         <div>
//           <label className="block mb-2 text-sm font-medium text-gray-700">Birthday*</label>
//           <input
//             type="date"
//             name="birthday"
//             value={formData.birthday || ''}
//             onChange={handleInputChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             max={new Date().toISOString().split('T')[0]}
//             required
//           />
//           {formData.birthday && (
//             <p className="mt-1 text-xs text-gray-500">
//               Age: {calculateAge(formData.birthday)} years
//             </p>
//           )}
//         </div>

//         <div className="col-span-2 md:col-span-1">
//           <label className="block mb-2 text-sm font-medium text-gray-700">District*</label>
//           <input
//             type="text"
//             name="district"
//             value={formData.district || ''}
//             onChange={handleInputChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             required
//           />
//         </div>

//         {/* Personal Details Section */}
//         <div className="col-span-2 mt-6">
//           <h3 className="text-xl font-semibold border-b pb-2">Personal Details</h3>
//         </div>

//         {/* Rest of your form fields... */}
//         <div>
//           <label className="block mb-2 text-sm font-medium text-gray-700">Height (cm)</label>
//           <input
//             type="number"
//             name="height"
//             value={formData.height || ''}
//             onChange={handleInputChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             step="0.1"
//             min="0"
//           />
//         </div>

//         <div>
//           <label className="block mb-2 text-sm font-medium text-gray-700">Marital Status</label>
//           <select
//             name="maritalStatus"
//             value={formData.maritalStatus || ''}
//             onChange={handleInputChange}
//             className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//           >
//             <option value="">Select Status</option>
//             <option value="Single">Single</option>
//             <option value="Married">Married</option>
//             <option value="Divorced">Divorced</option>
//             <option value="Widowed">Widowed</option>
//           </select>
//         </div>

//         {/* Include all other existing fields here... */}
//       </div>

//       <div className="mt-8">
//         <button
//           type="submit"
//           className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
//         >
//           Save Profile
//         </button>
//       </div>
//     </form>
//   );
// }


// // components/ProfileForm.tsx
// 'use client'

// import { useState } from 'react';
// import { useSession } from 'next-auth/react';

// type Profile = {
//   education?: string;
//   occupation?: string;
//   religion?: string;
//   caste?: string;
//   height?: number;
//   maritalStatus?: string;
//   motherTongue?: string;
//   annualIncome?: string;
//   aboutMe?: string;
//   familyDetails?: string;
//   hobbies?: string;
//   expectations?: string;
// };

// export default function ProfileForm({ profile }: { profile?: Profile }) {
//   const { data: session } = useSession();
//   const [formData, setFormData] = useState<Profile>({
//     familyDetails: profile?.familyDetails || '',
//     hobbies: profile?.hobbies || '',
//     expectations: profile?.expectations || '',
//     education: profile?.education || '',
//     occupation: profile?.occupation || '',
//     religion: profile?.religion || '',
//     caste: profile?.caste || '',
//     height: profile?.height || undefined,
//     maritalStatus: profile?.maritalStatus || '',
//     motherTongue: profile?.motherTongue || '',
//     annualIncome: profile?.annualIncome || '',
//     aboutMe: profile?.aboutMe || '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('/api/profile', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           familyDetails: formData.familyDetails,
//           hobbies: formData.hobbies,
//           expectations: formData.expectations,
//           education: formData.education,
//           occupation: formData.occupation,
//           religion: formData.religion,
//           caste: formData.caste,
//           height: formData.height ? Number(formData.height) : null,
//           maritalStatus: formData.maritalStatus,
//           motherTongue: formData.motherTongue,
//           annualIncome: formData.annualIncome,
//           aboutMe: formData.aboutMe
//         }),
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to save profile');
//       }
      
//       const result = await response.json();
//       console.log('Profile saved:', result);
//       alert('Profile updated successfully!');
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert('Failed to update profile. Please try again.');
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Personal Information */}
//         <div className="col-span-2">
//           <h3 className="text-lg font-medium mb-4">Personal Information</h3>
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Education</label>
//           <input
//             type="text"
//             name="education"
//             value={formData.education}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Occupation</label>
//           <input
//             type="text"
//             name="occupation"
//             value={formData.occupation}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Religion</label>
//           <input
//             type="text"
//             name="religion"
//             value={formData.religion}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Caste</label>
//           <input
//             type="text"
//             name="caste"
//             value={formData.caste}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Height (cm)</label>
//           <input
//             type="number"
//             name="height"
//             value={formData.height || ''}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//             step="0.1"
//           />
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Marital Status</label>
//           <select
//             name="maritalStatus"
//             value={formData.maritalStatus}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select</option>
//             <option value="Single">Single</option>
//             <option value="Divorced">Divorced</option>
//             <option value="Widowed">Widowed</option>
//           </select>
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Mother Tongue</label>
//           <input
//             type="text"
//             name="motherTongue"
//             value={formData.motherTongue}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div>
//           <label className="block mb-2 text-sm font-medium">Annual Income</label>
//           <input
//             type="text"
//             name="annualIncome"
//             value={formData.annualIncome}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
        
//         <div className="col-span-2">
//           <label className="block mb-2 text-sm font-medium">Family Details</label>
//           <textarea
//             name="familyDetails"
//             value={formData.familyDetails}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//             rows={3}
//           />
//         </div>
        
//         <div className="col-span-2">
//           <label className="block mb-2 text-sm font-medium">Hobbies</label>
//           <textarea
//             name="hobbies"
//             value={formData.hobbies}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//             rows={3}
//           />
//         </div>
        
//         <div className="col-span-2">
//           <label className="block mb-2 text-sm font-medium">Expectations</label>
//           <textarea
//             name="expectations"
//             value={formData.expectations}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//             rows={3}
//           />
//         </div>
        
//         <div className="col-span-2">
//           <label className="block mb-2 text-sm font-medium">About Me</label>
//           <textarea
//             name="aboutMe"
//             value={formData.aboutMe}
//             onChange={handleInputChange}
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//             rows={4}
//           />
//         </div>
//       </div>
      
//       <button
//         type="submit"
//         className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
//       >
//         Save Profile
//       </button>
//     </form>
//   );
// }