"use client";

import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalResults: number;
  pageLimit: number;
  onPageChange: (updateFn: (p: number) => number) => void;
}

export function TablePagination({
  page,
  totalPages,
  totalResults,
  pageLimit,
  onPageChange,
}: PaginationProps) {
  if (totalResults === 0) return null;

  const startRange = (page - 1) * pageLimit + 1;
  const endRange = Math.min(page * pageLimit, totalResults);

  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (page <= 2) {
      return [1, 2, 3, "...", totalPages];
    }

    if (page >= totalPages - 1) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    }

    if (page - 1 === 1) {
      return [1, page, page + 1, "...", totalPages];
    }

    if (page + 1 === totalPages) {
      return [1, "...", page - 1, page, totalPages];
    }

    return [1, "...", page - 1, page, page + 1, "...", totalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="mt-5 flex flex-row items-center justify-between select-none">
      {/* Summary Range Text */}
      <div className="text-[13px] text-gray-500 font-normal">
        Showing{" "}
        <span className="font-bold text-[#252F3F]">{startRange}</span> to{" "}
        <span className="font-bold text-[#252F3F]">{endRange}</span> of{" "}
        <span className="font-bold text-[#252F3F]">{totalResults}</span> results
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* Previous Arrow */}
        <button
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label="Previous page"
          className={`flex items-center justify-center w-9 h-9 rounded text-[15px] transition-colors ${
            page === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-[#252F3F] hover:bg-gray-100"
          }`}
        >
          ‹
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="flex items-center justify-center w-9 h-9 text-[13px] text-gray-400"
            >
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(() => p as number)}
              aria-label={`Page ${p}`}
              aria-current={page === p ? "page" : undefined}
              className={`flex items-center justify-center cursor-pointer w-9 h-9 rounded text-[13px] font-medium transition-colors ${
                page === p
                  ? "bg-[#091D4A] text-white"
                  : "text-[#252F3F] hover:bg-gray-100 hover:text-[#252F3F]"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next Arrow */}
        <button
          onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          aria-label="Next page"
          className={`flex items-center justify-center w-9 h-9 rounded text-[15px] transition-colors ${
            page === totalPages || totalPages === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-400 hover:text-[#252F3F] hover:bg-gray-100"
          }`}
        >
          ›
        </button>
      </div>
    </div>
  );
}