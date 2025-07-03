'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface FilterBarProps {
  currentFilters: {
    gender?: string;
    minAge?: string;
    maxAge?: string;
    religion?: string;
    location?: string;
  };
}

export default function FilterBar({ currentFilters }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState({
    gender: currentFilters.gender || '',
    minAge: currentFilters.minAge || '',
    maxAge: currentFilters.maxAge || '',
    religion: currentFilters.religion || '',
    location: currentFilters.location || '',
  });
  
  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      gender: searchParams.get('gender') || '',
      minAge: searchParams.get('minAge') || '',
      maxAge: searchParams.get('maxAge') || '',
      religion: searchParams.get('religion') || '',
      location: searchParams.get('location') || '',
    });
  }, [searchParams]);
  
  // Apply filters
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    // Add each non-empty filter to the query params
    if (filters.gender) params.set('gender', filters.gender);
    if (filters.minAge) params.set('minAge', filters.minAge);
    if (filters.maxAge) params.set('maxAge', filters.maxAge);
    if (filters.religion) params.set('religion', filters.religion);
    if (filters.location) params.set('location', filters.location);
    
    // Reset to page 1 when applying new filters
    params.set('page', '1');
    
    // Navigate to the new URL with filters
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilters({
      gender: '',
      minAge: '',
      maxAge: '',
      religion: '',
      location: '',
    });
    router.push(pathname);
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Filter Profiles</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            value={filters.gender}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Age Range Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min Age</label>
          <input
            type="number"
            name="minAge"
            min="18"
            max="100"
            value={filters.minAge}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Min Age"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Age</label>
          <input
            type="number"
            name="maxAge"
            min="18"
            max="100"
            value={filters.maxAge}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Max Age"
          />
        </div>
        
        {/* Religion Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Religion</label>
          <select
            name="religion"
            value={filters.religion}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any</option>
            <option value="hindu">Hindu</option>
            <option value="muslim">Muslim</option>
            <option value="christian">Christian</option>
            <option value="sikh">Sikh</option>
            <option value="buddhist">Buddhist</option>
            <option value="jain">Jain</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={filters.location}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="City or Country"
          />
        </div>
      </div>
      
      {/* Filter Action Buttons */}
      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={clearFilters}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={applyFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}