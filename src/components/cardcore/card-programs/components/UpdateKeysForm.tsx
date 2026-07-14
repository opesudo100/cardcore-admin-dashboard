"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, AlertCircle } from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { CardProgramService } from "@/lib/services/cardProgramService";
import { KeyService } from "@/lib/services/keyService";
import { HsmService } from "@/lib/services/hsmService";

interface UpdateKeysFormProps {
  programId: string;
  keys?: {
    mkac?: string;
    mksmi?: string;
    mksmc?: string;
    cvk?: string;
    pvk?: string;
  };
  onCancel: () => void;
  onSuccess: () => void;
}

// Helper to get id, supporting both id and _id
const getId = (item: any): string | undefined => item?.id || item?._id;

export const UpdateKeysForm = ({ programId, keys, onCancel, onSuccess }: UpdateKeysFormProps) => {
  const [loading, setLoading] = useState(false);
  const [hsms, setHsms] = useState<any[]>([]);
  const [allKeys, setAllKeys] = useState<any[]>([]);
  const [filteredKeys, setFilteredKeys] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedHsm, setSelectedHsm] = useState<any>({});
  const [hsmCode, setHsmCode] = useState("");

  const [form, setForm] = useState({
    mkac: "",
    mksmi: "",
    mksmc: "",
    cvk: "",
    pvk: "",
  });

  const [formErrors, setFormErrors] = useState({
    mkac: "",
    mksmi: "",
    mksmc: "",
    cvk: "",
    pvk: "",
  });

  const [selectedKeys, setSelectedKeys] = useState({
    mkac: {},
    mksmi: {},
    mksmc: {},
    cvk: {},
    pvk: {},
  });

  const getHsm = useCallback(async () => {
    try {
      const res = await HsmService.getHsms({ limit: 100 });
      if (res.data) {
        setHsms(res.data);
        if (res.data.length > 0) {
          const firstHsm = res.data[0];
          setSelectedHsm(firstHsm);
          setHsmCode(firstHsm.code);
        }
      }
    } catch (err) {
      console.error("Failed to fetch HSMs", err);
    }
  }, []);

  const getKeys = useCallback(async () => {
    try {
      const res = await KeyService.getKeys({ limit: 1000 });
      if (res.data) {
        setAllKeys(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
    }
  }, []);

  useEffect(() => {
    getHsm();
  }, [getHsm]);

  useEffect(() => {
    if (hsmCode) {
      getKeys();
    }
  }, [hsmCode, getKeys]);

  useEffect(() => {
    if (allKeys.length > 0 && hsmCode) {
      const filtered = allKeys.filter((k) => k.hsmCode === hsmCode);
      setFilteredKeys(filtered);
    }
  }, [allKeys, hsmCode]);

  useEffect(() => {
    if (keys && allKeys.length > 0) {
      const newForm = {
        mkac: keys.mkac || "",
        mksmi: keys.mksmi || "",
        mksmc: keys.mksmc || "",
        cvk: keys.cvk || "",
        pvk: keys.pvk || "",
      };
      setForm(newForm);
      
      const newSelectedKeys = {
        mkac: allKeys.find((k) => getId(k) === keys.mkac) || {},
        mksmi: allKeys.find((k) => getId(k) === keys.mksmi) || {},
        mksmc: allKeys.find((k) => getId(k) === keys.mksmc) || {},
        cvk: allKeys.find((k) => getId(k) === keys.cvk) || {},
        pvk: allKeys.find((k) => getId(k) === keys.pvk) || {},
      };
      setSelectedKeys(newSelectedKeys);
    } else if (keys) {
      setForm({
        mkac: keys.mkac || "",
        mksmi: keys.mksmi || "",
        mksmc: keys.mksmc || "",
        cvk: keys.cvk || "",
        pvk: keys.pvk || "",
      });
    }
  }, [keys, allKeys]);

  const handleSetHsm = (hsm: any) => {
    setSelectedHsm(hsm);
    setHsmCode(hsm.code);
    setSelectedKeys({
      mkac: {},
      mksmi: {},
      mksmc: {},
      cvk: {},
      pvk: {},
    });
    setForm({
      mkac: "",
      mksmi: "",
      mksmc: "",
      cvk: "",
      pvk: "",
    });
    setFormErrors({
      mkac: "",
      mksmi: "",
      mksmc: "",
      cvk: "",
      pvk: "",
    });
  };

  const selectKey = (name: "mkac" | "mksmi" | "mksmc" | "cvk" | "pvk", option: any) => {
    setSelectedKeys((prev) => ({ ...prev, [name]: option }));
    setForm((prev) => ({ ...prev, [name]: getId(option) || "" }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {
      mkac: "",
      mksmi: "",
      mksmc: "",
      cvk: "",
      pvk: "",
    };
    let isValid = true;
    if (!form.mkac) {
      errors.mkac = "Required*";
      isValid = false;
    }
    if (!form.mksmi) {
      errors.mksmi = "Required*";
      isValid = false;
    }
    if (!form.mksmc) {
      errors.mksmc = "Required*";
      isValid = false;
    }
    if (!form.cvk) {
      errors.cvk = "Required*";
      isValid = false;
    }
    if (!form.pvk) {
      errors.pvk = "Required*";
      isValid = false;
    }
    return { isValid, errors };
  };

  const updateProgramKeys = async () => {
    const { isValid, errors } = validateForm();
    if (!isValid) {
      setFormErrors(errors);
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const res = await CardProgramService.updateProgramKeys(programId, {
        mkac: getId(selectedKeys.mkac),
        mksmi: getId(selectedKeys.mksmi),
        mksmc: getId(selectedKeys.mksmc),
        cvk: getId(selectedKeys.cvk),
        pvk: getId(selectedKeys.pvk),
      });

      if (res.statusCode === 200) {
        toast.success("Card program keys updated successfully");
        onSuccess();
      } else {
        const msg = res.message || "Failed to update keys";
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = err.message || "An error occurred";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999999999999] flex items-start justify-center bg-[#00000085] overflow-y-auto p-3 sm:p-[50px] sm:items-center animate-in fade-in duration-150">
      <div className="min-h-full w-full flex items-start justify-center relative py-4 sm:items-center sm:py-0">
        <div onClick={onCancel} className="absolute left-0 right-0 bottom-0 top-0 cursor-pointer" />
        
        <div className="bg-[#fff] relative z-[9999999999] rounded-[5px] w-full max-h-[calc(100dvh-32px)] overflow-y-auto sm:max-h-[calc(100dvh-100px)] sm:p-[40px] sm:px-[40px] px-[16px] p-[20px] pt-[32px] pb-[20px] sm:max-w-[650px] flex flex-col gap-[24px] sm:gap-[30px]">
          
          {/* Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex min-w-0 flex-col">
              <span className="sm:text-[27px] text-[24px] font-[600] text-[#111827]">
                Update Card Program Keys
              </span>
              <span className="text-gray-400 text-[14px]">
                Select the HSM and get the applied keys
              </span>
            </div>
            <button 
              onClick={onCancel}
              className="cursor-pointer p-1 rounded-full transition-colors relative w-4 h-4 shrink-0"
            >
              <Image 
                src="/assets/icons/close_.svg" 
                alt="close" 
                fill
                className="object-contain"
              />
            </button>
          </div>

          {/* Inline Error Message */}
          {errorMessage && (
            <span className="text-red-600 m-auto bg-[#ff000028] text-center px-[10px] py-1 rounded-[5px] font-[500] text-[14px] w-full">
              {errorMessage}
            </span>
          )}

          <div className="flex flex-col gap-[14px] scrollbar-hidden">
            <div className="flex flex-col w-full sm:px-1">
              <span className="text-[#374151] text-[16px] font-[600]">Keys</span>

              {/* HSM Selection Bar */}
              <div className="bg-[#081a460c] flex flex-col p-[10px] items-stretch justify-between gap-[12px] mt-[14px] rounded-[4px] sm:flex-row sm:items-center sm:gap-[14px]">
                <div className="flex min-w-0 gap-1.5 items-start sm:items-center">
                  <AlertCircle size={18} className="text-[#081A46] mt-0.5 shrink-0 sm:mt-0" />
                  <span className="text-[13px] sm:text-[14px] font-[700] text-[#081A46] leading-5">
                    Select HSM to get the applied keys
                  </span>
                </div>
                
                <div className="relative h-fit w-full sm:w-fit">
                  <div className="flex border cursor-pointer border-[#323232] p-[10px] py-2 sm:py-1 rounded-[5px] text-[#323232] items-center justify-between w-full sm:min-w-[100px] gap-[10px] bg-gray-50 text-[14px] font-[600]">
                    {hsmCode || "---"}
                    <ChevronDown size={16} className="text-[#323232] min-w-[16px]" />
                  </div>
                  <select
                    className="absolute left-0 bottom-0 cursor-pointer top-0 opacity-0 right-0 w-full"
                    onChange={(e) => {
                      try {
                        const val = JSON.parse(e.target.value);
                        handleSetHsm(val);
                      } catch (err) {
                        console.error("Failed to parse HSM selection", err);
                      }
                    }}
                    value={selectedHsm ? JSON.stringify(selectedHsm) : ""}
                  >
                    <option value="" disabled>Select HSM</option>
                    {hsms.map((h) => (
                      <option key={getId(h)} value={JSON.stringify(h)}>
                        {h.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Keys Grid */}
              <div className="grid grid-cols-12 gap-x-[20px] gap-[16px] border border-[#E5E7EB] p-[14px] sm:p-[20px] mt-[14px] rounded-[4px]">
                <div className="sm:col-span-6 col-span-12">
                  <KeySelectField
                    label="MKAC"
                    options={filteredKeys}
                    value={selectedKeys.mkac}
                    onChange={(opt) => selectKey("mkac", opt)}
                    error={formErrors.mkac}
                    placeholder="Select MKAC"
                  />
                </div>
                <div className="sm:col-span-6 col-span-12">
                  <KeySelectField
                    label="MKSMI"
                    options={filteredKeys}
                    value={selectedKeys.mksmi}
                    onChange={(opt) => selectKey("mksmi", opt)}
                    error={formErrors.mksmi}
                    placeholder="Select MKSMI"
                  />
                </div>
                <div className="sm:col-span-6 col-span-12">
                  <KeySelectField
                    label="MKSMC"
                    options={filteredKeys}
                    value={selectedKeys.mksmc}
                    onChange={(opt) => selectKey("mksmc", opt)}
                    error={formErrors.mksmc}
                    placeholder="Select MKSMC"
                  />
                </div>
                <div className="sm:col-span-6 col-span-12">
                  <KeySelectField
                    label="CVK"
                    options={filteredKeys}
                    value={selectedKeys.cvk}
                    onChange={(opt) => selectKey("cvk", opt)}
                    error={formErrors.cvk}
                    placeholder="Select CVK"
                  />
                </div>
                <div className="sm:col-span-6 col-span-12">
                  <KeySelectField
                    label="PVK"
                    options={filteredKeys}
                    value={selectedKeys.pvk}
                    onChange={(opt) => selectKey("pvk", opt)}
                    error={formErrors.pvk}
                    placeholder="Select PVK"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="w-full flex justify-end mt-[20px] sm:mt-[40px] sm:mr-1">
              <div className="sm:max-w-[300px] w-full">
                <button
                  type="button"
                  disabled={loading}
                  onClick={updateProgramKeys}
                  className="w-full bg-[#081A46] text-white h-[46px] rounded-[6px] font-[500] text-[14px] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Update Card Program Keys
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface KeySelectFieldProps {
  label: string;
  options: any[];
  value: any;
  onChange: (val: any) => void;
  error?: string;
  placeholder: string;
}

function KeySelectField({
  label,
  options,
  value,
  onChange,
  error,
  placeholder,
}: KeySelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5 relative w-full">
      <label className="text-[14px] font-[600] text-[#374151]">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-[44px] min-w-0 border ${
          error ? "border-red-500" : "border-[#D1D5DB]"
        } rounded-[6px] bg-white px-3 sm:px-4 flex items-center justify-between gap-2 text-[14px] text-[#374151] cursor-pointer transition-colors hover:border-gray-400`}
      >
        <span className={`${value?.name ? "text-[#374151] font-[500]" : "text-[#9CA3AF]"} min-w-0 truncate text-left`}>
          {value?.name || placeholder}
        </span>
        <ChevronDown size={16} className={`text-[#374151] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+4px)] left-0 bg-white border border-[#E5E7EB] rounded-[6px] shadow-lg z-[101] w-full min-w-0 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
            <div className="max-h-[200px] overflow-y-auto scrollbar-hidden">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-[13px] text-gray-500 italic">No keys available</div>
              ) : (
                options.map((opt) => (
                  <button
                    key={getId(opt)}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-[#F9FAFB] cursor-pointer text-[#374151] font-[500] text-[13px] border-b border-gray-50 last:border-0 truncate"
                  >
                    {opt.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
      {error && <span className="text-red-500 text-[12px] font-[500]">{error}</span>}
    </div>
  );
}
