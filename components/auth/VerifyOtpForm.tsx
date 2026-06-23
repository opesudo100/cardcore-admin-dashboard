"use client";

import { FormEvent, useRef, ChangeEvent, KeyboardEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import { AuthService } from "@/lib/services/authService";
import { GeneralService } from "@/lib/services/generalService";
import { toast } from "react-hot-toast";

export function VerifyOtpForm() {
  const router = useRouter();
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingStep, setCheckingStep] = useState(true);

  // URL ROUTE GUARD: Kick out rogue manual URL entries that lack a tracking state context
  useEffect(() => {
    const trackingId = typeof window !== "undefined" ? sessionStorage.getItem("trackingId") : null;
    const token = GeneralService.getStorageData("secret");

    // 1. If already fully authed, take them away to dashboard
    if (token && typeof token === "string" && token.trim() !== "") {
      router.replace("/cardcore/dashboard");
      return;
    }

    // 2. If trying to sneak to OTP page without logging in first, push back to login
    if (!trackingId) {
      toast.error("Please sign in first.");
      router.replace("/login");
    } else {
      setCheckingStep(false);
    }
  }, [router]);

  const handleInput = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    const nextValues = [...otpValues];
    nextValues[index] = value;
    setOtpValues(nextValues);

    // If a digit is entered, move to next input
    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits are entered
    const fullCode = nextValues.join("");
    if (fullCode.length === 6) {
      performOtpVerification(fullCode);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const nextValues = [...otpValues];
      
      if (!otpValues[index] && index > 0) {
        nextValues[index - 1] = "";
        setOtpValues(nextValues);
        inputRefs.current[index - 1]?.focus();
      } else {
        nextValues[index] = "";
        setOtpValues(nextValues);
      }
    }
  };

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = otpValues.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }
    await performOtpVerification(code);
  }

  async function performOtpVerification(code: string) {
    if (loading) return;
    
    setLoading(true);
    setError("");

    try {
      const trackingId = typeof window !== "undefined" ? (sessionStorage.getItem("trackingId") || "") : "";
      const method = typeof window !== "undefined" ? (sessionStorage.getItem("otpMethod") || "TOTP") : "TOTP";

      if (!trackingId) {
        setError("Session tracking information was lost. Please sign in again.");
        setLoading(false);
        return;
      }

      const res = await AuthService.verify2fa({
        trackingId,
        code,
        method: method as any,
      });

      if (res.failed || res.statusCode !== 200) {
        setError(res.message || "OTP verification failed. Please try again.");
        setLoading(false);
        return;
      }

      // Display verification feedback notification
      toast.success("Verification successful!");

      // Save encrypted runtime secret natively via global token layout rules
      // Logic matches Angular: res.data.access_token.access_token
      const token = (res.data as any)?.access_token?.access_token || res.data?.token || res.data?.secret || "";
      GeneralService.saveStorageData("secret", token);

      // FIXED: Set the cookie explicitly so the server-side middleware lets us through the door!
      if (typeof window !== "undefined") {
        document.cookie = `secret=${token}; path=/; max-age=86400; SameSite=Strict; Secure`;
      }

      // Fetch user context parameters via static profile loader
      try {
        const userRes = await GeneralService.getUserData();
        if (userRes.statusCode !== 200) {
           console.warn("User profile retrieval partial failure:", userRes.message);
        }
      } catch (userDataErr) {
        console.error("Failed to fetch user data after login:", userDataErr);
      }

      // Clear the short-lived auth tracking variables from storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("trackingId");
        sessionStorage.removeItem("otpMethod");
      }

      // Delay transition briefly so user registers the success visual state feedback
      setTimeout(() => {
        router.push("/cardcore/dashboard");
      }, 600);

    } catch (err: any) {
      console.error(err);
      setError("Incorrect OTP or verification service unavailable. Please check the code.");
      setLoading(false);
    }
  }

  if (checkingStep) {
    return (
      <div className="min-h-screen bg-[#FCFCFD] flex items-center justify-center">
        <div className="text-[#09245A] font-[600]">
          {/* <LoadingContent label="" spinnerClassName="h-4 w-4 border-[#09245A]/20 border-t-[#09245A]" /> */}
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FCFCFD] flex items-center justify-center px-4">
      <div
        className="absolute bottom-0 left-0 w-full h-[260px] bg-bottom bg-cover bg-no-repeat opacity-40 pointer-events-none"
        style={{ backgroundImage: "url('/assets/vectors/auth-pattern.svg')" }}
      />

      <section
        className="relative z-10 w-full max-w-[280px] flex flex-col items-center -mt-[180px]"
        aria-label="Verify one time password"
      >
        <div className="mb-[15px] scale-90">
          <Brand logo="CardCore" />
        </div>

        <div className="flex flex-col items-center text-center gap-2 mb-[24px]">
          <h1 className="text-[24px] leading-[28px] font-[700] tracking-[-0.5px] text-[#09245A]">
            Welcome back!
          </h1>
          <p className="text-[13px] leading-[18px] text-[#686D78] font-[400]">
            Enter the OTP from your<br />
            authentication app.
          </p>
        </div>

        <form className="w-full flex flex-col gap-4" onSubmit={submitOtp}>
          {error && (
            <div className="text-red-500 text-[13px] font-[500] bg-red-50 border border-red-100 rounded-[8px] p-3 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-6 gap-2" aria-label="One time password">
            {Array.from({ length: 6 }).map((_, index) => (
              <input
                key={index}
                ref={(el) => {
                  if (el) inputRefs.current[index] = el;
                }}
                value={otpValues[index]}
                onChange={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={loading}
                aria-label={`OTP digit ${index + 1}`}
                inputMode="numeric"
                maxLength={1}
                className="w-full h-[45px] rounded-[2px] border border-gray-300 bg-white text-center text-[14px] font-[200] text-gray-900 outline-none transition-all   disabled:bg-gray-50 disabled:text-gray-400"
              />
            ))}
          </div> 

          <button
            className={`w-full h-[40px] rounded-[8px] bg-[#091D4A] text-white text-[14px] font-[600] transition-all ${
              loading ? " cursor-not-allowed" : "hover:bg-[#061433]"
            }`}
            type="submit"
            disabled={loading}
          >
            {loading ? <LoadingContent label="" /> : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="inline-flex items-center justify-center gap-1 text-[#686D78] text-[12px] font-[500] mt-1"
          >
            <span className="rotate-180 scale-75">
              <Icon name="back" />
            </span>
            Back to Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
