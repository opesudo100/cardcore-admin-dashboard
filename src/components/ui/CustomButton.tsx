"use client";

interface ButtonProps {
  label: string;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  className?: string;
}

export const CustomButton = ({ 
  label, 
  disabled = false, 
  loading = false, 
  onClick,
  className = "" 
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-full h-[50px] bg-[#081A46] flex items-center justify-center text-white 
        rounded-[10px] transition duration-300 ease-in-out
        ${(disabled || loading) ? "opacity-50 cursor-not-allowed" : "hover:scale-[102%] cursor-pointer"}
        ${className}
      `}
    >
      {loading ? (
        <span className="border-2 border-white animate-spin border-r-transparent rounded-full w-[25px] h-[25px]"></span>
      ) : (
        label
      )}
    </button>
  );  
};