"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DashboardCard } from "@/components/dashboard/shared/DashboardCard";
import type { Metric } from "@/types/dashboard.types";
import Image from "next/image";
import { cloudCardClientService } from "@/lib/services/cloudCardClientService";
import { GeneralService } from "@/lib/services/generalService";
import { toast } from "react-hot-toast";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";
import { Building2, CreditCard, Receipt } from "lucide-react";

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

const formatCurrency = (amt: number | string = 0) => {
  const numericValue = parseInt(amt?.toString() || "0", 10);
  return `₦${numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getInitials = (name?: string) => {
  if (!name) return "--";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const VISIBLE_CLIENTS = 7;

export function CloudCardDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<StoredUser | null>(null);
  const [showAllClients, setShowAllClients] = useState(false);

  const [dashboardRawData, setDashboardRawData] = useState<{
    keyReplenishingCount: number;
    totalKeyReplenishingCost: number | string;
    provisioning: number;
    reProvisioning: number;
    totalProvisioningCost: number | string;
  }>({
    keyReplenishingCount: 0,
    totalKeyReplenishingCost: 0,
    provisioning: 0,
    reProvisioning: 0,
    totalProvisioningCost: 0,
  });

  const [metricsData, setMetricsData] = useState<Metric[]>([
    { label: "Total Institutions", value: "0", icon: "building", tint: "#EEF0FF" },
    { label: "Total Cards", value: "0", icon: "card", tint: "#FAFAF9" },
  ]);

  const [invoiceData, setInvoiceData] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const [recentClients, setRecentClients] = useState<CloudClient[]>([]);

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
          const summaryResponse = res as ApiResponse<CloudDashboardSummary> &
            CloudDashboardSummary;
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
            pending:
              ((apiData.totalInvoice || 0) - (apiData.invoicePaid || 0)) / 100,
          });

          setDashboardRawData({
            keyReplenishingCount: apiData.keyReplenishingCount || 0,
            totalKeyReplenishingCost: apiData.totalKeyReplenishingCost || 0,
            provisioning: apiData.provisioning || 0,
            reProvisioning: apiData.reProvisioning || 0,
            totalProvisioningCost: apiData.totalProvisioningCost || 0,
          });
        }

        const clientsResponse = clientsRes as
          | ApiResponse<CloudClient[]>
          | CloudClient[]
          | undefined;
        const clients =
          (Array.isArray(clientsResponse)
            ? clientsResponse
            : clientsResponse?.data) || [];
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

  const totalProvisioning =
    dashboardRawData.provisioning + dashboardRawData.reProvisioning;

  const dynamicDonutData = useMemo(() => {
    const hasData =
      dashboardRawData.provisioning > 0 || dashboardRawData.reProvisioning > 0;
    return {
      labels: ["Provisioning", "Re-Provisioning"],
      datasets: [
        {
          data: [
            hasData ? dashboardRawData.provisioning : 50,
            hasData ? dashboardRawData.reProvisioning : 20,
          ],
          backgroundColor: ["#081F5C", "#BBBEF7"],
          hoverBackgroundColor: ["#09245A", "#A8AAEE"],
          borderWidth: 0,
        },
      ],
    };
  }, [dashboardRawData]);

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "82%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: {
      duration: 600,
    },
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#09245A]" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-5">

      {/* Greeting */}
      <p className="text-[18px] font-[500] text-[#252F3F]">
        Hello, {userData?.firstName || "User"} 👋{" "}
        <span className="font-[400] text-[#6B7280]"></span>
      </p>

      {/* Top metric cards — all same gray */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

        {/* Institutions */}
        <div className="bg-[#F9FAFB] rounded-[8px] p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <Building2 size={14} />
            Total institutions
          </div>
          <p className="text-[26px] font-[500] text-[#111827] leading-none">
            {metricsData[0].value}
          </p>
        </div>

        {/* Cards */}
        <div className="bg-[#F9FAFB] rounded-[8px] p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <CreditCard size={14} />
            Total cards
          </div>
          <p className="text-[26px] font-[500] text-[#111827] leading-none">
            {Number(metricsData[1].value).toLocaleString()}
          </p>
        </div>

        {/* Invoice — same gray, no separate border */}
        <div className="bg-[#F9FAFB] rounded-[8px] p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
            <Receipt size={14} />
            Payments invoice
          </div>
          <p className="text-[26px] font-[500] text-[#111827] leading-none">
            {invoiceData.total}
          </p>
          <div className="flex gap-4">
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[11px] text-[#6B7280]">
                {invoiceData.completed}% completed
              </span>
              <div className="h-[3px] rounded-full bg-green-500 w-full" />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="text-[11px] text-[#6B7280]">
                {invoiceData.pending}% pending
              </span>
              <div className="h-[3px] rounded-full bg-amber-400 w-full" />
            </div>
          </div>
        </div>

      </div>

      {/* Bottom layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

        {/* LEFT — Key replenishment + Provisioning */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex flex-col gap-5">

          {/* Key Replenishment — no icon */}
          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-[500] text-[#111827]">
              Key replenishment
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F9FAFB] rounded-[8px] p-3">
                <p className="text-[11px] text-[#6B7280] mb-1">Count</p>
                <p className="text-[18px] font-[500] text-[#111827]">
                  {dashboardRawData.keyReplenishingCount.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">replenishments</p>
              </div>
              <div className="bg-[#F9FAFB] rounded-[8px] p-3">
                <p className="text-[11px] text-[#6B7280] mb-1">Total cost</p>
                <p className="text-[18px] font-[500] text-[#111827]">
                  {formatCurrency(dashboardRawData.totalKeyReplenishingCost)}
                </p>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">this period</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-[0.5px] bg-[#E5E7EB]" />

          {/* Provisioning — no icon */}
          <div className="flex flex-col gap-4">
            <p className="text-[13px] font-[500] text-[#111827]">
              Provisioning
            </p>

            <div className="flex items-center gap-5">
              {/* Donut */}
              <div className="relative w-[110px] h-[110px] shrink-0">
                <Doughnut data={dynamicDonutData} options={donutOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[18px] font-[500] text-[#111827] leading-none">
                    {totalProvisioning.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#9CA3AF] mt-0.5">total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#081F5C]" />
                    <span className="text-[12px] text-[#6B7280]">Provisioning</span>
                  </div>
                  <span className="text-[13px] font-[500] text-[#111827]">
                    {dashboardRawData.provisioning.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#BBBEF7]" />
                    <span className="text-[12px] text-[#6B7280]">Re-provisioning</span>
                  </div>
                  <span className="text-[13px] font-[500] text-[#111827]">
                    {dashboardRawData.reProvisioning.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost row */}
            <div className="flex items-center justify-between bg-[#F9FAFB] rounded-[8px] px-4 py-3">
              <span className="text-[12px] text-[#6B7280]">Total provisioning cost</span>
              <span className="text-[14px] font-[500] text-[#111827]">
                {formatCurrency(dashboardRawData.totalProvisioningCost)}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT — Recent clients, capped to match left panel height */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-[500] text-[#111827]">
              Recent clients
            </p>
            {recentClients.length > VISIBLE_CLIENTS && (
              <button
                onClick={() => setShowAllClients((prev) => !prev)}
                className="text-[12px] font-[500] text-[#09245A]  transition-all cursor-pointer"
              >
                {showAllClients ? "Show less" : "View all"}
              </button>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            {(showAllClients ? recentClients : recentClients.slice(0, VISIBLE_CLIENTS)).map(
              (client, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3  py-2 rounded-[6px] hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-[32px] h-[32px] rounded-full bg-[#EEF0FF] border border-[#E5E7EB] flex items-center justify-center shrink-0 text-[11px] font-[500] text-[#4338CA]">
                      {getInitials(client.name)}
                    </div>
                    <span className="text-[13px] text-[#374151] truncate">
                      {client.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] rounded-[4px] px-2 py-0.5 capitalize whitespace-nowrap shrink-0">
                    {client.type}
                  </span>
                </div>
              )
            )}
          </div>

          {/* Inline expand — shown below list when collapsed and there are more */}
          {/* {!showAllClients && recentClients.length > VISIBLE_CLIENTS && (
            <button
              onClick={() => setShowAllClients(true)}
              className="mt-1 w-full text-center text-[12px] text-[#6B7280] hover:text-[#4338CA] transition-colors py-1.5 rounded-[6px] hover:bg-[#F9FAFB] border border-dashed border-[#E5E7EB]"
            >
              +{recentClients.length - VISIBLE_CLIENTS} more clients
            </button>
          )} */}
        </div>

      </div>
    </div>
  );
}