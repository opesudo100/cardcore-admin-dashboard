"use client";

import React from "react";
import { Search } from "@/components/ui/Search";
import { Filter } from "@/components/ui/Filter";

interface PageHeaderProps {
    totalResults?: number;
    actionLabel?: string;
    showActionButton?: boolean;
    onActionClick?: () => void;
    onSearchChange?: (value: string) => void;
    onFilterClick?: () => void;
    
    // Advanced Filter Props
    filters?: any[];
    onFilterApply?: (values: any) => void;
}

export function PageHeader({
    totalResults,
    actionLabel = "Add Institution",
    showActionButton = true,
    onActionClick,
    onSearchChange,
    onFilterClick,
    filters,
    onFilterApply,
}: PageHeaderProps) {
    return (
        <div className="w-full flex flex-col gap-3 mb-6 sm:mb-4">
            {/* Dynamic Results Counter */}
            <span className="text-[13px] sm:text-[14px] italic text-gray-500 font-normal self-start">
                {typeof totalResults === 'number' && (
                    <p>Total of {totalResults} results found</p>
                )}
            </span>

            {/* Styled Operational Action Container Panel */}
            <div className="w-full min-h-[48px] rounded-[8px] flex flex-col gap-3 sm:min-h-[56px] sm:flex-row sm:items-center sm:justify-between">

                {/* Left Interactive Search & Utility Node */}
                <div className="flex min-w-0 flex-wrap items-center gap-3 py-1.5 sm:flex-1">
                    {/* Reusable Search Component */}
                    <Search 
                        onSearch={(text) => onSearchChange?.(text)} 
                        onSubmit={(text) => onSearchChange?.(text)} 
                    />
                    
                    {/* Divider line if both are present */}
                    {((filters && filters.length > 0) || onFilterClick) && (
                        <div className="w-[1px] h-[32px] bg-gray-300 mx-1" />
                    )}

                    {/* Reusable Filter Component */}
                    {filters && filters.length > 0 ? (
                        <Filter 
                            filters={filters} 
                            onApply={(values) => onFilterApply?.(values)} 
                            position="left" 
                        />
                    ) : onFilterClick ? (
                        <button
                            onClick={onFilterClick}
                            className="p-1 hover:bg-gray-50 rounded transition-colors text-gray-400 shrink-0"
                            type="button"
                            aria-label="Filter results"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                            </svg>
                        </button>
                    ) : null}
                </div>

                {/* Right Interactive Global Action Callout Button */}
                {showActionButton && actionLabel && (
                    <button
                        onClick={onActionClick}
                        type="button"
                        className="h-[40px] w-fit min-w-[140px] px-5 bg-[#091D4A] hover:bg-[#061433] text-white text-[12px] sm:text-[14px] font-medium rounded-[8px] transition-all duration-150 active:scale-[0.98] whitespace-nowrap sm:h-[44px] sm:px-6"
                    >
                        {actionLabel}
                    </button>
                )}
            </div>
        </div>
    );
}
