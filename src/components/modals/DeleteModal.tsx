"use client";

import React from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface DeleteModalProps {
  isOpen: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  actionLabel: string;
  // NEW: Add optional icon prop
  icon?: string; 
  loading?: boolean;
}

export const DeleteModal = ({
  isOpen,
  onCancel,
  onConfirm,
  title,
  description,
  actionLabel,
  // NEW: Destructure icon
  icon, 
  loading = false,
}: DeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-3 sm:p-4 sm:items-center">
      <div onClick={() => !loading && onCancel?.()} className="absolute inset-0" />

      <div className="relative z-10 my-4 w-full max-w-[500px] rounded-lg bg-white p-5 text-center sm:p-8">
        {/* Close Button remains the same */}
        <button
          type="button"
          disabled={loading}
          onClick={() => onCancel?.()}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition-all disabled:opacity-50"
        >
          <X size={28} />
        </button>

        {/* Dynamic Icon Section */}
        <div className="w-[45px] h-[45px] rounded-[5px] bg-[#F9D6D6] flex items-center justify-center mx-auto mb-6">
          <Image
            // NEW: Use the passed icon, or fallback to the disable icon if none is provided
            src={icon || "/assets/icons/disable-red.svg"} 
            alt="Delete"
            width={28}
            height={28}
          />
        </div>

        {/* Existing dynamic props remain the same */}
        <h2 className="text-xl font-bold mb-2 text-[#1F2937]">{title}</h2>
        <p className="text-sm text-gray-500 mb-8 leading-[28px]">{description}</p>

        {/* Existing buttons remain the same */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            disabled={loading}
            onClick={() => onCancel?.()}
            className="flex-1 py-3 rounded font-bold bg-[#F5F3FA] text-[#5B6475] transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => onConfirm?.()}
            className="flex-1 bg-red-600 text-white py-3 rounded font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              actionLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
