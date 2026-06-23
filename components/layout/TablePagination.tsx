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
  // Safe execution boundaries protecting state mutations
  if (totalResults === 0) return null;

  const startRange = (page - 1) * pageLimit + 1;
  const endRange = Math.min(page * pageLimit, totalResults);

  return (
    <div className="mt-5 flex flex-col gap-3 select-none sm:mt-8 sm:flex-row sm:items-center sm:justify-between">
      {/* Dynamic Summary Range Text Node */}
      <div className="text-[12px] text-gray-500 font-normal sm:text-[14px]">
        Showing{" "}
        <span className="font-bold text-[#252F3F]">{startRange}</span> to{" "}
        <span className="font-bold text-[#252F3F]">{endRange}</span> of{" "}
        <span className="font-bold text-[#252F3F]">{totalResults}</span> results
      </div>

      {/* Control Action Buttons */}
      <div className="flex h-[36px] w-full gap-2 sm:h-[40px] sm:w-auto">
        <button
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`flex-1 rounded border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium transition-colors sm:flex-none sm:px-4 ${
            page === 1
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0}
          className={`flex-1 rounded border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium transition-colors sm:flex-none sm:px-4 ${
            page === totalPages || totalPages === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
