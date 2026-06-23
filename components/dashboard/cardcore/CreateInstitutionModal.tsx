"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { Input } from "../../ui/Input";
import { CustomSelect } from "../../ui/CustomSelect";
import { CustomButton } from "@/components/ui/CustomButton";
import { InstitutionService } from "@/lib/services/institutionService";
import { PhoneInput } from "../../ui/PhoneInput";
import LocationService, { ICountry, IState, ICity } from "@/lib/services/locationService";
import type { CreateInstitutionDto } from "@/types/api";

type CreateInstitutionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const CreateInstitutionModal = ({ isOpen, onClose }: CreateInstitutionModalProps) => {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [filteredStates, setFilteredStates] = useState<IState[]>([]);
  const [filteredCities, setFilteredCities] = useState<ICity[]>([]);

  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [institutionCountryCode, setInstitutionCountryCode] = useState("+234");
  const [adminCountryCode, setAdminCountryCode] = useState("+234");

  const [registrationCountry, setRegistrationCountry] = useState<ICountry | null>(null);
  const [country, setCountry] = useState<ICountry | null>(null);
  const [state, setState] = useState<IState | null>(null);
  const [city, setCity] = useState<ICity | null>(null);

  useEffect(() => {
    LocationService.getCountries().then((data) => {
      setCountries(data);
      const nigeria = data.find((c) => c.name === "Nigeria") || data[0] || null;
      setRegistrationCountry(nigeria);
      setCountry(nigeria);
    });
  }, []);

  useEffect(() => {
    if (country) {
      LocationService.getStatesOfCountry(country.isoCode).then(setFilteredStates);
    } else {
      setFilteredStates([]);
    }
    setState(null);
    setCity(null);
  }, [country]);

  useEffect(() => {
    if (country && state) {
      LocationService.getCitiesOfState(country.isoCode, state.isoCode).then(setFilteredCities);
    } else {
      setFilteredCities([]);
    }
    setCity(null);
  }, [country, state]);

  const [form1, setForm1] = useState<{
    name: string;
    code: string;
    websiteUrl: string;
    institutionEmail: string;
    institutionPhone: string | number | null;
  }>({
    name: "",
    code: "",
    websiteUrl: "",
    institutionEmail: "",
    institutionPhone: "",
  });

  const [form2, setForm2] = useState<{
    firstName: string;
    lastName: string;
    otherNames: string;
    adminEmail: string;
    adminPhone: string | number | null;
  }>({
    firstName: "",
    lastName: "",
    otherNames: "",
    adminEmail: "",
    adminPhone: "",
  });

  const [form3, setForm3] = useState({
    street: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm1 = () => {
    const errors: Record<string, string> = {};
    if (!form1.name) errors.name = "Required*";
    if (!form1.code) errors.code = "Required*";
    if (!form1.websiteUrl) errors.websiteUrl = "Required*";
    if (!form1.institutionEmail) errors.institutionEmail = "Required*";
    if (!form1.institutionPhone) errors.institutionPhone = "Required*";
    if (!registrationCountry) errors.registrationCountry = "Required*";
    return errors;
  };

  const validateForm2 = () => {
    const errors: Record<string, string> = {};
    if (!form2.firstName) errors.firstName = "Required*";
    if (!form2.lastName) errors.lastName = "Required*";
    if (!form2.adminEmail) errors.adminEmail = "Required*";
    if (!form2.adminPhone) errors.adminPhone = "Required*";
    return errors;
  };

  const validateForm3 = () => {
    const errors: Record<string, string> = {};
    if (!country) errors.country = "Required*";
    if (!state) errors.state = "Required*";
    if (!city) errors.city = "Required*";
    if (!form3.street) errors.street = "Required*";
    return errors;
  };

  if (!isOpen) return null;

  const closeModal = () => {
    setStep(1);
    setShowSuccess(false);
    setErrorMessage("");
    onClose();
  };

 const createInstitution = async () => {
  if (!country || !state || !city || !form3.street) {
    setErrorMessage("Please complete the institution address before creating.");
    return;
  }

  setLoading(true);
  setErrorMessage("");

  try {
    // 1. Force the values to clean strings and remove leading zeros
    const cleanInstPhone = String(form1.institutionPhone ?? "").trim().replace(/^0+/, "");
    const cleanAdminPhone = String(form2.adminPhone ?? "").trim().replace(/^0+/, "");

    // 2. Explicitly map every key manually (NO object spreading)
    const payload: CreateInstitutionDto = {
      name: form1.name.trim(), 
      code: form1.code.trim(), 
      websiteUrl: form1.websiteUrl.trim(),
      institutionEmail: form1.institutionEmail.trim().toLowerCase(), // Ensures valid email string format
      institutionPhone: `${institutionCountryCode}${cleanInstPhone}`, // Explicitly guarantees a string representation
      firstName: form2.firstName.trim(),
      lastName: form2.lastName.trim(),
      otherNames: form2.otherNames ? form2.otherNames.trim() : "",
      adminEmail: form2.adminEmail.trim().toLowerCase(),
      adminPhone: `${adminCountryCode}${cleanAdminPhone}`,
      registrationCountry: registrationCountry?.name || "Nigeria",
      address: {
        city: city.name,
        state: state.name,
        country: country.name,
        street: form3.street.trim(),
      },
    };

    // Log this payload right here in your browser console to verify it looks pristine before dispatching
    console.log("Dispatched Institution Payload:", payload);

    const res = await InstitutionService.createInstitution(payload);

    // Handle both array messages and string messages cleanly
    if (res?.statusCode === 200 || res?.failed === false) {
      setShowSuccess(true);
    } else {
      const serverMessage = Array.isArray(res?.message) ? res.message.join(", ") : res?.message;
      setErrorMessage(serverMessage || "Failed to create institution.");
    }
  } catch (error) {
    console.error("Failed to create institution:", error);
    setErrorMessage("Something went wrong, please try again.");
  } finally {
    setLoading(false);
  }
};

  const nextStep = () => {
    setErrorMessage("");

    if (step === 1) {
      const errors = validateForm1();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      const errors = validateForm2();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      setStep(3);
      return;
    }

    const errors = validateForm3();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    createInstitution();
  };

  const prevStep = () => {
    setErrorMessage("");
    setStep(Math.max(1, step - 1));
  };

  const handleChange = (
    section: "form1" | "form2" | "form3",
    name: string,
    value: string | number | null
  ) => {
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
    if (section === "form1") {
      setForm1((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (section === "form2") {
      setForm2((prev) => ({ ...prev, [name]: value }));
      return;
    }
    setForm3((prev) => ({ ...prev, [name]: value as string }));
  };

  const handleSelect = (field: "registrationCountry" | "country" | "state" | "city", option: any) => {
    setFormErrors((prev) => ({ ...prev, [field]: "" }));
    if (field === "registrationCountry") {
      setRegistrationCountry(option);
      return;
    }

    if (field === "country") {
      setCountry(option);
      setState(null);
      setCity(null);
      return;
    }

    if (field === "state") {
      setState(option);
      setCity(null);
      return;
    }

    setCity(option);
  };

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center overflow-auto bg-[#00000085] md:justify-start md:items-start md:p-[40px] sm:p-[16px] md:py-[40px] px-[16px] sm:py-[100px] md:pb-0">
      <div onClick={closeModal} className="absolute left-0 right-0 bottom-0 top-0" />

      <div className="bg-white z-[99999] md:rounded-none sm:rounded-[10px] w-full md:max-w-full max-w-[500px] md:max-h-full md:h-full h-fit min-h-[calc(100vh-400px)] md:p-[40px] py-[40px] sm:px-[20px] p-[16px] flex flex-col gap-[40px] md:mt-0 md:mb-0 mb-[100px] mt-[200px]">
        <div className="flex justify-between items-center gap-[16px]">
          <span className="sm:text-[24px] text-[20px] font-[600] text-[#374151]">
            Create Institution
          </span>
          <button type="button" onClick={closeModal} className="shrink-0 text-gray-500 hover:text-black">
            <X size={20} />
          </button>
        </div>

        {showSuccess ? (
          <div className="flex w-full min-h-[220px] flex-col items-center justify-center rounded-[12px] border border-dashed border-gray-200 bg-gray-50 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-[#E6F9F0] text-[#10B981]">
              <Check size={28} />
            </div>
            <h3 className="text-[22px] font-semibold text-[#111827]">Institution created</h3>
            <p className="mt-2 max-w-[360px] text-[14px] text-gray-500">
              The institution setup is complete and ready for admin and address details review.
            </p>
            <button
              type="button"
              onClick={closeModal}
              className="mt-6 h-[50px] w-full max-w-[220px] rounded-[8px] bg-[#081A46] text-[14px] font-medium text-white"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-[20px] w-full">
            <div className="md:col-span-4 col-span-12 md:flex hidden flex-col gap-[40px]">
              <div className="flex md:flex-col md:justify-start justify-between gap-[30px]">
                {["step1", "step2", "step3"].map((label, index) => {
                  const completed = step > index + 1;
                  const active = step === index + 1;
                  return (
                    <div key={label} className="flex items-center md:gap-[13px] gap-[8px]">
                      <span
                        className={`md:min-w-[42px] min-w-[27px] md:h-[42px] h-[27px] rounded-[4px] flex items-center font-[800] justify-center ${
                          completed || active ? "bg-[#081A46] text-white" : "bg-[#F4F5F7] text-[#6B7280]"
                        }`}
                      >
                        {completed ? <Check size={14} /> : index + 1}
                      </span>
                      <span className="text-[#374151] whitespace-nowrap md:text-[16px] text-[14px] font-[600] md:block hidden">
                        {label === "step1"
                          ? "Institution Details"
                          : label === "step2"
                            ? "Admin Details"
                            : "Institution Address"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="md:col-span-8 col-span-12 md:max-h-[calc(100vh-200px)] max-h-fit px-2 overflow-y-auto scrollbar-hidden md:h-full">
              <div className="flex flex-col gap-[13px]">
                <span className="text-[var(--primary)] font-[700]">
                  Step <span>{step}</span>
                  <span className="text-gray-400 font-[300]">/3</span>
                </span>
                <span className="text-[18px] whitespace-nowrap font-[700] text-[#374151]">
                  {step === 1 ? "Institution Details" : step === 2 ? "Admin Details" : "Institution Address"}
                </span>

                {errorMessage !== "" && (
                  <span className="text-[14px] md:max-w-[400px] relative w-full p-1 px-2 font-[400] text-red-500 bg-[#ff000014]">
                    {errorMessage}
                  </span>
                )}

                {step === 1 && (
                  <div className="flex flex-col gap-[8px] md:max-w-[400px] mt-[10px]">
                    <Input label="Institution name" placeholder="e.g SafeHaven Microfinance Bank" value={form1.name} onChange={(value) => handleChange("form1", "name", value)} error={formErrors.name} />
                    <Input label="Institution code" placeholder="e.g SafeHaven-MFB" value={form1.code} onChange={(value) => handleChange("form1", "code", value)} error={formErrors.code} />
                    <Input label="Website URL" placeholder="eg: https://safehavenmfb.com" value={form1.websiteUrl} onChange={(value) => handleChange("form1", "websiteUrl", value)} error={formErrors.websiteUrl} />
                    <Input label="Email" placeholder="eg: example@mail.com" value={form1.institutionEmail} onChange={(value) => handleChange("form1", "institutionEmail", value)} error={formErrors.institutionEmail} />
                    <PhoneInput 
                      label="Phone number" 
                      placeholder="810 0000 000" 
                      value={form1.institutionPhone} 
                      getCountryCode={setInstitutionCountryCode} 
                      onChange={(value) => handleChange("form1", "institutionPhone", value)} 
                      error={formErrors.institutionPhone}
                    />
                    <CustomSelect 
                      label="Country of registration" 
                      placeholder="Select your country of registration" 
                      value={registrationCountry} 
                      options={countries} 
                      type="outline"
                      onSelect={(selected) => handleSelect("registrationCountry", selected)} 
                      error={formErrors.registrationCountry}
                    />
                    <div className="w-full flex justify-end items-center">
                      <div className="w-full max-w-[130px]">
                        <CustomButton label="Continue" onClick={() => nextStep()} />
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="flex flex-col gap-[8px] md:max-w-[400px] mt-[10px]">
                    <Input label="First Name" placeholder="e.g John" value={form2.firstName} onChange={(value) => handleChange("form2", "firstName", value)} error={formErrors.firstName} />
                    <Input label="Last Name" placeholder="e.g Doe" value={form2.lastName} onChange={(value) => handleChange("form2", "lastName", value)} error={formErrors.lastName} />
                    <Input label="Other Names (optional)" placeholder="e.g James" value={form2.otherNames} onChange={(value) => handleChange("form2", "otherNames", value)} error={formErrors.otherNames} optional />
                    <Input label="Email" placeholder="example@mail.com" value={form2.adminEmail} onChange={(value) => handleChange("form2", "adminEmail", value)} error={formErrors.adminEmail} />
                    <PhoneInput 
                      label="Phone Number" 
                      placeholder="810 000 0000" 
                      value={form2.adminPhone} 
                      getCountryCode={setAdminCountryCode} 
                      onChange={(value) => handleChange("form2", "adminPhone", value)} 
                      error={formErrors.adminPhone}
                    />
                    <div className="w-full flex justify-between items-center gap-4">
                      <button type="button" onClick={() => prevStep()} className="bg-[#F4F5F7] w-full max-w-[130px] text-[14px] flex items-center justify-center cursor-pointer rounded-[8px] text-[#6B7280] h-[50px]">
                        Back
                      </button>
                      <div className="w-full flex justify-end items-center">
                        <div className="w-full max-w-[130px]">
                          <CustomButton label="Continue" onClick={() => nextStep()} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col gap-[8px] md:max-w-[400px] mt-[10px]">
                    <CustomSelect 
                      label="Country" 
                      placeholder="Select your country" 
                      value={country} 
                      options={countries} 
                      type="outline"
                      onSelect={(val) => handleSelect("country", val)} 
                      error={formErrors.country}
                    />

                    <CustomSelect 
                      label="State" 
                      placeholder="Select your state" 
                      value={state} 
                      options={filteredStates} 
                      type="outline"
                      onSelect={(val) => handleSelect("state", val)} 
                      error={formErrors.state}
                    />

                    <CustomSelect 
                      label="City" 
                      placeholder="Select your city" 
                      value={city} 
                      options={filteredCities} 
                      type="outline"
                      onSelect={(val) => handleSelect("city", val)} 
                      error={formErrors.city}
                    />
                    <Input label="Street" placeholder="e.g 15, John Banks street" value={form3.street} onChange={(value) => handleChange("form3", "street", value)} error={formErrors.street} />
                    <div className="w-full flex justify-between mt-[20px] items-center gap-4">
                      <button type="button" onClick={() => prevStep()} className="bg-[#F4F5F7] w-full max-w-[130px] text-[14px] flex items-center justify-center cursor-pointer rounded-[8px] text-[#6B7280] h-[50px]">
                        Back
                      </button>
                      <div className="w-full flex justify-end items-center">
                        <div className="w-full max-w-[130px]">
                          {/* standardizing with loading states context */}
                          <CustomButton label="Create Institution" onClick={() => nextStep()} loading={loading} disabled={loading} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function ActionButton({
  label,
  onClick,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[50px] bg-[#081A46] flex items-center justify-center text-white rounded-[10px] transition duration-300 ease-in-out hover:scale-[102%] cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
    >
      {label}
    </button>
  );
}
