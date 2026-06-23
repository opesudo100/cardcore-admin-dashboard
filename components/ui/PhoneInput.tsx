"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import LocationService, { ICountry } from "@/lib/services/locationService";

interface PhoneInputProps {
  value: number | string | null;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  disableCountry?: boolean;
  max?: boolean;
  onChange: (value: number | null) => void;
  getCountryCode?: (code: string) => void;
  onSubmit?: () => void;
}

export const PhoneInput = ({
  value,
  label = "",
  placeholder = "",
  disabled = false,
  error = "",
  disableCountry = false,
  max = false,
  onChange,
  getCountryCode,
  onSubmit,
}: PhoneInputProps) => {
  const [countryCode, setCountryCode] = useState("234");
  const [countryFlag, setCountryFlag] = useState("234 🇳🇬");
  const [countries, setCountries] = useState<ICountry[]>([]);

  useEffect(() => {
    LocationService.getCountries().then(setCountries);
  }, []);

  useEffect(() => {
    if (getCountryCode) {
      getCountryCode("+" + countryCode);
    }
  }, [countryCode, getCountryCode]);

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      const numericValue = inputValue === "" ? null : parseInt(inputValue, 10);
      onChange(numericValue);
    }
  };

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const opt = e.target.value;
    const newCode = opt.slice(0, opt.lastIndexOf("-")).replace("+", "");
    const newFlag = opt.replaceAll("-", " ").replace("+", "");
    
    setCountryCode(newCode);
    setCountryFlag(newFlag);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-[5px] w-full">
      {label && (
        <label className="text-gray-500 text-[14px] font-medium">
          {label}
        </label>
      )}
      <div
        className={`border flex items-center rounded-[8px] h-[43px] focus-within:ring-2 focus-within:ring-[#bbcdfc86] pr-[12px] transition-all ${
          error
            ? "border-red-500 bg-red-50"
            : "border-[#C7C7C7] focus-within:border-transparent"
        }`}
      >
        <div className="w-[100px] items-center justify-center overflow-hidden relative border-r flex h-full">
          <span className="flex items-center h-full text-gray-700 text-[14px]">
            +{countryFlag}
          </span>
          <select
            className="absolute cursor-pointer left-0 bottom-0 right-0 opacity-0 top-0 w-full h-full"
            value={`${countryCode}-${countryFlag.split(' ').slice(-1)[0]}`}
            onChange={handleCountryChange}
            disabled={disableCountry}
          >
            {countries.map((c, index) => (
              <option key={`${c.isoCode}-${index}`} value={`${c.phonecode}-${c.flag}`}>
                {c.phonecode} {c.name}
              </option>
            ))}
          </select>
        </div>
        <input
          className="w-full outline-none h-full px-[12px] border-none bg-transparent text-gray-700 text-[14px]"
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          value={value === null || value === undefined ? "" : value.toString()}
          onChange={handlePhoneChange}
          onKeyDown={handleKeyDown}
          maxLength={max ? 10 : 20}
        />
      </div>
      <span className="text-[10px] font-normal h-[8px] text-red-500">
        {error}
      </span>
    </div>
  );
};
