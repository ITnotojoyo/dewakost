import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const ellipsis = '...';

    if (totalPages <= maxPagesToShow + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) {
        pageNumbers.push(ellipsis);
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) {
        pageNumbers.push(ellipsis);
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pages = getPageNumbers();

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };
  
  const baseButtonClasses = "min-w-[40px] px-3 h-10 flex items-center justify-center rounded-md text-sm font-medium transition-colors duration-150";
  const pageButtonClasses = `${baseButtonClasses} bg-white border border-gray-300 text-gray-600 hover:bg-gray-100`;
  const activeButtonClasses = `${baseButtonClasses} bg-blue-600 border border-blue-600 text-white shadow-sm`;
  const disabledButtonClasses = "text-gray-400 cursor-not-allowed opacity-60";

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className={`${pageButtonClasses} ${currentPage === 1 ? disabledButtonClasses : ''}`}
        aria-label="Go to previous page"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {pages.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={currentPage === page ? activeButtonClasses : pageButtonClasses}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-1 h-10 flex items-center justify-center text-gray-500">
            {page}
          </span>
        )
      )}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`${pageButtonClasses} ${currentPage === totalPages ? disabledButtonClasses : ''}`}
        aria-label="Go to next page"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>
    </nav>
  );
};

export default Pagination;
