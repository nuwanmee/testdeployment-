// components/FilterToggleButton.tsx
'use client';

import Button from 'react-bootstrap/Button';

export default function FilterToggleButton({ onClick }: { onClick: () => void }) {
  return (
    <Button 
      variant="outline-primary" 
      className="w-100 d-flex align-items-center justify-content-between d-lg-none mb-3"
      onClick={onClick}
    >
      <span>Filter Profiles</span>
      <i className="bi bi-funnel-fill ms-2"></i>
    </Button>
  );
}