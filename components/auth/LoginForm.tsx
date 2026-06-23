"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import { AuthService } from "@/lib/services/authService";
import { GeneralService } from "@/lib/services/generalService";
import { toast } from "react-hot-toast";

export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // URL ROUTE GUARD: Clear session on load
  useEffect(() => {
    // Angular logic: logout on init to ensure clean state
    GeneralService.logout();
  }, []);

  async function submitSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await AuthService.signIn({ email, password });
      
      if (res.failed || res.statusCode !== 200) {
        setError(res.message || "Invalid credentials.");
        return;
      }

      // Display native success confirmation feedback toast
      toast.success("Sign in successful!");

      // Find OTP method
      const hasTotp = res.data?.twoFactorMethods?.some(
        (d: any) => d.type === "TOTP" && d.enabled
      );
      const method = hasTotp ? "TOTP" : "EmailOTP";

      // Save tracking information securely for OTP phase
      if (typeof window !== "undefined") {
        sessionStorage.setItem("trackingId", (res as any).trackingKey || "");
        sessionStorage.setItem("otpMethod", method);
      }

      // Brief delay to allow user to register the success status feedback animation
      setTimeout(() => {
        router.push("/verify-otp");
      }, 600);
    } catch (err: any) {
      console.error(err);
      setError("Sign in failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#FCFCFD]
        flex
        items-center
        justify-center
        px-4
      "
    >
      {/* Background Pattern */}
      <div
        className="
          absolute
          bottom-0
          left-0
          w-full
          h-[200px]
          bg-bottom 
          bg-cover
          bg-no-repeat
          opacity-40
          pointer-events-none
        "
        style={{
          backgroundImage: "url('/assets/vectors/auth-pattern.svg')",
        }}
      />

      {/* Content */}
      <section
        className="
          relative
          w-full
          max-w-[343px] 
          flex 
          flex-col
          items-center
          -mt-[160px]
        "
        aria-label="Sign in"
      >
        {/* Logo */}
        <div className="mb-[15px]">
          <Brand logo="CardCore" />
        </div>

        {/* Heading */}
        <div
          className="
            flex
            flex-col
            items-center
            text-center
            gap-3
            mb-[30px]
          "
        >
          <h1
            className="
              text-[28px]
              leading-[42px]
              font-[700]
              tracking-[-0.5px]
              text-[#09245A]
            "
          >
            Welcome back!
          </h1>

          <p
            className="
              text-[16px]
              leading-[24px]
              text-[#686D78]
              font-[400]
            "
          >
            Please, sign in to your account.
          </p>
        </div>

        {/* Form */}
        <form
          className="
            w-full
            flex
            flex-col
            gap-4
          "
          onSubmit={submitSignIn}
        >
          {error && (
            <div className="text-red-500 text-[13px] font-[500] bg-red-50 border border-red-100 rounded-[8px] p-3 text-center">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-2">
            <label
              className="
                text-[14px]
                font-[600]
                text-[#686D78]
              "
            >
              Email
            </label>

            <input
              autoComplete="email"
              inputMode="email"
              placeholder="example@mail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="
                w-full
                h-[40px]
                rounded-[8px]
                border
                border-[#D7DBE7]
                bg-white
                px-4
                text-[15px]
                placeholder:text-[12px]
                outline-none
                transition-all
                placeholder:text-[#9CA3AF]
                disabled:bg-gray-50
                disabled:text-gray-400
              "
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              className="
                text-[14px]
                font-[600]
                text-[#686D78]
              "
            >
              Password
            </label>

            <div className="relative">
              <input
                autoComplete="current-password"
                placeholder="************"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="
                  w-full
                  h-[40px]
                  rounded-[8px]
                  border
                  border-[#D7DBE7]
                  bg-white
                  px-4
                  pr-12
                  text-[15px]
                  placeholder:text-[11px]
                  outline-none
                  transition-all
                  placeholder:text-[#9CA3AF]
                  disabled:bg-gray-50
                  disabled:text-gray-400
                "
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-[#686D78]
                  w-[18px] h-[18px]
                " 
              >
                <Icon name="eye" />
              </button>
            </div>
          </div>

          {/* Submit */} 
          <button
            className={`
              w-full
              h-[40px]
              rounded-md
              bg-[#091D4A]
              text-white
              text-[16px]
              font-[600]
              mt-1
              transition-all
              ${loading ? "cursor-not-allowed" : "hover:bg-[#061433]"}
            `}
            type="submit"
            disabled={loading}
          >
            {loading ? <LoadingContent label="" /> : "Sign In"}
          </button>
        </form>
      </section>
    </main>
  );
}
