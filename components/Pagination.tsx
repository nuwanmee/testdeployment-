// components/Pagination.tsx
'use client';

import { useState, useEffect } from 'react';

interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  maxPageButtons?: number;
}

export default function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  maxPageButtons = 5,
}: PaginationProps) {
  const [pages, setPages] = useState<(number | string)[]>([]);
  
  useEffect(() => {
    // Calculate total pages
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Generate array of page numbers to display
    let pageArray: (number | string)[] = [];
    
    if (totalPages <= maxPageButtons) {
      // Show all pages if there are fewer than maxPageButtons
      pageArray = Array.from({ length: totalPages }, (_, i) => i + 1);
    } else {
      // Always include first page
      pageArray.push(1);
      
      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxPageButtons - 3);
      
      // Adjust start if we're near the end
      if (endPage === totalPages - 1) {
        startPage = Math.max(2, endPage - maxPageButtons + 3);
      }
      
      // Add ellipsis if needed before the displayed range
      if (startPage > 2) {
        pageArray.push('...');
      }
      
      // Add the range of pages
      for (let i = startPage; i <= endPage; i++) {
        pageArray.push(i);
      }
      
      // Add ellipsis if needed after the displayed range
      if (endPage < totalPages - 1) {
        pageArray.push('...');
      }
      
      // Always include last page
      pageArray.push(totalPages);
    }
    
    setPages(pageArray);
  }, [totalItems, itemsPerPage, currentPage, maxPageButtons]);

  return (
    <div className="flex justify-center items-center space-x-2">
      {/* Previous button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        &lt;
      </button>
      
      {/* Page numbers */}
      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={typeof page === 'string'}
          className={`px-3 py-1 rounded ${
            page === currentPage
              ? 'bg-blue-600 text-white'
              : typeof page === 'string'
              ? 'bg-white text-gray-500 cursor-default'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {page}
        </button>
      ))}
      
      {/* Next button */}
      <button
        onClick={() => currentPage < Math.ceil(totalItems / itemsPerPage) && onPageChange(currentPage + 1)}
        disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
        className={`px-3 py-1 rounded ${
          currentPage >= Math.ceil(totalItems / itemsPerPage)
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
        }`}
      >
        &gt;
      </button>
    </div>
  );
}