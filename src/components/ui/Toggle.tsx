"use client";

import React from "react";

interface ToggleProps {
    active?: boolean;
    disabled?: boolean;
    onToggle?: (activeState: boolean) => void;
}

export default function Toggle({ active = false, disabled = false, onToggle }: ToggleProps) {
    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevents double-triggering parent element click boundaries
        if (!disabled && onToggle) {
            onToggle(active);
        }
    };

    return (
        <div
            onClick={handleToggle}
            className={`w-[40px] h-[22px] flex items-center relative transition-all ease-in duration-75 rounded-full ${
                active ? "bg-[#dedffd]" : "bg-gray-200"
            } ${
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
        >
            <span
                className={`w-[18px] h-[18px] absolute top-[2px] left-[3px] z-[99] transition-all ease-in duration-150 rounded-full ${
                    active 
                        ? "translate-x-[16px] bg-[#091D4A]" // Replacing var(--primary) with your navy tone, modify to your exact CSS variable if needed
                        : "translate-x-0 bg-gray-300"
                }`}
            />
        </div>
    );
}