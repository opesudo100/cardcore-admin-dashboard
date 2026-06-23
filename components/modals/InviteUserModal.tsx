"use client";

import { useState } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import { AuthService } from "@/lib/services/authService";
import toast from "react-hot-toast";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: ManagedUser | null;
  mode?: "create" | "edit";
}

type UserRole = {
  role?: string;
  permissions?: string[];
};

type UserMembership = {
  isPrimary?: boolean;
  roles?: UserRole[];
};

type ManagedUser = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  otherNames?: string;
  middleName?: string;
  emailAddress?: string;
  email?: string;
  phoneNumber?: string;
  membership?: UserMembership;
  memberships?: UserMembership[];
};

const ALL_PERMISSIONS = [
  "*", // Changed from "All" to match your Angular project's backend expected wildcard
  "create:user",
  "read:user",
  "update:user",
  "delete:user",
  "invite:user",
  "create:institution",
  "read:institution",
  "update:institution",
  "delete:institution",
  "create:card_program",
  "read:card_program",
  "update:card_program",
  "delete:card_program",
  "create:key",
  "read:key",
  "update:key",
  "delete:key",
  "create:hsm",
  "read:hsm",
  "update:hsm",
  "delete:hsm",
  "read:transaction",
  "reset:password",
];

const getUserMembership = (user?: ManagedUser | null) => user?.membership || user?.memberships?.[0] || {};
const getUserRole = (user?: ManagedUser | null) => getUserMembership(user)?.roles?.[0] || {};
const stripNigeriaCode = (phoneNumber = "") => phoneNumber.replace(/^\+?234/, "");

