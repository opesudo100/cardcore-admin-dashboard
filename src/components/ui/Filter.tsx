"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { CustomButton } from "./CustomButton";
import { CustomCalendar } from "./CustomCalendar";

type DateRange = {
  startDate?: string;
  endDate?: string;
};

type FilterValue = string | DateRange | "";

type FilterOption =
  | {
      title: string;
      type: "checkbox";
      values: {
        options: string[];
      };
    }
  | {
      title: string;
      type: "date";
    };

interface FilterProps {
  filters: FilterOption[];
  position?: 'left' | 'right';
  onApply: (values: Record<string, FilterValue>) => void;
}

export const Filter = ({ filters, position = 'right', onApply }: FilterProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({});
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [activeDateRange, setActiveDateRange] = useState<'start' | 'end'>('start');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (title: string, value: string) => {
    const isChecked = filterValues[title] === value;
    const newValues = { ...filterValues, [title]: isChecked ? "" : value };
    setFilterValues(newValues);
    setSelectedFilters(newValues[title] === "" ? selectedFilters.filter((item) => item !== title) : [...new Set([...selectedFilters, title])]);
  };

  const handleDateChange = (date: Date, type: 'startDate' | 'endDate') => {
    const formattedDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
    const currentRange = (filterValues["Date range"] as DateRange) || {};
    const newDateRange: DateRange = { ...currentRange, [type]: formattedDate };
    setFilterValues({ ...filterValues, "Date range": newDateRange });
    setSelectedFilters([...new Set([...selectedFilters, 'Date range'])]);
  };

  const clearFilter = () => {
    setFilterValues({});
    setSelectedFilters([]);
    onApply({});
    setShowFilters(false);
  };

  return (
    <div className="relative filter-container" ref={containerRef}>
      <div className="relative cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
        <Image src="/assets/icons/sort.svg" alt="filter" width={24} height={24} className="w-[20px] sm:w-[24px]" />
        {selectedFilters.length > 0 && (
          <span className="text-[10px] absolute -top-2 -right-1 font-bold text-white rounded-full w-[15px] h-[15px] bg-[#081A46] flex items-center justify-center">
            {selectedFilters.length}
          </span>
        )}
      </div>

      {showFilters && (
        <div className={`absolute top-[40px] mt-2 rounded-[16px] ${position === 'right' ? 'right-0' : 'left-0'} w-[min(340px,calc(100vw-32px))] max-h-[calc(100vh-140px)] overflow-y-auto bg-white z-50 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex flex-col border border-gray-100`}>
          
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <span className="text-[18px] font-bold text-[#081A46]">Filters</span>
            <X className="cursor-pointer w-5 h-5 text-gray-400 hover:text-gray-600" onClick={() => setShowFilters(false)} />
          </div>

          <div className="px-5 py-3 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#081A46] bg-[#F4F5F7] px-3 py-1 rounded-full">
              {selectedFilters.length} Filter{selectedFilters.length !== 1 ? 's' : ''} Applied
            </span>
            <span onClick={clearFilter} className="text-[12px] font-medium text-[#081A46] underline cursor-pointer hover:text-[#081A46]/80">Clear All</span>
          </div>

          <div className="flex flex-col">
            {filters.map((filter) => (
              <div key={filter.title} className="border-t border-gray-100">
                <div 
                  className="flex justify-between items-center cursor-pointer px-5 py-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setActiveTab(activeTab === filter.title ? '' : filter.title)}
                >
                  <span className="font-medium text-gray-700 text-[14px]">{filter.title}</span>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform ${activeTab === filter.title ? "rotate-180" : ""}`} />
                </div>

                {activeTab === filter.title && (
                  <div className="bg-white px-5 pb-4">
                    {filter.type === 'checkbox' && (
                      <div className="flex flex-col gap-2">
                        {filter.values.options.map((opt: string) => (
                          <label key={opt} className="flex gap-2 items-center cursor-pointer text-[13px] text-gray-700">
                            <input type="checkbox" checked={filterValues[filter.title] === opt} onChange={() => handleCheckboxChange(filter.title, opt)} className="rounded border-gray-300 text-[#081A46] focus:ring-[#081A46]" />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                    {filter.type === 'date' && (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <button type="button" onClick={() => setActiveDateRange('start')} className={`rounded-[12px] border px-3 py-2 text-left ${activeDateRange === 'start' ? 'border-[#081A46]' : 'border-[#E5E7EB]'}`}>
                            <span className="text-[11px] text-[#A4ACBB]">Start Date</span>
                            <span className="block text-[14px] font-[600]">{(filterValues["Date range"] as DateRange)?.startDate || 'YYYY-MM-DD'}</span>
                          </button>
                          <button type="button" onClick={() => setActiveDateRange('end')} className={`rounded-[12px] border px-3 py-2 text-left ${activeDateRange === 'end' ? 'border-[#081A46]' : 'border-[#E5E7EB]'}`}>
                            <span className="text-[11px] text-[#A4ACBB]">End Date</span>
                            <span className="block text-[14px] font-[600]">{(filterValues["Date range"] as DateRange)?.endDate || 'YYYY-MM-DD'}</span>
                          </button>
                        </div>
                        <div className="flex justify-center w-full">
                          <CustomCalendar
                            date={activeDateRange === 'start' ? (filterValues["Date range"] as DateRange)?.startDate : (filterValues["Date range"] as DateRange)?.endDate}
                            onSelect={(d: Date) => handleDateChange(d, activeDateRange === 'start' ? 'startDate' : 'endDate')}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-gray-100">
            <CustomButton className="h-[46px]" label="Apply" onClick={() => { onApply(filterValues); setShowFilters(false); }} />
          </div>
        </div>
      )}
    </div>
  );
};
