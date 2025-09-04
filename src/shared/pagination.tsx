import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

    if (totalPages <= 7) {
      // Nếu ít trang thì hiển thị hết
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Trang đầu
      pages.push(1);

      if (currentPage > 4) {
        pages.push("...");
      }

      // Các trang gần current
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 3) {
        pages.push("...");
      }

      // Trang cuối
      pages.push(totalPages);
    }

    return pages;
  };    

  // Calculate display values
  const displayStart = startIndex + 1;
  const displayEnd = endIndex;
  const totalResults = totalItems || (totalPages * itemsPerPage);

  return (
    <div className="flex justify-between text-gray-500 items-center gap-2 p-2 bg-primary-100">
        <div className="text-[80%]">
          Showing {displayStart} to {displayEnd} of {totalResults} results
        </div>
    
      <div className="flex items-center gap-2">
          {/* Prev */}
        <button
        className="p-1 rounded-full bg-white disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Page numbers */}
      {getPageNumbers().map((page, idx) =>
        typeof page === "number" ? (
          <button
            key={idx}
            className={`px-3 py-1 rounded-full ${
              currentPage === page
                ? "bg-primary-800 text-white"
                : "bg-white hover:bg-gray-300"
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ) : (
          <span key={idx} className="px-2">
            {page}
          </span>
        )
      )}

      {/* Next */}
      <button
        className="p-1 rounded-full bg-white disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} />
      </button>
      </div>
      
    </div>
  );
};

export default Pagination;
