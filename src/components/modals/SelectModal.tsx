"use client";

import { X } from "lucide-react";
import { CustomSelect } from "../ui/CustomSelect";
// import { CustomSelect } from "./CustomSelect";

interface SelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: any[];
  onSelect: (opt: any) => void;
}

export const SelectModal = ({ isOpen, onClose, title, options, onSelect }: SelectModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white w-[400px] rounded-[16px] p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#081A46]">{title}</h3>
          <X className="cursor-pointer text-gray-400" onClick={onClose} />
        </div>
        <CustomSelect 
          options={options} 
          placeholder="Select an option..." 
          onSelect={(opt) => { onSelect(opt); onClose(); }} 
        />
      </div>
    </div>
  );
};