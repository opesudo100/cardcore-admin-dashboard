"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CustomCalendar } from "./CustomCalendar";

type DateInputProps = {
  label: string;
  date: string;
  setDate: (value: string) => void;
  error?: string;
};

export const DateInput = ({ label, date, setDate, error }: DateInputProps) => {
  const [visible, setVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const formatDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Click outside logic
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-[5px] w-full" ref={wrapperRef}>
      <span className="text-gray-500 text-[14px] font-medium">{label}</span>
      
      <div className={`relative border rounded-[8px] h-[43px] p-[12px] flex items-center justify-between cursor-pointer 
        ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
        onClick={() => setVisible(!visible)}
      >
        <span className={date ? "text-gray-700" : "text-gray-400"}>
          {date || "YYYY-MM-DD"}
        </span>
        <Image src="/assets/icons/calenda.svg" alt="calendar" width={20} height={20} />

        {/* Modal/Dropdown */}
        {visible && (
          <div 
            className="absolute right-0 bottom-[calc(100%+12px)] z-50 rounded-[12px] border border-[#E5E7EB] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.12)]"
            onClick={(e) => e.stopPropagation()}
          >
            <CustomCalendar
              key={date || "empty"}
              date={date} 
              onSelect={(d) => {
                setDate(formatDate(d));
                setVisible(false);
              }} 
            />
          </div>
        )}
      </div>
      {error && <span className="text-[10px] text-red-500">{error}</span>}
    </div>
  );
};
