"use client";

import { useState, useRef, useEffect } from "react";

interface SearchProps {
  onSearch: (text: string) => void;
  onSubmit: (text: string) => void;
}

export const Search = ({ onSearch, onSubmit }: SearchProps) => {
  const [showInput, setShowInput] = useState(false);
  const [searchText, setSearchText] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close input if it's empty
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) && 
        searchText.trim() === ""
      ) {
        setShowInput(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchText]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onSearch(value);
  };

  const handleSubmit = () => {
    onSubmit(searchText);
  };

  return (
    <div 
      ref={containerRef} 
      className="h-[40px] w-fit max-w-full flex items-center search-container sm:h-[45px]"
    >
      {!showInput ? (
        <img
          src="/assets/icons/search.svg"
          alt="search"
          onClick={() => setShowInput(true)}
          className="sm:w-[24px] w-[20px] cursor-pointer search-icon"
        />
      ) : (
        <div className="flex h-[40px] w-[min(180px,calc(100vw-104px))] items-center rounded-[10px] bg-[#F4F5F7] px-[8px] sm:h-[45px] sm:w-[180px]">
          <img
            src="/assets/icons/search.svg"
            alt="search"
            onClick={handleSubmit}
            className="sm:w-[18px] w-[15px] cursor-pointer"
          />
          <input
            type="text"
            value={searchText}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-full w-full px-2 bg-transparent outline-none border-none placeholder:text-[14px]"
            placeholder="Search"
          />
        </div>
      )}
    </div>
  );
};
