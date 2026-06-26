"use client";

import React, { useEffect, useState } from "react";
import { CoreInstitutionCharts } from "@/components/charts/CoreInstitutionCharts";
import { CardProgramsChart } from "@/components/charts/CardProgramsChart";
import { CoreTransactionsChart } from "@/components/charts/CoreTransactionsChart";
import { DashboardService } from "@/lib/services/dashboardService";
import { GeneralService } from "@/lib/services/generalService";
import { toast } from "react-hot-toast";

export function CardCoreDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [metrics, setMetrics] = useState({
    totalCardPrograms: 0,
    totalCards: 0,
    cards: {
      physical: 0,
      virtual: 0,
    },
    institutions: {
      pending: 0,
      active: 0,
    },
  });

  const [transactionData, setTransactionData] = useState<number[]>([]);
  const [cardSchemeData, setCardSchemeData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user data from storage
        const user = GeneralService.getStorageData("core");
        setUserData(user);

        // Fetch metrics
        const metricsRes = await DashboardService.getMetrics();
        if (metricsRes?.statusCode === 200 || !metricsRes?.failed) {
          const data = metricsRes.data || metricsRes;
          setMetrics({
            totalCardPrograms: data.totalCardPrograms || 0,
            totalCards: data.totalCards || 0,
            cards: {
              physical: data.cards?.physical || data.physicalCards || 0,
              virtual: data.cards?.virtual || data.virtualCards || 0,
            },
            institutions: {
              pending: data.pendingInstitutions || 0,
              active: data.activeInstitutions || 0,
            },
          });
        }

        // Fetch transactions
        const transRes = await DashboardService.getTransactions();
        if (transRes?.statusCode === 200 || !transRes?.failed) {
          const data = transRes.data || transRes;
          setTransactionData(data);
        }

        // Fetch card scheme distribution
        const schemeRes = await DashboardService.getCardScheme();
        if (schemeRes?.statusCode === 200 || !schemeRes?.failed) {
          const data = schemeRes.data || schemeRes;
          setCardSchemeData(data);
        }

      } catch (error: any) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-[30px] ">
      {/* Greeting Header */}
      <div className="w-full flex flex-col gap-[20px]">
        <div className="flex items-center">
          <span className="text-[20px] font-[800] text-[#252F3F]">
            Hello {userData?.firstName || "User"} 👋
          </span>
        </div>
      </div>

      {/* Main Top Section Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 items-stretch gap-[20px]">
        {/* Left Hand Dual Statistics Column Block */}
        <div className="w-full flex flex-col gap-[20px] md:col-span-6 lg:col-span-3 shadow-sm ">
          <div className="flex flex-col p-[20px] border border-gray-100 min-h-[120px] bg-[#edeeff8f]">
            <img
              className="w-[30px] mb-2"
              src="/assets/icons/chart1.svg"
              alt="Metrics chart icon 1"
            />
            <span className="xl:text-[25px] text-[20px] font-[600] text-[#323232]">
              {metrics.totalCardPrograms.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Total Card Programs
            </span>
          </div>

          <div className="flex flex-col p-[20px] border border-gray-100 min-h-[120px] bg-[#FAFAF9]">
            <img
              className="w-[30px] mb-2"
              src="/assets/icons/chart1.svg"
              alt="Metrics chart icon 2"
            />
            <span className="xl:text-[25px] text-[20px] font-[600] text-[#323232]">
              {metrics.totalCards.toLocaleString()}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Total Cards
            </span>
          </div>
        </div>

        {/* Center Section: Semi-circle Institution Gauge Hook */}
        <CoreInstitutionCharts institutions={metrics.institutions} />

        {/* Right Hand Side: Cards Type Proportional Breakdown Block */}
        <div className="flex flex-col md:col-span-6 lg:col-span-4 h-full justify-evenly border border-gray-200 p-[20px] min-h-[220px] sm:min-h-[260px] bg-white shadow-sm">
          <div className="flex flex-row gap-[16px] items-center h-full border-b border-gray-100 pb-4">
            <img
              className="w-[40px] h-[40px]"
              src="/assets/images/card__.svg"
              alt="Physical graphic vector"
            />
            <div className="flex flex-col">
              <span className="xl:text-[25px] text-[20px] font-[600] text-[#323232]">
                {metrics.cards.physical.toLocaleString()}
              </span>
              <span className="text-[13px] text-gray-500 font-medium">
                Physical Cards
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-[16px] items-center h-full pt-4">
            <img
              className="w-[40px] h-[40px]"
              src="/assets/images/card__.svg"
              alt="Virtual graphic vector"
            />
            <div className="flex flex-col">
              <span className="xl:text-[25px] text-[20px] font-[600] text-[#323232]">
                {metrics.cards.virtual.toLocaleString()}
              </span>
              <span className="text-[13px] text-gray-500 font-medium">
                Virtual Cards
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Programs Bar Chart Frame */}
      <div className="w-full mt-[10px] sm:mt-[20px] col-span-12 min-w-0">
        <CardProgramsChart cardData={cardSchemeData} />
      </div>

      {/* New Core Transactions Area Chart Frame */}
      <div className="w-full mt-[10px] sm:mt-[20px] col-span-12 min-w-0">
        <CoreTransactionsChart transactionData={transactionData} />
      </div>
    </div>
  );
}
