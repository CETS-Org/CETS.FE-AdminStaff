import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  startIndex?: number;
  endIndex?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage = 8,
  totalItems,
  startIndex = 0,
  endIndex = 0,
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Number of pages to show around current page

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate the range around current page
      const start = Math.max(2, currentPage - delta);
      const end = Math.min(totalPages - 1, currentPage + delta);

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add pages around current page
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Calculate display values
  const displayStart = startIndex || ((currentPage - 1) * itemsPerPage + 1);
  const displayEnd = endIndex || Math.min(currentPage * itemsPerPage, totalItems || 0);
  const totalResults = totalItems || (totalPages * itemsPerPage);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 px-6 py-4 bg-white border-t border-gray-200">
      {/* Results info */}
      <div className="text-sm text-gray-700 font-medium">
        Showing <span className="font-semibold text-gray-900">{displayStart}</span> to{" "}
        <span className="font-semibold text-gray-900">{displayEnd}</span> of{" "}
        <span className="font-semibold text-gray-900">{totalResults}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center space-x-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </button>

        {/* Page numbers */}
        <div className="hidden sm:flex items-center space-x-1">
          {getPageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  currentPage === page
                    ? "bg-primary-600 text-white shadow-sm ring-1 ring-primary-600"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                }`}
                aria-current={currentPage === page ? "page" : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            ) : (
              <div
                key={idx}
                className="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500"
                aria-hidden="true"
              >
                <MoreHorizontal className="w-4 h-4" />
              </div>
            )
          )}
        </div>

        {/* Mobile page indicator */}
        <div className="sm:hidden flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
          <span className="font-semibold">{currentPage}</span>
          <span className="mx-1">/</span>
          <span>{totalPages}</span>
        </div>

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors duration-200"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
