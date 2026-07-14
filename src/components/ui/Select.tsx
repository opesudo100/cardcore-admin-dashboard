"use client";

import React from "react";

interface SelectProps {
  options: string[];
  label?: string;
  placeholder?: string;
  error?: string;
  value: string;
  onChange: (val: string) => void;
  size?: "small" | "medium";
  type?: "outline" | "filled";
  className?: string;
  disabled?: boolean;
}

export const Select = ({
  options,
  label = "",
  placeholder = "",
  error = "",
  value,
  onChange,
  size = "medium",
  type = "filled",
  className = "",
  disabled = false,
}: SelectProps) => {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-[6px]">
        {label && (
          <label
            htmlFor={label.trim()}
            className="text-[#6B7280] text-[14px] font-[800]"
          >
            {label}
          </label>
        )}
        <div
          className={`relative w-full overflow-hidden transition-all ${
            type === "outline"
              ? "border rounded-[8px]"
              : "bg-[#F4F5F7] rounded-[10px]"
          } ${size === "medium" ? "min-h-[43px]" : "min-h-[40px]"} px-[18px] ${
            error
              ? "border-red-500 bg-red-50"
              : "border-[#C7C7C7] focus-within:border-transparent"
          } ${className}`}
        >
          <select
            id={label.trim()}
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full outline-none bg-transparent ${
              size === "medium" ? "min-h-[43px]" : "min-h-[40px]"
            } text-[14px] ${
              !value ? "text-[#9FA6B2]" : "text-[#374151]"
            } cursor-pointer disabled:cursor-not-allowed`}
          >
            {placeholder && (
              <option value="" className="text-[#3741517d] bg-white">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt} value={opt} className="text-[#6B7280] bg-white">
                {opt}
              </option>
            ))}
          </select>
        </div>
        <span className="text-[12px] min-h-[14px] font-normal text-red-500">
          {error}
        </span>
      </div>
    </div>
  );
};