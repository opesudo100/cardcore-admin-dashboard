import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/shared/DashboardOverview";

export default function CloudCardDashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}