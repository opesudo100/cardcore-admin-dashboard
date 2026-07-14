"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/Input";
import { CustomButton } from "../ui/CustomButton";

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  onSubmit: (val: string) => void;
}

export const InputModal = ({ isOpen, onClose, title, label, onSubmit }: InputModalProps) => {
  const [val, setVal] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white w-[400px] rounded-[16px] p-6 shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[#081A46]">{title}</h3>
          <X className="cursor-pointer text-gray-400" onClick={onClose} />
        </div>
        
        <Input label={label} value={val} onChange={setVal} placeholder="Enter value..." />
        
        <div className="mt-6">
          <CustomButton
            label="Submit" 
            onClick={() => { onSubmit(val); onClose(); }} 
            className="w-full" 
          />
        </div>
      </div>
    </div>
  );
};