"use client";

import React, { ReactNode } from "react";
import  Toggle  from "./Toggle";


interface TogglerProps {
    checked?: boolean;
    disabled?: boolean;
    label: string;
    desc?: string;
    checkedValue?: string;
    onCheck?: (nextCheckedState: boolean) => void;
    children?: ReactNode; // Handles any nested code blocks (<ng-content>)
}

export default function Toggler({
    checked = false,
    disabled = false,
    label,
    desc,
    checkedValue,
    onCheck,
    children
}: TogglerProps) {
    
    const handleCheck = () => {
        if (!disabled && onCheck) {
            onCheck(!checked);
        }
    };

    return (
        <div className="flex border border-gray-100 p-[16px] w-full justify-between items-center gap-[8px] rounded-[6px]">
            <div 
                onClick={handleCheck} 
                className={`flex items-center justify-between w-full ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
                <div className="flex flex-col">
                    <span
                        className={`${
                            checked ? "text-[#091D4A]" : "text-[#6B7280]"
                        } text-[14px] font-[600] whitespace-nowrap`}
                    >
                        {label}
                    </span>
                    
                    {/* Handles layout structural content injection slot (<ng-content>) */}
                    {children}
                    
                    {desc && (
                        <span
                            className={`text-[#6B7280] text-[12px] transition-opacity ${
                                checked ? "opacity-100" : "opacity-70"
                            }`}
                        >
                            {desc}
                        </span>
                    )}
                </div>
                
                <div
                    onClick={(e) => {
                        e.stopPropagation(); // Avoids firing wrapper div container click twice
                        handleCheck();
                    }}
                    className="flex flex-col text-[11px] gap-[6px] items-center rounded-[4px] p-[10px] px-[13px] bg-gray-50 capitalize select-none min-w-[70px]"
                > 
                    <Toggle 
                        active={checked} 
                        disabled={disabled} 
                        onToggle={handleCheck} 
                    />
                    {checkedValue}
                </div>
            </div>
        </div>
    );
}