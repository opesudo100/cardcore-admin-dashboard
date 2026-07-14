"use client";

import { cloudCardInstitutionsService } from "@/lib/services/cloudCardInstitutionsService";
import { GeneralService } from "@/lib/services/generalService";
import LocationService, { ICountry } from "@/lib/services/locationService";
import { X } from "lucide-react";
import { useState, FormEvent, useEffect } from "react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { Select } from "@/components/ui/Select";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { LoadingContent } from "@/components/ui/LoadingSpinner";

interface InviteInstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type InviteInstitutionResponse = {
  statusCode?: number;
  failed?: boolean;
  status?: string;
  message?: string;
};

export function InviteInstitutionModal({ isOpen, onClose, onSuccess }: InviteInstitutionModalProps) {
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<number | null>(null);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [type, setType] = useState("issuer"); // default to issuer
  const [registrationCountry, setRegistrationCountry] = useState<ICountry | null>(null);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    emailAddress: "",
    phoneNumber: "",
    registrationNumber: "",
  });

  // Load countries on mount and set default to Nigeria
  useEffect(() => {
    const loadCountries = async () => {
      const allCountries = await LocationService.getCountries();
      setCountries(allCountries);
      const nigeria = allCountries.find((c) => c.name === "Nigeria");
      if (nigeria) {
        setRegistrationCountry(nigeria);
      }
    };
    if (isOpen) {
      loadCountries();
    }
  }, [isOpen]);

  const validateForm = () => {
    const errors: typeof formErrors = {
      name: "",
      emailAddress: "",
      phoneNumber: "",
      registrationNumber: "",
    };
    let isValid = true;

    if (!name) {
      errors.name = "Required*";
      isValid = false;
    }
    if (!emailAddress) {
      errors.emailAddress = "Required*";
      isValid = false;
    } else if (!GeneralService.emailValidator(emailAddress)) {
      errors.emailAddress = "Invalid email address*";
      isValid = false;
    }
    if (!phoneNumber) {
      errors.phoneNumber = "Required*";
      isValid = false;
    }
    if (!registrationNumber) {
      errors.registrationNumber = "Required*";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (field: keyof typeof formErrors, value: string) => {
    setFormErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
    setError("");
  };

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        name,
        emailAddress,
        phoneNumber: phoneNumber?.toString() || "",
        type: type.toLowerCase().trim(),
        registrationNumber,
        registrationCountry: registrationCountry?.name || "Nigeria",
        description,
      };

      const res = await cloudCardInstitutionsService.inviteInstitution(payload) as InviteInstitutionResponse;

      if (res?.statusCode === 200 || res?.failed === false || res?.status === "success") {
        toast.success("Institution created successfully");
        onSuccess?.();
        onClose();
      } else {
        const errorMessage = res?.message || "Failed to invite institution";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || "Something went wrong, please try again";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#00000085] p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="bg-white z-[10000] w-full max-w-[500px] p-6 md:p-10 flex flex-col gap-6 rounded-[10px] relative max-h-[90vh] overflow-y-auto shadow-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-[20px] md:text-[24px] font-[600] text-[#111827]">Invite Institution</h2>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5 cursor-pointer" />
          </button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="text-red-500 text-[13px] font-[500] bg-red-50 border border-red-100 rounded-[8px] p-3 text-center">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Institution name"
            placeholder="e.g SafeHaven Microfinance Bank"
            value={name}
            onChange={(val) => {
              setName(val);
              handleChange("name", val);
            }}
            disabled={loading}
            error={formErrors.name}
          />

          <Input
            label="Email"
            type="email"
            placeholder="eg: example@mail.com"
            value={emailAddress}
            onChange={(val) => {
              setEmailAddress(val);
              handleChange("emailAddress", val);
            }}
            disabled={loading}
            error={formErrors.emailAddress}
          />

          <PhoneInput
            label="Phone number"
            placeholder="810 0000 000"
            value={phoneNumber}
            onChange={(val) => {
              setPhoneNumber(val);
              handleChange("phoneNumber", val?.toString() || "");
            }}
            disabled={loading}
            error={formErrors.phoneNumber}
          />

          <Input
            label="Registration number"
            placeholder="9192SF"
            value={registrationNumber}
            onChange={(val) => {
              setRegistrationNumber(val);
              handleChange("registrationNumber", val);
            }}
            disabled={loading}
            error={formErrors.registrationNumber}
          />

          <Select
            label="Type"
            options={["issuer", "card network"]}
            value={type}
            onChange={setType}
            disabled={loading}
          />

          <CustomSelect
            label="Country of registration"
            options={countries}
            value={registrationCountry}
            onSelect={setRegistrationCountry}
            disabled={loading}
          />

          <div className="flex flex-col gap-[5px] w-full">
            <label className="text-[#6B7280] text-[14px] font-[500]">Description</label>
            <textarea
              className="border border-gray-300 text-[#4B5563] w-full rounded-[8px] h-[100px] outline-none focus:ring-2 focus:ring-[#bbcdfc86] p-[12px] disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="E.g we are a microfinance bank specializing in..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-[#081F5C] text-white py-3 rounded-lg font-semibold mt-2 hover:bg-[#05133b] transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <LoadingContent label="" /> : "Invite Institution"}
          </button>
        </form>
      </div>
    </div>
  );
}
