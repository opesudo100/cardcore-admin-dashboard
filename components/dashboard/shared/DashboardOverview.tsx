"use client";

import { usePathname } from "next/navigation";
import { CardCoreDashboardOverview } from "@/components/dashboard/cardcore/DashboardOverview";
import { CloudCardDashboardOverview } from "@/components/dashboard/cloudcard/DashboardOverview";

export function DashboardOverview() {
  const pathname = usePathname();

  const isCloudCard = pathname.includes("/cloudcard");

  return isCloudCard ? (
    <CloudCardDashboardOverview />
  ) : (
    <CardCoreDashboardOverview />
  );
}