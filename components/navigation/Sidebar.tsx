"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigation } from "./navigation.config";

type SidebarProps = {
    isOpen?: boolean;
    onClose?: () => void;
};

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const isCloudCard = pathname.includes("/cloudcard");

    const workspace = isCloudCard
        ? navigation.cloudcard
        : navigation.cardcore;

    const switchTo = isCloudCard
        ? "/cardcore/dashboard"
        : "/cloudcard/dashboard";

    useEffect(() => {
        localStorage.setItem("app", isCloudCard ? "cloud" : "core");
    }, [isCloudCard]);

    return (
        <>
        <button
            aria-label="Close menu"
            type="button"
            onClick={onClose}
            className={`fixed inset-0 z-40 bg-black/35 transition-opacity lg:hidden ${
                isOpen ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
        />

        <aside
            className={`fixed left-0 top-0 z-50 h-dvh w-[min(290px,86vw)] bg-[#f4f4f3] px-5 py-6 sm:px-6 sm:py-8 flex flex-col font-sans select-none border-r border-gray-100 transition-transform duration-200 lg:translate-x-0 ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >

            {/* Logo Container */}
            <div className="flex items-center justify-between gap-4">
                <Image
                    src={workspace.logo}
                    alt="Logo"
                    width={100}
                    height={50}
                    priority
                />
                <button
                    aria-label="Close menu"
                    type="button"
                    onClick={onClose}
                    className="grid h-10 w-10 place-items-center rounded-md border border-gray-200 bg-white text-[20px] text-[#091D4A] lg:hidden"
                >
                    ×
                </button>
            </div>
            {/* Navigation Menu */}
            {/* Reduced gap and top margin to align with the compact reference layout */}
            <div className="flex flex-col gap-1 mt-8 overflow-y-auto pr-1">
                {workspace.menu.map((item) => {
                    const active =
                        pathname === item.path ||
                        pathname.startsWith(`${item.path}/`);

                    return (
                        <Link
                            key={item.label}
                            href={item.path}
                            onClick={onClose}
                            className={`
                                h-[45px]
                                rounded-md
                                px-4
                                flex
                                items-center
                                gap-4
                                transition-all
                                duration-150
                                ${active
                                    ? "bg-[#091D4A] text-white"
                                    : "bg-transparent text-[#717784] hover:bg-white hover:text-[#091D4A]"
                                }
                            `}
                        >
                            {/* Slightly smaller icons for clean UI balancing */}
                            <div className={`w-6 h-6 flex items-center justify-center ${active ? "brightness-0 invert" : "opacity-70"}`}>
                                <Image
                                    src={item.icon}
                                    alt={item.label}
                                    width={22}
                                    height={22}
                                />
                            </div>

                            {/* Font size reduced to 15px with Medium/SemiBold weight to match image */}
                            <span className="text-[12px] font-medium tracking-wide">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

        
            <button
                onClick={() => {
                    localStorage.setItem("app", isCloudCard ? "core" : "cloud");
                    onClose?.();
                    router.push(switchTo);
                }}
                className="
                    w-full
                    h-[45px]
                    bg-white
                    rounded-[5px]
                    px-5
                    border border-gray-100/50
                    shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                    hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]
                    transition-all
                    duration-200
                "
            >
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                    
                        <div className="text-[#3A3F4B]">
                            <Image
                                src="/assets/icons/mobile.svg" 
                                alt="workspace"
                                width={22}
                                height={22}
                            />
                        </div>

                
                        <span className="text-[14px] sm:text-[16px] font-medium text-[#555964] tracking-wide truncate">
                            {workspace.switchLabel}
                        </span>
                    </div>

                  
                    <div className="text-[#717784]">
                        <Image
                            src="/assets/icons/switch.svg" 
                            alt="switch arrow"
                            width={18}
                            height={18}
                        />
                    </div>
                </div>
            </button>
        </aside>
        </>
    );
}
