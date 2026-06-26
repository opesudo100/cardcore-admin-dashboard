"use client";

import { UserDropdown } from "@/components/layout/UserDropdown";
import { GeneralService } from "@/lib/services/generalService";
import { usePathname } from "next/navigation";
import { navigation } from "@/components/navigation/navigation.config";

const titleOverrides: Record<string, string> = {
  "/cardcore/card-programs": "Card Programs",
  "/cardcore/hsm": "HSM",
  "/cloudcard/billing": "Billing Info",
};

const getRouteTitle = (pathname: string) => {
  const workspace = pathname.includes("/cloudcard")
    ? navigation.cloudcard
    : navigation.cardcore;

  const matchedItem = [...workspace.menu]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname === item.path || pathname.startsWith(`${item.path}/`));

  if (matchedItem) return matchedItem.label;

  const routeBase = pathname.split("/").filter(Boolean).slice(0, 2).join("/");
  const basePath = `/${routeBase}`;
  if (titleOverrides[basePath]) return titleOverrides[basePath];

  const lastSegment = pathname.split("/").filter(Boolean).at(-1) || "dashboard";
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function Navbar({
  openMenu,
}: {
  openMenu: () => void;
}) {
  const pathname = usePathname();
  const title = getRouteTitle(pathname);

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
            {title}
          </h1>
        </div>
      </div>

      {/* Right Side */}
      <UserDropdown onSignOut={handleSignOut} />
    </header>
  );
}
