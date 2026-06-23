"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

// Register all required modules including Filler for Area charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TransactionsProps {
  transactionData?: any; // Changed from transactionsData to transactionData to match parent
}

export function CoreTransactionsChart({ transactionData = {} }: TransactionsProps) {
  const currentYear = new Date().getFullYear();

  // Extract labels and data from the transactionData object (similar to Angular transformData)
  const keys = Object.keys(transactionData);
  const labels = keys.length > 0 
    ? keys.map((month) => month.charAt(0).toUpperCase() + month.slice(1))
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const chartDataPoints = keys.length > 0 ? Object.values(transactionData) : [];

  const areaData = {
    labels,
    datasets: [
      {
        label: "Transaction Count",
        data: chartDataPoints,
        borderColor: "rgba(8, 26, 70, 0)", // Matching Angular config: transparent border
        borderWidth: 2,
        tension: 0.4, // Curved lines as per Angular config
        
        // --- AREA CHART FILL CONFIGURATION (Gradient) ---
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return undefined;

          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(8, 26, 70, 1)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          return gradient;
        },
        
        // Point styling from Angular config
        pointBackgroundColor: 'rgba(8, 26, 70, 0.8)',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 1,
        pointHoverRadius: 10,
      },
    ],
  };

  const areaOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { 
          color: 'rgba(189, 189, 189, 1)', 
          font: { size: 12 },
          padding: 10
        },
        grid: { 
          color: 'rgba(189, 189, 189, 0.1)',
          drawTicks: false,
        },
      },
      x: {
        ticks: { 
          color: 'rgba(189, 189, 189, 1)', 
          font: { size: 12 } 
        },
        grid: { 
          color: 'rgba(189, 189, 189, 0.4)',
        },
      },
    },
    elements: {
      point: {
        radius: 1,
        borderWidth: 3,
        backgroundColor: 'white',
        borderColor: 'white',
        pointStyle: 'circle',
      },
      line: {
        tension: 0.4,
      },
    },
  };

  return (
    <div className="shadow_sm w-full min-w-0 flex flex-col border border-gray-50 p-4 sm:p-[20px] min-h-[340px] sm:min-h-[380px] bg-white rounded-[4px] shadow-sm">
      {/* Header Panel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex gap-[8px] items-center">
          <img className="w-[20px]" src="/assets/icons/dark-institutions.svg" alt="Transactions icon" />
          <span className="xl:text-[20px] text-[18px] font-[600] text-[#252F3F]">Transactions</span>
        </div>
        
        {/* Year Selector Dropdown Frame */}
        <div className="flex justify-center items-center border border-gray-200 h-[28px] w-[90px] rounded-[4px] px-[8px] cursor-pointer text-[12px] text-gray-600 font-medium">
          <div className="flex w-full justify-between items-center">
            {currentYear}
            <img className="w-[16px] h-[16px] opacity-60" src="/assets/icons/chevron.svg" alt="Arrow option" />
          </div>
        </div>
      </div>

      {/* Area Chart Canvas Canvas Frame */}
      <div className="w-full mt-6 sm:mt-[40px] overflow-x-auto">
        <div className="w-full min-w-[440px] sm:min-w-[550px] h-[260px] sm:h-[300px]">
          <Line data={areaData} options={areaOptions} />
        </div>
      </div>
    </div>
  );
}
