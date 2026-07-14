"use client";

import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function CardProgramsChart({ cardData = {} }: { cardData?: any }) {
  // Transform data logic similar to Angular code
  const months = Object.keys(cardData);
  const labels = months.length > 0 
    ? months.map((month) => month.charAt(0).toUpperCase() + month.slice(1))
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const data = {
    labels,
    datasets: [
      {
        label: "Mastercard",
        data: months.length > 0 
          ? Object.values(cardData).map((monthData: any) => monthData.mastercard || 0)
          : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#eda2397a",
        barThickness: 8,
      },
      {
        label: "Visa",
        data: months.length > 0 
          ? Object.values(cardData).map((monthData: any) => monthData.visa || 0)
          : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#081A46",
        barThickness: 8,
      },
      {
        label: "Verve",
        data: months.length > 0 
          ? Object.values(cardData).map((monthData: any) => monthData.verve || 0)
          : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#6b86ff41",
        barThickness: 8,
      },
      {
        label: "AfriGo",
        data: months.length > 0 
          ? Object.values(cardData).map((monthData: any) => monthData.afrigo || 0)
          : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        backgroundColor: "#06825d73",
        barThickness: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0F172A",
        titleColor: "#fff",
        bodyColor: "#CBD5E1",
        padding: 12,
        cornerRadius: 4,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 2.0,
        ticks: {
          color: "#94A3B8",
          font: { size: 12 },
          stepSize: 0.2,
          callback: (value: any) => value.toFixed(1),
        },
        grid: {
          color: "rgba(189, 189, 189, 0.2)",
          drawTicks: false,
        },
      },
      x: {
        ticks: {
          color: "#94A3B8",
          font: { size: 12 },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  const LegendItem = ({
    color,
    label,
  }: {
    color: string;
    label: string;
  }) => (
    <div className="flex items-center gap-2 text-[13px] font-medium text-slate-600">
      <span
        className="h-[2px] w-[12px] rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );

  return (
    <div className="w-full rounded-none border border-slate-100 bg-white p-6 shadow-sm">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <img className="w-[18px] opacity-70" src="/assets/icons/dark-institutions.svg" alt="" />
          <h2 className="text-[16px] font-bold text-[#252F3F]">
            Card Programs
          </h2>
        </div>

        <div className="relative">
          <select className="appearance-none text-[12px] pl-3 pr-8 py-1.5 rounded-md bg-white text-slate-600 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400">
            <option>2025</option>
            <option>2024</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
          </div>
        </div>
      </div>

      {/* CHART */}
      <div className="h-[280px] w-full">
        <Bar data={data} options={options} />
      </div>

      {/* LEGEND */}
      <div className="mt-8 flex justify-center flex-wrap gap-x-8 gap-y-2">
        <LegendItem color="#eda2397a" label="Mastercard" />
        <LegendItem color="#081A46" label="Visa" />
        <LegendItem color="#6b86ff41" label="Verve" />
        <LegendItem color="#06825d73" label="AfriGo" />
      </div>
    </div>
  );
}