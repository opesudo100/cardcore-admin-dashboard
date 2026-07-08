"use client";

import { CardCoreDashboardOverview } from "@/components/dashboard/cardcore/DashboardOverview";
import { CloudCardDashboardOverview } from "@/components/dashboard/cloudcard/DashboardOverview";
import { useWorkspace } from "@/context/WorkspaceContext";

export function DashboardOverview() {
  const { isCloudCard } = useWorkspace();

  return isCloudCard ? (
    <CloudCardDashboardOverview />
  ) : (
    <CardCoreDashboardOverview />
  );
}