"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BasicInfoTab } from "@/components/dashboard/cardcore/BasicInfoTab";
import { ManageUsersTab } from "@/components/dashboard/cardcore/ManageUsersTab";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"basic" | "users">("basic");
  const tabs: Array<"basic" | "users"> = ["basic", "users"];

  return (
    <DashboardLayout>
      <div className="flex min-w-0 flex-col gap-8 w-full animate-in fade-in duration-300 sm:gap-10">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold text-[#111827] sm:text-[22px]">Manage Account</h1>
          <p className="text-[14px] text-gray-500 sm:text-base">Manage all your account information.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-5 overflow-x-auto border-b border-gray-200 sm:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative shrink-0 pb-3 text-sm font-bold transition-all ${
                activeTab === tab ? "text-[#091D4A]" : "text-gray-400"
              }`}
            >
              {tab === "basic" ? "Basic Information" : "Manage Users"}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#091D4A] rounded-t-md" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "basic" ? <BasicInfoTab /> : <ManageUsersTab />}
      </div>
    </DashboardLayout>
  );
}
