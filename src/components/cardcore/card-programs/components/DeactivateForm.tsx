"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface DeactivateFormProps {
  title?: string;
  icon?: string;
  isDelete?: boolean;
  btn?: string;
  desc?: string;
  loading?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  message?: string;
}

export const DeactivateForm = ({
  title = "Deactivate",
  icon,
  isDelete = false,
  btn = "Deactivate",
  desc = "Are you sure you want to continue?  Take note that this might have an impact on your services.",
  loading = false,
  onCancel,
  onConfirm,
  message,
}: DeactivateFormProps) => {
  // Compute active dynamic properties to toggle conditional layout states on confirmation buttons
  const isActivationStyle = title?.toLowerCase().includes("activate") && !title?.toLowerCase().includes("deactivate");
  const isDeleteStyle = isDelete || title?.toLowerCase().includes("delete");
  const displayMessage = message || desc;
  const displayBtnText = btn || (isActivationStyle ? "Activate" : isDeleteStyle ? "Delete" : "Deactivate");
  
  const defaultIcon = isActivationStyle 
    ? "/assets/icons/enable-green.svg" 
    : isDeleteStyle 
    ? "/assets/icons/disable-red.svg" 
    : "/assets/icons/disable-red.svg";
  const displayIcon = icon || defaultIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-4 sm:items-center animate-in fade-in duration-150">
      {/* Clickable Overlay background */}
      <div
        onClick={() => !loading && onCancel?.()}
        className="absolute inset-0"
      />

      {/* Modal Card Element Container */}
      <div className="relative z-10 my-4 w-full max-w-[500px] rounded-lg bg-white p-5 text-center sm:p-8 shadow-xl">
        {/* Absolute Window Dismissal X Trigger */}
        <button
          type="button"
          disabled={loading}
          onClick={() => !loading && onCancel?.()}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition-all disabled:opacity-30"
        >
          <X size={24} />
        </button>

        {/* Dynamic Graphic Branding Accent Box */}
        <div 
          className={`w-[48px] h-[48px] rounded-[6px] flex items-center justify-center mx-auto mb-6 transition-colors ${
            isActivationStyle ? "bg-green-100" : "bg-[#F9D6D6]"
          }`}
        >
          <Image
            src={displayIcon}
            alt={isActivationStyle ? "Activate" : isDeleteStyle ? "Delete" : "Deactivate"}
            width={24}
            height={24}
            onError={(e) => {
              // Safety template layout block fallback if explicit branding vector path does not match
              (e.target as HTMLElement).style.display = "none";
            }}
          />
        </div>

        {/* Headliner Header Text */}
        <h2 className="text-xl font-bold mb-3 text-[#1F2937]">
          {title}
        </h2>

        {/* Description Segment */}
        <p className="text-[14px] text-gray-500 mb-8 leading-[24px] px-2">
          {displayMessage}
        </p>

        {/* Form Action Controls Layout bar */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => !loading && onCancel?.()}
            className="flex-1 py-3 rounded font-bold bg-[#F5F3FA] text-[#5B6475] hover:bg-[#eae8f0] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => !loading && onConfirm?.()}
            className={`flex-1 text-white py-3 rounded font-bold transition-all cursor-pointer  flex items-center justify-center gap-2 ${
              isActivationStyle 
                ? "bg-green-600 " 
                : isDeleteStyle 
                ? "bg-red-700 " 
                : "bg-red-600"
            }`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white/30 border-b-white rounded-full animate-spin shrink-0 cursor-pointer" />
            )}
            <span>
              {loading ? "" : isActivationStyle ? "Activate" : isDeleteStyle ? "Delete" : "Deactivate"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};