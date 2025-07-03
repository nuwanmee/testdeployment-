// components/ProfileFilterToggle.tsx
'use client';

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import ProfileFilter from './ProfileFilter';

export default function ProfileFilterToggle() {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      {/* Mobile Filter Toggle Button */}
      <Button 
        variant="outline-primary" 
        className="w-100 d-flex align-items-center justify-content-between d-lg-none mb-3"
        onClick={() => setShowFilters(true)}
      >
        <span>Filter Profiles</span>
        <i className="bi bi-funnel-fill ms-2"></i>
      </Button>

      {/* Mobile Filter Offcanvas */}
      <Offcanvas 
        show={showFilters} 
        onHide={() => setShowFilters(false)}
        responsive="lg"
        placement="start"
        style={{ width: '300px' }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filter Profiles</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ProfileFilter />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}