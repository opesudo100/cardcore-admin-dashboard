import type { Metric } from "@/types/dashboard.types";
import Image from "next/image";

export function DashboardCard({ metric }: { metric: Metric }) {
  return (
    <article
      className="border-gray-200 border-1 rounded-[4px] shadow-[0_12px_28px_rgba(20,29,43,0.035)] min-h-[120px] grid content-center gap-[9px] px-5 py-5 sm:px-[28px] sm:py-[24px]"
      style={{ background: metric.tint ?? "#ffffff" }}
    >
      <span className="w-[30px] h-[30px] grid place-items-center shrink-0">
        <Image src={`/assets/icons/chart1.svg`} alt="icon" width={30} height={30} />
      </span>
      <strong className="text-[1.35rem] sm:text-[1.5rem] font-[900] leading-none break-words">{metric.value}</strong>
      <p className="text-[#393f49] font-[700] text-[0.85rem] sm:text-[0.90rem] leading-snug">{metric.label}</p>
    </article>
  );
}
