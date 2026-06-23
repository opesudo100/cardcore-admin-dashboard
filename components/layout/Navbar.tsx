"use client";

import { UserDropdown } from "@/components/layout/UserDropdown";
import { GeneralService } from "@/lib/services/generalService";

export function Navbar({
  openMenu,
}: {
  openMenu: () => void;
}) {

  const handleSignOut = () => {
    GeneralService.logout();
  };

  return (
    <header className="sticky top-0 z-30 min-h-[72px] lg:min-h-[90px] bg-white border-b border-[#E5E7EB] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left Side */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          aria-label="Open menu"
          type="button"
          onClick={openMenu}
          className="lg:hidden w-[42px] h-[42px] rounded-[12px] border border-[#E5E7EB] flex items-center justify-center text-[#091D4A]"
        >
          ☰
        </button>

        {/* Title */}
        <div>
          <h1 className="text-[17px] sm:text-[18px] font-[600] text-[#111827] leading-none mt-1">
            Dashboard
          </h1>
        </div>
      </div>

      {/* Right Side */}
      <UserDropdown onSignOut={handleSignOut} />
    </header>
  );
}