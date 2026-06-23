"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { AuthService } from "@/lib/services/authService";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface TwoFactorAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode?: string;
  secretKey?: string;
  hideCloseOption?: boolean;
}

export const TwoFactorAuthModal = ({
  isOpen,
  onClose,
  qrCode = "",
  secretKey = "",
  hideCloseOption = false,
}: TwoFactorAuthModalProps) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setOtp(Array(6).fill(""));
      setCopied(false);
      setErrorMessage("");
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (!hideCloseOption) onClose();
  };

  const handleCopyKey = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value !== "" && !/^[0-9]$/.test(value)) return;
    
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullOtp = updatedOtp.join("");
    if (fullOtp.length === 6) {
      create2fa(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("");
      setOtp(digits);
      create2fa(pastedData);
      inputRefs.current[5]?.focus();
    }
  };

  const create2fa = async (code: string) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const res = await AuthService.activate2fa({
        code,
        method: "TOTP",
      });
      if ((res.statusCode === 200) || (!res.failed && res.statusCode !== undefined)) {
        toast.success("2FA setup completed");
        onClose();
      } else {
        toast.error("Request failed");
        setErrorMessage(res.message || "Request failed");
      }
    } catch (err: any) {
      toast.error("Request failed");
      if (err?.response?.data?.statusCode === 400) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex fixed top-0 left-0 right-0 bottom-0 bg-[#00000085] overflow-y-auto overflow-x-visible z-[9999999] p-[16px] items-center justify-center animate-in fade-in duration-300">
      <div className="min-h-screen w-full flex justify-center items-center">
        <div onClick={handleClose} className="absolute left-0 right-0 bottom-0 top-0"></div>
        <div className="bg-[#fff] overflow-hidden z-[9999999999] relative rounded-[5px] w-full h-[calc(100vh-50px)] sm:max-h-[750px] sm:overflow-visible scrollbar-hidden overflow-y-auto sm:p-[40px] sm:px-[40px] px-[16px] p-[20px] pt-[40px] pb-[40px] sm:max-w-[900px] flex flex-col gap-[20px] animate-in zoom-in-95 duration-300">
          
          <div className="flex bg-[#fff] flex-col relative">
            <span className="sm:text-[27px] text-[24px] font-[600] text-[#091D4A]">
              Two Factor Authentication
            </span>
            <span className="text-gray-400 sm:text-[14px] text-[12px] mt-2">
              Scan the QR code from your authenticator app or manually enter the code displayed on the app.
            </span>
            {!hideCloseOption && (
              <Image
                onClick={handleClose}
                className="absolute sm:top-0 top-[-20px] sm:right-0 right-[-10px] cursor-pointer"
                src="/assets/icons/close_.svg"
                alt="Close"
                width={15}
                height={15}
              />
            )}
          </div>

          <div className="flex flex-col gap-[16px]">
            {errorMessage && (
              <span className="text-red-600 m-auto bg-[#ff000028] w-fit text-center px-[10px] rounded-[5px] font-[500] text-[14px] py-1">
                {errorMessage}
              </span>
            )}

            <div className="flex gap-[40px] flex-wrap justify-center sm:justify-start">
              <div className="flex flex-col">
                <div className="w-[300px] h-[300px] bg-[#fff] border border-gray-200 rounded-t-[10px] overflow-hidden flex items-center justify-center p-4">
                  {qrCode ? (
                    <QRCode value={qrCode} size={280} level="M" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      <LoadingContent label="Generating QR Code..." spinnerClassName="h-4 w-4 border-gray-300 border-t-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex bg-gray-50 flex-col max-w-[300px] gap-1 w-full p-3 border border-gray-200 border-t-0 rounded-b-[10px]">
                  <span className="text-slate-600 text-[12px]">
                    Can&apos;t scan the QR code?
                  </span>
                  <span className="text-[10px] text-slate-600">
                    Enter the code below manually into the app
                  </span>
                  <div className="flex flex-col mt-2">
                    <span className="bg-gray-100 px-[16px] w-full flex items-center gap-4 p-2 rounded-[4px] overflow-hidden">
                      <code className="whitespace-nowrap truncate text-[11px] flex-1">
                        {secretKey || qrCode || "..."}
                      </code>
                      <Image
                        onClick={() => handleCopyKey(secretKey || qrCode)}
                        className="cursor-pointer w-[14px] opacity-60 hover:opacity-100 transition-opacity"
                        src="/assets/icons/copy.svg"
                        alt="Copy"
                        width={14}
                        height={14}
                      />
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[16px] items-center flex-1 min-w-[280px]">
                <span className="text-center text-gray-500 text-[14px]">
                  Enter the 6 digit code on your authenticator app
                </span>
                
                <div className="flex gap-2 sm:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      disabled={loading}
                      className="w-[40px] h-[50px] sm:w-[45px] sm:h-[45px] border border-gray-300 rounded-[5px] text-center text-[18px] font-sm focus:border-[#091D4A] outline-none transition-all disabled:bg-gray-50"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="absolute top-0 left-0 w-full h-full right-0 bottom-0 flex items-center justify-center bg-[#ffffffac] z-[100]">
              <span className="w-[45px] h-[45px] border-2 border-l-[#fff] border-[#091D4A] rounded-full animate-spin"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