export const InviteUserModal = ({ isOpen, onClose, user, mode = "create" }: InviteUserModalProps) => {
  const userRole = getUserRole(user);
  const initialRole = userRole.role ? userRole.role.replaceAll("_", " ") : "ADMIN USER";
  const initialPermissions = userRole.permissions?.includes("*")
    ? [...ALL_PERMISSIONS]
    : userRole.permissions || [];

  const [role, setRole] = useState(initialRole);
  const [roleOpen, setRoleOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(initialPermissions);
  const [loading, setLoading] = useState(false);
  const isEdit = mode === "edit" && Boolean(user?._id);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    middleName: user?.otherNames || user?.middleName || "",
    emailAddress: user?.emailAddress || user?.email || "",
    phoneNumber: stripNigeriaCode(user?.phoneNumber || ""),
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePermission = (p: string) => {
    if (p === "*") {
      if (selected.includes("*")) {
        setSelected([]);
      } else {
        setSelected([...ALL_PERMISSIONS]);
      }
      return;
    }
    setSelected((prev) => {
      const filtered = prev.filter((x) => x !== "*");
      if (filtered.includes(p)) {
        return filtered.filter((x) => x !== p);
      } else {
        return [...filtered, p];
      }
    });
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setRoleOpen(false);
    if (selectedRole === "SUPER ADMIN") {
      setSelected([...ALL_PERMISSIONS]);
    } else {
      setSelected([]);
    }
  };

  const handleInvite = async () => {
    if (!formData.firstName || !formData.lastName || !formData.emailAddress || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selected.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        otherNames: formData.middleName,
        emailAddress: formData.emailAddress,
        phoneNumber: "+234" + formData.phoneNumber.replace(/\s+/g, ""),
        roles: [
          {
            role: role.replaceAll(" ", "_"),
            permissions: selected,
          },
        ],
        isPrimary: false,
      };

      const userId = user?._id || "";
      const res = isEdit
        ? await AuthService.updateAdminUser(userId, payload)
        : await AuthService.inviteUser(payload);

      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success(isEdit ? "User updated successfully" : "User invited successfully");
        onClose();
      } else {
        toast.error(res.message || (isEdit ? "Failed to update user" : "Failed to invite user"));
      }
    } catch (err: unknown) {
      const fallbackMessage = isEdit
        ? "An error occurred while updating user"
        : "An error occurred while inviting user";
      const error = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const serverMessage = error.response?.data?.message || error.message || fallbackMessage;
      toast.error(Array.isArray(serverMessage) ? serverMessage.join(" | ") : serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const roles = ["SUPER ADMIN", "ADMIN USER"];
  const perms = ALL_PERMISSIONS;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-3 sm:p-4 sm:items-center">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-[580px] flex-col rounded-[4px] bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 shrink-0 sm:px-8 sm:pt-7">
          <div className="min-w-0">
            <h2 className="text-[20px] font-[700] text-[#111827]">
              {isEdit ? "Edit User" : "Invite User"}
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-1">
              {isEdit
                ? "Update this user's account details, role, and permissions."
                : "Invite a new user to the platform and manage their roles and permissions."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#374151] transition-colors mt-0.5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-5 pb-6 sm:px-8 sm:pb-8 flex flex-col gap-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Name row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field 
              label="First Name" 
              placeholder="e.g John" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange} 
            />
            <Field 
              label="Last Name" 
              placeholder="e.g Doe" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleInputChange} 
            />
          </div>

          {/* Other names + Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-[500] text-[#374151]">Other Names</label>
                <span className="text-[11px] text-[#9CA3AF]">Optional</span>
              </div>
              <input
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="e.g Doe"
                className="h-[40px] border border-[#D1D5DB] rounded-[4px] px-3 text-[13px] outline-none focus:border-[#091D4A] placeholder:text-[#9CA3AF]"
              />
            </div>
            <Field 
              label="Email" 
              placeholder="e.g example@mail.com" 
              name="emailAddress" 
              value={formData.emailAddress} 
              onChange={handleInputChange} 
            />
          </div>

          {/* Phone number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-[500] text-[#374151]">Phone number</label>
            <div className="flex h-[40px] border border-[#D1D5DB] rounded-[4px] overflow-hidden focus-within:border-[#091D4A]">
              <div className="flex items-center gap-1.5 px-3 border-r border-[#D1D5DB] shrink-0 bg-white">
                <span className="text-[16px] leading-none">🇳🇬</span>
                <span className="text-[12px] text-[#374151] font-[500]">+234</span>
              </div>
              <input
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="810 0000 000"
                className="min-w-0 flex-1 px-3 text-[13px] outline-none bg-white placeholder:text-[#9CA3AF]"
              />
            </div>
          </div>

          <div className="h-px bg-[#F3F4F6]" />

          <div className="flex flex-col gap-4">
            <p className="text-[14px] font-[700] text-[#111827]">Manage Roles And Permissions</p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[12px] font-[500] text-[#374151]">Role</span>
              <div className="relative w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setRoleOpen((o) => !o)}
                  className="flex w-full items-center gap-2 h-[36px] px-4 border border-gray-100 rounded-[4px] text-[13px] font-[700] text-[#091D4A] bg-white sm:min-w-[160px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Image src="/assets/icons/db.svg" alt="Admin User" width={16} height={16} />  
                    {role}
                  </div>
                  <ChevronDown size={14} className={`transition-transform ${roleOpen ? "rotate-180" : ""}`} />
                </button>

                {roleOpen && (
                  <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-[4px] shadow-lg z-10 sm:min-w-[160px] py-1">
                    {roles.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => handleRoleSelect(r)}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-[12px] font-[600] text-[#111827] hover:bg-[#F9FAFB] text-left"
                      >
                        <div className="flex items-center gap-2">
                          <Image src="/assets/icons/db.svg" alt="Admin User" width={15} height={15} />
                          {r}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="text-[13px] font-[500] text-[#374151]">Permissions</p>

            <div className="grid grid-cols-1 gap-x-4 gap-y-3 min-[420px]:grid-cols-2 sm:grid-cols-3">
              {perms.map((p) => {
                const checked = p === "*"
                  ? selected.length === perms.length
                  : selected.includes(p);
                return (
                  <label
                    key={p}
                    className="flex items-center gap-2 text-[12px] text-[#374151] font-[500] cursor-pointer select-none"
                  >
                    <span
                      onClick={() => togglePermission(p)}
                      className={`w-[15px] h-[15px] shrink-0 border rounded-[3px] flex items-center justify-center transition-colors cursor-pointer ${
                        checked
                          ? "bg-[#091D4A] border-[#091D4A]"
                          : "border-[#D1D5DB] bg-white"
                      }`}
                    >
                      {checked && <Check size={10} strokeWidth={3} className="text-white" />}
                    </span>
                    {p === "*" ? "All (*)" : p}
                  </label>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleInvite}
            disabled={loading}
            className="w-full h-[50px] bg-[#091D4A]  transition-all text-white rounded-[4px] font-[700] text-[15px] mt-2 flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              isEdit ? "Update User" : "Invite User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ 
  label, 
  placeholder, 
  name, 
  value, 
  onChange 
}: { 
  label: string; 
  placeholder: string; 
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[13px] font-[500] text-[#374151]">{label}</label>
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="h-[40px] border border-[#D1D5DB] rounded-[4px] px-3 text-[13px] outline-none focus:border-[#091D4A] placeholder:text-[#9CA3AF]"
    />
  </div>
);
