"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DashboardCard } from "@/components/dashboard/shared/DashboardCard";
import type { Metric } from "@/types/dashboard.types";
import Image from "next/image";
import { cloudCardClientService } from "@/lib/services/cloudCardClientService";
import { GeneralService } from "@/lib/services/generalService";
import { toast } from "react-hot-toast";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend as ChartLegend } from "chart.js";

// Register ChartJS elements for the dynamic provisioning charts
ChartJS.register(ArcElement, ChartTooltip, ChartLegend);

type CloudDashboardSummary = {
  institutions?: number;
  totalInstitutions?: number;
  totalCards?: number;
  totalInvoice?: number;
  invoicePaid?: number;
  keyReplenishingCount?: number;
  totalKeyReplenishingCost?: number | string;
  provisioning?: number;
  reProvisioning?: number;
  totalProvisioningCost?: number | string;
};

type CloudClient = {
  name?: string;
  type?: string;
};

type StoredUser = {
  firstName?: string;
};

type ApiResponse<T> = {
  data?: T;
};

export function CloudCardDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<StoredUser | null>(null);
  
  // Holds all granular nested metrics synced with the Angular service subscribe hook
  const [dashboardRawData, setDashboardRawData] = useState<Required<Pick<CloudDashboardSummary, "keyReplenishingCount" | "provisioning" | "reProvisioning">> & {
    totalKeyReplenishingCost: number | string;
    totalProvisioningCost: number | string;
  }>({
    keyReplenishingCount: 0,
    totalKeyReplenishingCost: 0,
    provisioning: 0,
    reProvisioning: 0,
    totalProvisioningCost: 0
  });

  const [metricsData, setMetricsData] = useState<Metric[]>([
    { label: "Total Institutions", value: "0", icon: "building", tint: "#EEF0FF" },
    { label: "Total Cards", value: "0", icon: "card", tint: "#FAFAF9" },
  ]);

  const [invoiceData, setInvoiceData] = useState({
    total: 0,
    completed: 0,
    pending: 0
  });
  const [recentClients, setRecentClients] = useState<CloudClient[]>([]);

  // Helper utility function matching Angular generalService formatter explicitly
  const formatCurrency = (amt: number | string = 0) => {
    const numericValue = parseInt(amt?.toString() || "0", 10);
    return `₦${numericValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = GeneralService.getStorageData("core");
        setUserData(user);

        const [res, clientsRes] = await Promise.all([
          cloudCardClientService.getDashboardData(),
          cloudCardClientService.getClients(),
        ]);

        if (res) {
          const summaryResponse = res as ApiResponse<CloudDashboardSummary> & CloudDashboardSummary;
          const apiData = summaryResponse.data || summaryResponse;
          
          setMetricsData([
            {
              label: "Total Institutions",
              value: String(apiData.institutions || apiData.totalInstitutions || 0),
              icon: "building",
              tint: "#EEF0FF",
            },
            {
              label: "Total Cards",
              value: String(apiData.totalCards || 0),
              icon: "card",
              tint: "#FAFAF9",
            },
          ]);

          setInvoiceData({
            total: apiData.totalInvoice || 0,
            completed: (apiData.invoicePaid || 0) / 100,
            pending: ((apiData.totalInvoice || 0) - (apiData.invoicePaid || 0)) / 100
          });

          // Maps dynamic backend integers straight into your left breakdown cards
          setDashboardRawData({
            keyReplenishingCount: apiData.keyReplenishingCount || 0,
            totalKeyReplenishingCost: apiData.totalKeyReplenishingCost || 0,
            provisioning: apiData.provisioning || 0,
            reProvisioning: apiData.reProvisioning || 0,
            totalProvisioningCost: apiData.totalProvisioningCost || 0
          });
        }

        const clientsResponse = clientsRes as ApiResponse<CloudClient[]> | CloudClient[] | undefined;
        const clients = (Array.isArray(clientsResponse) ? clientsResponse : clientsResponse?.data) || [];
        setRecentClients(Array.isArray(clients) ? clients : []);
      } catch (error) {
        console.error("Failed to fetch cloud dashboard metrics:", error);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Replaces static unovis Angular data bindings using Chart.js datasets configuration array
  const dynamicDonutData = useMemo(() => {
    const hasData = dashboardRawData.provisioning > 0 || dashboardRawData.reProvisioning > 0;
    
    return {
      labels: ["Provisioning", "Re-Provisioning"],
      datasets: [
        {
          // Matches the index order configuration of your original legend mapping colors
          data: [
            hasData ? dashboardRawData.provisioning : 50, 
            hasData ? dashboardRawData.reProvisioning : 20
          ],
          backgroundColor: ["#081F5C", "#EDEEFF"],
          hoverBackgroundColor: ["#09245A", "#DEE0FC"],
          borderWidth: 0,
        },
      ],
    };
  }, [dashboardRawData]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "85%", // Replicates cutout: '90%' aspect ratio framework safely
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center">
        <span className="text-[18px] font-[800] text-[#252F3F]">
          Hello {userData?.firstName || "User"} 👋
        </span>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          <DashboardCard metric={metricsData[0]} />
        </div>

        <div className="lg:col-span-4">
          <DashboardCard metric={metricsData[1]} />
        </div>

        {/* Payments Invoice */}
        <div className="sm:col-span-2 lg:col-span-4 border border-[#e4e3e1] bg-[#EDFFF9] min-h-[120px] p-4 sm:p-4 rounded-[5px] shadow-sm">
          <span className="text-[15px] text-[#323232] font-medium">
            Payments Invoice
          </span>

          <div className="mt-2 text-[30px] font-[700] text-[#323232]">
            {invoiceData.total}
          </div>

          <div className="flex gap-5 mt-2">
            <div className="flex flex-col w-full">
              <span className="text-[11px] text-[#323232] font-medium">
                {invoiceData.completed}% Completed
              </span>
              <span className="w-full bg-green-600 h-[3px] mt-1 rounded-full" />
            </div>

            <div className="flex flex-col w-full">
              <span className="text-[11px] text-[#323232] font-medium">
                {invoiceData.pending}% Pending
              </span>
              <span className="w-full bg-amber-500 h-[3px] mt-1 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT SECTION */}
        <div className="lg:col-span-7 flex flex-col gap-5 rounded-[5px] border border-gray-100 bg-white p-4 sm:p-5 shadow-md min-w-0">
          
          {/* Key Replenishment - Fully Dynamic */}
          <div className="border border-gray-200 rounded-[8px] p-5 flex flex-col gap-3 bg-white">
            <div className="flex items-center gap-2">
              <Image src="/assets/icons/key_.svg" alt="key" width={20} height={20} />
              <span className="text-[12px] text-[#323232] font-semibold">
                Total Key Replenishment
              </span>
            </div>

            <div className="grid grid-cols-12">
              <div className="col-span-4 flex flex-col">
                <span className="text-[11px] text-gray-500 font-medium">Count</span>
                <span className="text-[15px] font-[700] text-[#081F5C]">
                  {dashboardRawData.keyReplenishingCount}
                </span>
              </div>

              <div className="col-span-8 flex flex-col">
                <span className="text-[11px] text-gray-500 font-medium">Cost</span>
                <span className="text-[15px] font-[700] text-[#081F5C]">
                  {formatCurrency(dashboardRawData.totalKeyReplenishingCost)}
                </span>
              </div>
            </div>
          </div>

          {/* Provisioning - Native Integrated Chart */}
          <div className="border border-gray-200 rounded-[8px] p-5 relative bg-white">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2">
                <Image src="/assets/icons/key_.svg" alt="key" width={20} height={20} />
                <span className="text-[12px] text-[#323232] font-semibold">
                  Total Provisioning
                </span>
              </div>

              {/* Legend Badges */}
              <div className="flex flex-col gap-1.5 self-start">
                <div className="flex items-center gap-2">
                  <span className="w-[8px] h-[8px] rounded-full bg-[#EDEEFF]" />
                  <span className="text-[12px] text-gray-500 font-medium">Re-Provisioning</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[8px] h-[8px] rounded-full bg-[#081F5C]" />
                  <span className="text-[12px] text-gray-500 font-medium">Provisioning</span>
                </div>
              </div>
            </div>

            {/* Dynamic Interactive Chart Canvas */}
            <div className="flex justify-center py-6">
              <div className="relative w-[150px] h-[150px]">
                <Doughnut data={dynamicDonutData} options={donutOptions} />
              </div>
            </div>

            {/* Metrics Breakdowns */}
            <div className="flex justify-center gap-5 flex-wrap border-t border-gray-50 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-medium">Provisioning Count:</span>
                <span className="text-[14px] font-[700] text-slate-800">
                  {dashboardRawData.provisioning}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-medium">Re-Provisioning Count:</span>
                <span className="text-[14px] font-[700] text-slate-800">
                  {dashboardRawData.reProvisioning}
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-2">
              <span className="text-[11px] text-gray-500 font-medium">Cost:</span>
              <span className="text-[14px] font-[700] text-[#081F5C]">
                {formatCurrency(dashboardRawData.totalProvisioningCost)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="lg:col-span-5 border border-gray-100 bg-white p-4 sm:p-5 shadow-md rounded-[5px] min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-[600] text-[#323232]">
              Most Recent Clients
            </span>
            <span className="bg-gray-100 px-2 rounded-full text-[13px] font-[700] text-slate-600">
              100+
            </span>
          </div>

          <div className="flex flex-col gap-1 mt-6">
            {recentClients.map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-3 bg-[#EEF0FF66] p-2 rounded-[4px] hover:bg-[#EEF0FF99] transition-colors"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="w-[35px] h-[35px] rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                    <Image width={25} height={25} src="/assets/icons/cli.svg" alt="logo" /> 
                  </span>
                  <span className="truncate text-[14px] text-[#323232] font-medium">
                    {client.name}
                  </span>
                </div>

                <span className="capitalize bg-gray-200 px-2 py-0.5 rounded-sm text-[11px] font-semibold text-slate-600">
                  {client.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
