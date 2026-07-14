"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface InstitutionsData {
  pending: number;
  active: number;
}

interface CoreInstitutionChartsProps {
  institutions?: InstitutionsData;
}

export function CoreInstitutionCharts({
  institutions = { pending: 0, active: 0 },
}: CoreInstitutionChartsProps) {
  
  // Transform data dynamically for Chart.js
  const chartData = useMemo(() => {
    const pendingVal = institutions.pending || 0;
    const activeVal = institutions.active || 0;
    const hasData = pendingVal > 0 || activeVal > 0;

    return {
      labels: ["Active", "Pending"],
      datasets: [
        {
          // Mapped matching your original index color configurations: [Active, Pending]
          data: hasData ? [activeVal, pendingVal] : [1, 1],
          backgroundColor: hasData ? ["#081A46", "#EDEEFF"] : ["#081A46", "#EDEEFF"],
          borderWidth: 0,
          spacing: hasData ? 4 : 0,
          borderRadius: 4,
        },
      ],
    };
  }, [institutions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 240, // Replicates the Unovis semi-circle gauge range
    rotation: 240,     // Perfectly centers the arch loop top-down
    cutout: "82%",      // Matches your arc width presentation perfectly
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="shadow_ w-full flex flex-col p-[20px] bg-white border border-gray-100 rounded-[8px] md:col-span-6 lg:col-span-5">
      {/* Header unchanged */}
      <div className="flex justify-between w-full items-center">
        <div className="flex gap-[8px]">
          <img className="w-[20px]" src="/assets/icons/dark-institutions.svg" alt="" />
          <span className="xl:text-[20px] text-[18px] font-[600]">Institutions</span>
        </div>
      </div>

      {/* Dynamic Render Frame - Replaces your CSS border-trick engine inside your exact constraints */}
      <div className="w-full flex justify-center items-center">
        <div className="flex items-center h-[140px] m-auto w-[140px] justify-center relative top-3">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Metrics footer row with data hook labels */}
      <div className="flex gap-[20px] w-full mt-4">
        <div className="flex gap-[8px] items-center w-full">
          <span className="w-[20px] h-[40px] bg-[#EDEEFF] rounded-[2px]" />
          <div className="flex flex-col">
            <span className="text-gray-500 text-[11px]">Pending Institutions</span>
            <span className="text-[14px] font-[600] text-[#323232]">
              {(institutions.pending || 0).toLocaleString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-[8px] items-center w-full">
          <span className="w-[20px] h-[40px] bg-[#081A46] rounded-[2px]" />
          <div className="flex flex-col">
            <span className="text-gray-500 text-[11px]">Active Institutions</span>
            <span className="text-[14px] font-[600] text-[#323232]">
              {(institutions.active || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}