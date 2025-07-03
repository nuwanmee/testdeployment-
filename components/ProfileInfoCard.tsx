// components/ProfileInfoCard.tsx
import React from 'react';

type Profile = {
  education?: string;
  occupation?: string;
  religion?: string;
  caste?: string;
  height?: number;
  maritalStatus?: string;
  motherTongue?: string;
  annualIncome?: string;
  aboutMe?: string;
  familyDetails?: string;
  hobbies?: string;
  expectations?: string;
  sex?: 'Male' | 'Female' | 'Other';
  birthday?: string;
  district?: string;
};

const ProfileInfoCard = ({ profile }: { profile?: Profile }) => {
  if (!profile) {
    return (
      <div className="card border-primary">
        <div className="card-body">
          <h5 className="card-title text-center">No Profile Information Yet</h5>
          <p className="card-text text-center">Fill out the form to create your profile</p>
        </div>
      </div>
    );
  }

  const calculateAge = (birthday: string) => {
    if (!birthday) return '';
    const birthDate = new Date(birthday);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h4 className="mb-0">Current Profile Information</h4>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <h5 className="text-primary">Basic Information</h5>
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span>Gender</span>
                <strong>{profile.sex || 'Not specified'}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span>Age</span>
                <strong>{profile.birthday ? calculateAge(profile.birthday) + ' years' : 'Not specified'}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span>District</span>
                <strong>{profile.district || 'Not specified'}</strong>
              </li>
            </ul>
          </div>
          
          <div className="col-md-6">
            <h5 className="text-primary">Personal Details</h5>
            <ul className="list-group list-group-flush mb-3">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span>Height</span>
                <strong>{profile.height ? `${profile.height} cm` : 'Not specified'}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span>Marital Status</span>
                <strong>{profile.maritalStatus || 'Not specified'}</strong>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span>Religion</span>
                <strong>{profile.religion || 'Not specified'}</strong>
              </li>
            </ul>
          </div>
        </div>
        
        {profile.aboutMe && (
          <div className="mt-3">
            <h5 className="text-primary">About Me</h5>
            <div className="p-3 bg-light rounded">
              <p className="mb-0">{profile.aboutMe}</p>
            </div>
          </div>
        )}
        
        {profile.hobbies && (
          <div className="mt-3">
            <h5 className="text-primary">Hobbies</h5>
            <div className="p-3 bg-light rounded">
              <p className="mb-0">{profile.hobbies}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileInfoCard;