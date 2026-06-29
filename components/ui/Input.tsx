"use client";

import React, { ChangeEvent, KeyboardEvent } from "react";

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  disabled?: boolean;
  error?: string;
  max?: number;
  optional?: boolean;
  secrete?: boolean;
  className?: string;
}

export const Input = ({
  label = "",
  type = "text",
  placeholder = "",
  value,
  onChange,
  onSubmit,
  disabled = false,
  error = "",
  max = 10000,
  optional = false,
  secrete = false,
  className = "",
}: InputProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(0, max);
    onChange(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  const handleBlur = () => {
    const val = value.slice(0, max);
    if (val !== value) {
      onChange(val);
    }
  };

  return (
    <div className="flex flex-col gap-[5px] w-full">
      {label && (
        <label
          htmlFor={label.trim()}
          className="text-[var(--grey-text)] flex items-center w-full justify-between gap-[10px] text-[14px] font-[500]"
        >
          {label}
          {optional && <span className="text-[10px] font-[300]">(Optional)</span>}
        </label>
      )}

      <input
        type={secrete ? "password" : type}
        id={label.trim()}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        maxLength={max}
        className={`border text-[var(--grey-text)] rounded-[8px] h-[45px] outline-none focus:outline-none focus:ring-2 focus:ring-[#bbcdfc86] p-[12px] transition-all ${
          error
            ? "border-[#ff00005e] bg-[#ff000003]"
            : "border-[#C7C7C7] focus:border-none"
        } ${className}`}
      />

      <span className="text-[10px] font-[400] h-[8px] text-red-500">
        {error}
      </span>
    </div>
  );
};