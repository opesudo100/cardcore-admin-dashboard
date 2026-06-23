import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardOverview } from "@/components/dashboard/shared/DashboardOverview";

export default function CardCoreDashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  );
}