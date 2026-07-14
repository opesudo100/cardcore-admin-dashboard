"use client";

import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { AuthService } from "@/lib/services/authService";
import { GeneralService } from "@/lib/services/generalService";

export function InviteForm() {
  const router = useRouter();
  const params = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const passwordValidators = [
    {
      type: "passwordLength",
      label: "Password must be at least 8 characters long",
      valid: false,
    },
    {
      type: "hasLowerCase",
      label: "Password must contain at least one lowercase letter",
      valid: false,
    },
    {
      type: "hasUpperCase",
      label: "Password must contain at least one uppercase letter",
      valid: false,
    },
    {
      type: "hasNumeric",
      label: "Password must contain at least one number",
      valid: false,
    },
    {
      type: "hasSpecialChar",
      label: "Password must contain at least one special character",
      valid: false,
    },
  ];

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password) && password !== "";
    const hasLowerCase = /[a-z]/.test(password) && password !== "";
    const hasNumeric = /[0-9]/.test(password) && password !== "";
    const hasSpecialChar =
      /[!@#$%^&*(),.?":{}|<>]/.test(password) && password !== "";

    if (!hasLowerCase) {
      return passwordValidators[1].label;
    }
    if (!hasUpperCase) {
      return passwordValidators[2].label;
    }
    if (!hasNumeric) {
      return passwordValidators[3].label;
    }
    if (!hasSpecialChar) {
      return passwordValidators[4].label;
    }
    if (password.length < 8) {
      return passwordValidators[0].label;
    }
    return "";
  };

  const validateForm = () => {
    const err: any = {};
    setErrorMessage("");
    if (password === "") err.password = "Required*";
    else if (validatePassword(password) !== "")
      err.password = validatePassword(password);
    if (confirmPassword === "") err.confirmPassword = "Required*";
    else if (confirmPassword !== password)
      err.confirmPassword = "Passwords does not match*";
    return err;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setLoading(true);
      try {
        const token = params.token as string;
        GeneralService.saveStorageData("secret", token);

        const res = await AuthService.updatePassword({
          password,
          passwordConfirmation: confirmPassword,
          token,
        });

        if (res?.statusCode === 200) {
          toast.success("Account setup successfully");
          router.push("/login");
        } else {
          toast.error(res?.message || "Request failed");
          setErrorMessage(res?.message || "Request failed");
        }
      } catch (err: any) {
        toast.error("Something went wrong, please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChange = (name: "password" | "confirmPassword", value: string) => {
    if (name === "password") setPassword(value);
    else setConfirmPassword(value);

    let newErrors = { ...errors };

    if (value === "") {
      newErrors[name] = "Required";
    } else if (name === "password" && validatePassword(value) !== "") {
      newErrors[name] = validatePassword(value);
    } else if (name === "confirmPassword" && password !== value) {
      newErrors[name] = "Passwords do not match";
    } else if (
      name === "password" &&
      confirmPassword !== "" &&
      confirmPassword !== value
    ) {
      newErrors.confirmPassword = "Passwords do not match";
      newErrors.password = "";
    } else if (
      name === "password" &&
      confirmPassword !== "" &&
      confirmPassword === value
    ) {
      newErrors.confirmPassword = "";
    } else {
      newErrors[name] = "";
    }

    setErrors(newErrors);
  };

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
          backgroundImage: "url('/assets/vectors/auth-pattern.svg')",
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
        aria-label="Invite"
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
            Welcome to Card Core!
          </h1>

          <p
            className="
              text-[16px]
              leading-[24px]
              text-[#686D78]
              font-[400]
            "
          >
            You have been invited to join Sudo Core Card, please provide a secured
            password to setup your account.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="w-full mb-4">
            <span className="text-red-600 text-[14px] w-fit font-[500] bg-[#ff000034] px-[16px] rounded-[10px]">
              {errorMessage}
            </span>
          </div>
        )}

        {/* Form */}
        <form
          className="
            w-full
            flex
            flex-col
            gap-4
          "
          onSubmit={handleSubmit}
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
              value={password}
              onChange={(e) => handleChange("password", e.target.value)}
              disabled={loading}
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
            {errors.password && (
              <span className="text-red-600 text-sm">{errors.password}</span>
            )}
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
              Confirm Password
            </label>

            <input
              autoComplete="new-password"
              placeholder="************"
              type="password"
              value={confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              disabled={loading}
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
            {errors.confirmPassword && (
              <span className="text-red-600 text-sm">{errors.confirmPassword}</span>
            )}
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
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
            type="submit"
            disabled={loading}
          >
            {loading ? <LoadingContent label="" /> : "Continue"}
          </button>
        </form>
      </section>
    </main>
  );
}
