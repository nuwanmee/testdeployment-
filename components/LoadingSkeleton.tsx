// components/LoadingSkeleton.tsx
import React from 'react';

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
      ))}
    </div>
  );
}