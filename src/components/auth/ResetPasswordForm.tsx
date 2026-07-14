"use client";

import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";
import { useRouter } from "next/navigation";

export function ResetPasswordForm() {
  const router = useRouter();

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
          h-[300px]
          bg-bottom
          bg-cover
          bg-no-repeat
          opacity-40
          pointer-events-none
        "
        style={{
          backgroundImage:
            "url('/assets/vectors/auth-pattern.svg')",
        }}
      />

      {/* Content */}
      <section
        className="
          relative
          z-10
          w-full
          max-w-[343px] 
          flex
          flex-col
          items-center
          -mt-[70px]
        "
        aria-label="Reset password"
      >
        {/* Logo */}
        <div className="mb-[24px]">
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
            mb-[40px]
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
            Reset password
          </h1>

          <p
            className="
              text-[16px]
              leading-[24px]
              text-[#686D78]
              font-[400]
            "
          >
            Create a new secure password for your account.
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
          onSubmit={(e) => e.preventDefault()}
        >
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

            <input
              autoComplete="new-password"
              placeholder="************"
              type="password"
              className="
                w-full
                h-[43px]
                rounded-[8px]
                border
                border-[#D7DBE7]
                bg-white
                px-4
                text-[15px]
                outline-none
                transition-all
                placeholder:text-[#9CA3AF]
              "
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label
              className="
                text-[14px]
                font-[600]
                text-[#686D78]
              "
            >
              Confirm password
            </label>

            <input
              autoComplete="new-password"
              placeholder="************"
              type="password"
              className="
                w-full
                h-[43px]
                rounded-[8px]
                border
                border-[#D7DBE7]
                bg-white
                px-4
                text-[15px]
                outline-none
                transition-all
                placeholder:text-[#9CA3AF]
              "
            />
          </div>

          {/* Submit */}
          <button
            className="
              w-full
              h-[47px]
              rounded-md
              bg-[#09245A]
              text-white
              text-[16px]
              font-[600]
              mt-1
              transition-all
              hover:bg-[#09245A]/90
            "
            type="submit"
          >
            Reset Password
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={() =>
              router.push("/login")
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              text-center
              text-[#686D78]
              text-[14px]
              font-[500]
              mt-1
            "
          >
            <span className="rotate-180">
              <Icon name="back" />
            </span>

            Back to Sign In
          </button>
        </form>
      </section>
    </main>
  );
}
