"use client";

import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { TwoFactorAuthModal } from "@/components/modals/TwoFactorAuthModal";
import { AuthService } from "@/lib/services/authService";
import { GeneralService } from "@/lib/services/generalService";
import toast from "react-hot-toast";

type BasicInfoTabProps = {
  user?: Record<string, any>;
};

export const BasicInfoTab = ({ user: initialUser }: BasicInfoTabProps) => {
  const pathname = usePathname();
  const isCloudCard = pathname.includes("/cloudcard");
  
  const [user, setUser] = useState<any>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [showPasswordUpdate, setShowPasswordUpdate] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPasswords, setLoadingPasswords] = useState(false);
  const [loading2fa, setLoading2fa] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secretKey, setSecretKey] = useState("");

  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUserData = useCallback(async () => {
    const storedUser = GeneralService.getStorageData("core");
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
    } else {
      setLoading(true);
      const res = await GeneralService.getUserData();
      if (res.statusCode === 200) {
        setUser(GeneralService.getStorageData("core"));
      } else {
        toast.error(res.message);
      }
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const passwordValidators = [
    { id: 'length', label: 'At least 8 characters long', regex: /.{8,}/ },
    { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
    { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
    { id: 'numeric', label: 'One number', regex: /[0-9]/ },
    { id: 'special', label: 'One special character', regex: /[!@#$%^&*(),.?":{}|<>]/ },
  ];

  const validatePassword = (password: string) => {
    for (const validator of passwordValidators) {
      if (!validator.regex.test(password)) {
        return validator.label;
      }
    }
    return "";
  };

  const handlePasswordChange = (name: string, value: string) => {
    if (name === "oldPassword") setOldPassword(value);
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);

    let error = "";
    if (value === "") {
      error = "Required";
    } else if (name === "newPassword") {
      error = validatePassword(value);
    } else if (name === "confirmPassword" && value !== newPassword) {
      error = "Passwords do not match";
    }

    setPasswordErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePasswordSubmit = async () => {
    const errors = {
      oldPassword: oldPassword === "" ? "Required" : "",
      newPassword: validatePassword(newPassword),
      confirmPassword: confirmPassword !== newPassword ? "Passwords do not match" : (confirmPassword === "" ? "Required" : ""),
    };

    if (Object.values(errors).some(e => e !== "")) {
      setPasswordErrors(errors);
      return;
    }

    setLoadingPasswords(true);
    try {
      const res = await AuthService.updatePassword({
        oldPassword,
        password: newPassword,
        passwordConfirmation: newPassword, // Angular used oldPassword here in the snippet, but typically it's newPassword
      });

      if (res.statusCode === 200) {
        toast.success("Password updated successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordUpdate(false);
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoadingPasswords(false);
    }
  };

  const enable2fa = async () => {
    setLoading2fa(true);
    try {
      const res = await AuthService.enable2fa({ method: "TOTP", enable: true });
      if ((res.statusCode === 200) || (!res.failed && res.statusCode !== undefined)) {
        setQrCode(res.data?.["totp-url"] || res["totp-url"] || "");
        setSecretKey(res.data?.["totp-secret"] || res["totp-secret"] || "");
        setShow2FAModal(true);
      } else {
        toast.error(res.message || "Failed to enable 2FA");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading2fa(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 flex flex-col gap-[30px] py-[20px] animate-in fade-in duration-500">
      {/* PERSONAL INFO */}
      <div className="flex flex-col">
        <span className="text-[18px] font-[600]">Personal Information</span>
        <span className="text-gray-500 text-[14px] font-[400]">
          Your personal information, roles and permissions.
        </span>
      </div>

      {/* PERSONAL INFO CARD */}
      <div className="flex flex-col w-full max-w-[700px] shadow-sm border border-[#E5E7EB] rounded-[12px] p-4 gap-6 bg-white sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
          <Input label="First Name" value={user?.firstName} />
          <Input label="Last Name" value={user?.lastName} />
          <Input label="Other Name" value={user?.middleName || user?.otherNames} />
          <Input label="Email" value={user?.emailAddress || user?.email} />
          <Input label="Phone Number" value={user?.phoneNumber} />
        </div>
      </div>

      {/* UPDATE PASSWORD */}
      <div className="border-t border-[#E5E7EB] pt-8">
        <div
          onClick={() => setShowPasswordUpdate(!showPasswordUpdate)}
          className="flex items-start gap-4 cursor-pointer mb-6"
        >
          <div
            className={`w-5 h-5 rounded-full border-2 mt-1 transition-all duration-200 ${
              showPasswordUpdate ? "border-[6px] border-[#091D4A]" : "border-gray-300"
            }`}
          />
          <div>
            <button className="text-[18px] font-[600] text-[#111827]">Update Password</button>
            <p className="text-gray-500 text-[14px] mt-1">
              Enter a secured password to change your login credentials.
            </p>
          </div>
        </div>

        {showPasswordUpdate && (
          <div className="w-full max-w-[700px] bg-white shadow-sm border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col gap-5 animate-in slide-in-from-top-2 duration-300 sm:p-6">
            <PasswordInput
              label="Old Password"
              placeholder="Enter old password"
              value={oldPassword}
              error={passwordErrors.oldPassword}
              onChange={(v) => handlePasswordChange("oldPassword", v)}
              isVisible={showOldPassword}
              onToggle={() => setShowOldPassword(!showOldPassword)}
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              error={passwordErrors.newPassword}
              onChange={(v) => handlePasswordChange("newPassword", v)}
              isVisible={showNewPassword}
              onToggle={() => setShowNewPassword(!showNewPassword)}
            />
            
            {/* Password Validation List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-[-10px]">
              {passwordValidators.map((v) => {
                const isValid = v.regex.test(newPassword);
                return (
                  <div key={v.id} className="flex items-center gap-2">
                    {isValid ? (
                      <CheckCircle2 size={14} className="text-green-500" />
                    ) : (
                      <XCircle size={14} className="text-gray-300" />
                    )}
                    <span className={`text-[12px] ${isValid ? "text-green-600" : "text-gray-400"}`}>
                      {v.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              error={passwordErrors.confirmPassword}
              onChange={(v) => handlePasswordChange("confirmPassword", v)}
              isVisible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            <button
              disabled={loadingPasswords}
              onClick={handlePasswordSubmit}
              className="bg-[#091D4A] hover:bg-[#10285f] disabled:opacity-70 transition-all duration-200 text-white h-[50px] rounded-[8px] font-[600] text-[14px] mt-2 flex items-center justify-center"
            >
              {loadingPasswords ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2FA */}
      <div className="border-t border-[#E5E7EB] pt-8">
        <div className="flex flex-col">
          <span className="text-[18px] font-[600] text-[#111827]">Two Factor Authentication</span>
          <p className="text-gray-500 text-[14px] mb-4 mt-1">
            To keep your account secure, ensure you have access to your authenticator app.
          </p>
        </div>
        <div className="w-full max-w-[700px] bg-white shadow-sm border border-[#E5E7EB] rounded-[12px] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:p-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <p className="text-[15px] font-[600] text-[#111827]">Here&apos;s how to get started</p>
              <span className="text-[12px] text-[#6B7280]">- Download an authenticator app like Google Authenticator or Authy</span>
              <span className="text-[12px] text-[#6B7280]">- Scan the QR code provided in your account settings</span>
              <span className="text-[12px] text-[#6B7280]">- Enter the generated 6-digit code to complete the setup</span>
            </div>
            <button
              onClick={enable2fa}
              disabled={loading2fa}
              className="bg-[#091D4A] w-fit mt-2 text-white px-6 h-[48px] rounded-[10px] font-[600] text-sm flex items-center justify-center disabled:opacity-70"
            >
              {loading2fa ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "Set up 2FA"
              )}
            </button>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 self-center sm:self-auto">
            <Image src="/assets/images/qr.png" alt="QR" width={70} height={70} />
          </div>
        </div>
      </div>

      <TwoFactorAuthModal
        isOpen={show2FAModal}
        qrCode={qrCode}
        secretKey={secretKey}
        onClose={() => setShow2FAModal(false)}
      />
    </div>
  );
};

// HELPER COMPONENTS
const Input = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[14px] text-[#374151] font-[500]">{label}</label>
    <input
      disabled
      value={value || "N/A"}
      className="w-full min-w-0 h-[50px] border border-[#D1D5DB] px-4 rounded-[8px] bg-gray-50 text-[14px] text-[#111827] outline-none"
    />
  </div>
);

const PasswordInput = ({ 
  label, 
  placeholder, 
  value,
  error,
  onChange,
  isVisible, 
  onToggle 
}: { 
  label: string; 
  placeholder: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}) => (
  <div className="flex flex-col gap-2">
    <div className="flex justify-between">
      <label className="text-[14px] text-[#374151] font-[500]">{label}</label>
      {error && <span className="text-[12px] text-red-500 font-medium">{error}</span>}
    </div>
    <div className="relative">
      <input
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-[50px] border rounded-[8px] px-4 pr-12 text-[14px] outline-none transition-all ${
          error ? "border-red-500 focus:border-red-500" : "border-[#D1D5DB] focus:border-[#091D4A]"
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280]"
      >
        {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);
