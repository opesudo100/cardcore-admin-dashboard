"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { GeneralService } from "@/lib/services/generalService";

interface UserDropdownProps {
  onSignOut?: () => void;
}

export function UserDropdown({ onSignOut }: UserDropdownProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [user, setUser] = useState({
    firstName: "User",
    emailAddress: "user@example.com",
    
    initials: "U",
  });

  useEffect(() => {
    // Fetch user data from storage
    const coreData = GeneralService.getStorageData("core");
    if (coreData) {
      const firstName = coreData.firstName || "";
      const otherNames = coreData.otherNames || "";
      const lastName = coreData.lastName || "";
      const fullName = [firstName, otherNames, lastName].filter(Boolean).join(" ").trim() || "User";
      const emailAddress = coreData.emailAddress || "user@example.com";
      const initials = GeneralService.getAcronym(fullName);
      setUser({ firstName: fullName, emailAddress, initials });
    }
  }, []);

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Profile Header Trigger Button */}
      <button
        className="flex min-w-0 items-center gap-2 sm:gap-3 bg-transparent border-0 text-left cursor-pointer"
        type="button"
        aria-label="Open profile menu"
      >
        {/* Avatar */}
        <span
          className="
            w-[42px]
            h-[42px]
            sm:w-[52px]
            sm:h-[52px]
            lg:w-[62px]
            lg:h-[62px]
            rounded-full
            bg-[#F0EFFF]
            text-[#081F5C]
            font-[900]
            flex
            items-center
            justify-center
            text-[14px]
            sm:text-[16px]
            lg:text-[18px]
          "
        >
          {user.initials}
        </span>

        {/* Text */}
        <span className="hidden min-w-0 flex-col gap-1 sm:flex">
          <strong className="truncate text-[13px] lg:text-[14px] font-semibold text-[#111827]">
            {user.firstName}
          </strong>
          <small className="max-w-[160px] truncate text-[#777C87] text-[11px] lg:text-[12px]">
            {user.emailAddress}
          </small>
        </span>

        {/* Chevron Icon with Rotation Transition */}
        <span className={`hidden text-[#777C87] text-[18px] sm:block transition-transform duration-200 ${isHovered ? "rotate-180" : ""}`}>
          <Image src="/assets/icons/chevron.svg" width={22} height={22} alt="down" />
        </span>
      </button>

      {/* Floating Card Modal Overlay (Triggered on Hover) */}
      <div
        className={`absolute right-0 mt-2 w-[290px] origin-top-right rounded-[16px] border border-gray-100 bg-white p-6 shadow-2xl transition-all duration-200 z-[9999] ${
          isHovered
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center text-center">
          {/* Centered High-Contrast Core Brand Avatar */}
          <div className="flex h-16 w-16 place-items-center justify-center rounded-full bg-[#081A46] text-[18px] font-bold text-white mb-4 shadow-sm">
            {user.initials}
          </div>

          {/* User Profile Info Labels */}
          <h3 className="text-[16px] font-bold text-[#081A46] tracking-tight">{user.firstName}</h3>
          <p className="text-[13px] text-gray-500 font-medium mt-0.5 mb-5">{user.emailAddress}</p>

          {/* Separation Divider Border */}
          <hr className="w-full border-gray-100 mb-5" />

          {/* Custom Styled Logout Action Button */}
          <button
            type="button"
            onClick={onSignOut}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#EBF0F5] px-4 py-3 text-[14px] font-bold text-[#111827] transition-all hover:bg-[#DEE5ED] active:scale-[0.98]"
          >
            {/* Native SVG embedded path asset logic matches mockup frame dimensions */}
            <svg
              className="w-4 h-4 text-[#111827]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}