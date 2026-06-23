"use client";

import React from "react";

interface CustomSelectProps {
  options: any[];
  label?: string;
  placeholder?: string;
  value?: any; // The full object
  onSelect: (opt: any) => void;
  error?: string;
  type?: "outline" | "filled";
  size?: "small" | "medium";
  className?: string;
  disabled?: boolean;
}

export const CustomSelect = ({
  options,
  label = "",
  placeholder = "",
  value,
  onSelect,
  error = "",
  type = "filled",
  size = "medium",
  className = "",
  disabled = false,
}: CustomSelectProps) => {
  const displayValue = value?.name || "";

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const index = e.target.value;
    if (index === "") {
      onSelect(null);
    } else {
      const selectedOption = options[parseInt(index, 10)];
      onSelect(selectedOption);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-[6px]">
        {label && (
          <span className="text-gray-500 text-[14px] font-medium">
            {label}
          </span>
        )}

        <div
          className={`relative w-full overflow-hidden transition-all ${
            type === "outline"
              ? "border rounded-[8px]"
              : "bg-[#F4F5F7] rounded-[10px]"
          } ${size === "medium" ? "min-h-[43px]" : "min-h-[40px]"} px-[18px] ${
            error
              ? "border-red-500 bg-red-50"
              : "border-[#C7C7C7] focus-within:border-[#091D4A]"
          } ${className}`}
        >
          {/* Custom Display Layer */}
          <span
            className={`h-full flex items-center whitespace-nowrap truncate max-w-[90%] absolute inset-0 px-[18px] pointer-events-none ${
              !displayValue ? "text-gray-400" : "text-gray-700 font-medium"
            } text-[14px]`}
          >
            {displayValue || placeholder}
          </span>

          {/* Native Select Layer (Transparent but clickable) */}
          <select
            value={
              value
                ? options.findIndex(
                    (opt) =>
                      (opt.id && opt.id === value.id) ||
                      (opt.isoCode && opt.isoCode === value.isoCode && opt.name === value.name) ||
                      (opt.name === value.name && opt.latitude === value.latitude) || // For cities
                      JSON.stringify(opt) === JSON.stringify(value)
                  )
                : ""
            }
            onChange={handleSelectChange}
            disabled={disabled}
            className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10`}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt, index) => (
              <option key={opt.id || opt.isoCode || `${opt.name}-${index}`} value={index}>
                {opt.name}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow Icon (Optional, matching Angular style) */}
          <div className="absolute right-[18px] top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L6 6L11 1"
                stroke="#9FA6B2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <span className="text-[12px] min-h-[14px] font-normal text-red-500">
          {error}
        </span>
      </div>
    </div>
  );
};