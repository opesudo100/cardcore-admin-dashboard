"use client";

import { useMemo, useState } from "react";

interface CalendarProps {
  date?: string;
  onSelect: (date: Date) => void;
}

type ViewMode = "day" | "month" | "year";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function parseLocalDate(value?: string) {
  if (!value) {
    return new Date();
  }

  const parts = value.split("-").map((part) => Number(part));
  if (parts.length === 3 && parts.every((part) => Number.isFinite(part))) {
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function formatLocalDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfMonth(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function addMonths(value: Date, amount: number) {
  return new Date(value.getFullYear(), value.getMonth() + amount, 1);
}

function addYears(value: Date, amount: number) {
  return new Date(value.getFullYear() + amount, value.getMonth(), 1);
}

export const CustomCalendar = ({ date, onSelect }: CalendarProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [currentDate, setCurrentDate] = useState<Date>(() => parseLocalDate(date));

  const selectedDate = useMemo(() => (date ? parseLocalDate(date) : null), [date]);

  const monthStart = startOfMonth(currentDate);
  const firstVisibleDay = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - monthStart.getDay());
  const visibleDates = Array.from({ length: 42 }, (_, index) => {
    const day = new Date(firstVisibleDay);
    day.setDate(firstVisibleDay.getDate() + index);
    return day;
  });

  const decadeStart = Math.floor(currentDate.getFullYear() / 10) * 10;
  const visibleYears = Array.from({ length: 12 }, (_, index) => decadeStart - 1 + index);

  const isCurrentMonth = (value: Date) =>
    value.getFullYear() === currentDate.getFullYear() && value.getMonth() === currentDate.getMonth();

  const goPrevious = () => {
    if (viewMode === "day") {
      setCurrentDate((value) => addMonths(value, -1));
      return;
    }

    if (viewMode === "month") {
      setCurrentDate((value) => addYears(value, -1));
      return;
    }

    setCurrentDate((value) => addYears(value, -10));
  };

  const goNext = () => {
    if (viewMode === "day") {
      setCurrentDate((value) => addMonths(value, 1));
      return;
    }

    if (viewMode === "month") {
      setCurrentDate((value) => addYears(value, 1));
      return;
    }

    setCurrentDate((value) => addYears(value, 10));
  };

  const selectYear = (year: number) => {
    setCurrentDate((value) => new Date(year, value.getMonth(), 1));
    setViewMode("month");
  };

  const selectMonth = (monthIndex: number) => {
    setCurrentDate((value) => new Date(value.getFullYear(), monthIndex, 1));
    setViewMode("day");
  };

  const selectDay = (day: Date) => {
    onSelect(day);
  };

  return (
    <div className="w-full max-w-[290px] rounded-[4px] bg-white">
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={goPrevious}
          className="w-9 text-left text-[24px] leading-none text-[#C6C6C6] transition-colors hover:text-[#9CA3AF]"
          aria-label="Previous period"
        >
          «
        </button>

        {viewMode === "day" && (
          <div className="flex items-center gap-2 text-[18px] font-[600] text-[#2A2A2A]">
            <button type="button" onClick={() => setViewMode("year")} className="transition-colors hover:text-[#081A46]">
              {currentDate.getFullYear()}
            </button>
            <button type="button" onClick={() => setViewMode("month")} className="transition-colors hover:text-[#081A46]">
              {MONTH_LABELS[currentDate.getMonth()]}
            </button>
          </div>
        )}

        {viewMode === "month" && (
          <button
            type="button"
            onClick={() => setViewMode("year")}
            className="text-[18px] font-[600] text-[#2A2A2A] transition-colors hover:text-[#081A46]"
          >
            {currentDate.getFullYear()}
          </button>
        )}

        {viewMode === "year" && (
          <button
            type="button"
            onClick={() => setViewMode("month")}
            className="text-[18px] font-[600] text-[#2A2A2A] transition-colors hover:text-[#081A46]"
          >
            {decadeStart}-{decadeStart + 9}
          </button>
        )}

        <button
          type="button"
          onClick={goNext}
          className="w-9 text-right text-[24px] leading-none text-[#C6C6C6] transition-colors hover:text-[#9CA3AF]"
          aria-label="Next period"
        >
          »
        </button>
      </div>

      <div className="border-b border-[#E7E7E7]" />

      {viewMode === "day" && (
        <div className="px-2 pb-4 pt-3">
          <div className="grid grid-cols-7 text-center text-[14px] font-[500] text-[#2D2D2D]">
            {WEEKDAY_LABELS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-y-0 text-center text-[14px]">
            {visibleDates.map((day) => {
              const selected = selectedDate ? isSameDay(day, selectedDate) : false;
              const currentMonth = isCurrentMonth(day);

              return (
                <button
                  key={formatLocalDate(day)}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-[4px] transition-colors ${
                    selected
                      ? "bg-[#081A46] text-white"
                      : currentMonth
                        ? "text-[#2E2E2E] hover:bg-[#F4F5F7]"
                        : "text-[#C8CBD2]"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "month" && (
        <div className="grid grid-cols-3 gap-x-3 gap-y-8 px-3 py-8 text-center text-[16px] text-[#2D2D2D]">
          {MONTH_LABELS.map((label, index) => {
            const selected =
              selectedDate?.getFullYear() === currentDate.getFullYear() && selectedDate?.getMonth() === index;

            return (
              <button
                key={label}
                type="button"
                onClick={() => selectMonth(index)}
                className={`mx-auto rounded-[3px] px-4 py-1 transition-colors ${
                  selected ? "bg-[#081A46] text-white" : "hover:bg-[#F4F5F7]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {viewMode === "year" && (
        <div className="grid grid-cols-3 gap-x-3 gap-y-8 px-3 py-8 text-center text-[16px] text-[#2D2D2D]">
          {visibleYears.map((year) => {
            const selected = (selectedDate ?? currentDate).getFullYear() === year;
            const insideDecade = year >= decadeStart && year <= decadeStart + 9;

            return (
              <button
                key={year}
                type="button"
                onClick={() => selectYear(year)}
                className={`mx-auto rounded-[3px] px-4 py-1 transition-colors ${
                  selected
                    ? "bg-[#081A46] text-white"
                    : insideDecade
                      ? "text-[#2D2D2D] hover:bg-[#F4F5F7]"
                      : "text-[#C8CBD2]"
                }`}
              >
                {year}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
