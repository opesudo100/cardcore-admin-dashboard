"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

function DashboardFrame({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white lg:flex">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <section className="min-h-screen min-w-0 flex-1 lg:ml-[290px] flex flex-col">
        <Navbar openMenu={() => setIsSidebarOpen(true)} />

        <div className="flex-1 min-w-0 flex flex-col px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </section>
    </main>
  );
}

export function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardFrame>
        {children}
      </DashboardFrame>
    </AuthGuard>
  );
}
