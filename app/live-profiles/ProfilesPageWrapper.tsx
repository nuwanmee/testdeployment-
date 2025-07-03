// app/profiles/ProfilesPageWrapper.tsx
'use client';

import { useState } from 'react';
import ProfilesPage from './page';
import FilterToggleButton from '@/components/FilterToggleButton';
import { Offcanvas } from 'react-bootstrap';
import ProfileFilter from '@/components/ProfileFilter';

export default function ProfilesPageWrapper() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <FilterToggleButton onClick={() => setShowFilters(!showFilters)} />
      
      <Offcanvas 
        show={showFilters} 
        onHide={() => setShowFilters(false)}
        className="d-lg-none" 
        responsive="lg"
        style={{ width: '300px' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter Profiles</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ProfileFilter />
        </Offcanvas.Body>
      </Offcanvas>

      <ProfilesPage />
    </>
  );
}