"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  countdown: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export const SessionTimeoutModal = ({
  isOpen,
  countdown,
  onStayLoggedIn,
  onLogout,
}: SessionTimeoutModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-end bg-black/40 p-6 sm:p-10 transition-all duration-500">
      {/* Positioned at the top right corner with a backdrop */}
      <div className="w-full max-w-[450px] rounded-[5px] bg-white p-6 shadow-md border border-gray-100 animate-in slide-in-from-right duration-300">
        
        <div className="flex items-start gap-4 mb-5">
          {/* Alarm Icon */}
          <div className="flex-shrink-0 w-[42px] h-[42px] rounded-[8px] bg-[#FEF3E2] flex items-center justify-center">
            <Image
              src="/assets/icons/alarm.svg"
              alt="Alarm"
              width={22}
              height={22}
            />
          </div>

          <div className="flex flex-col text-left">
            <h2 className="text-[16px] font-[700] text-[#091D4A] mb-1">
             You will be Log out in {countdown} seconds
            </h2>
            <p className="text-[13px] text-gray-500 leading-[20px]">
              Click "Yes" if you wish to continue and "No" if you want to close this prompt.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="px-6 py-2 rounded-[8px] font-[700] bg-[#F4F4F3] text-[#555964] text-[13px] transition-all hover:bg-gray-200 cursor-pointer"
          >
            No
          </button>
          <button
            type="button"
            onClick={onStayLoggedIn} 
            className="px-6 py-2 rounded-[8px] font-[700] bg-[#D97706] text-white text-[13px] transition-all hover:bg-[#B45309] cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};
