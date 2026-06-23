"use client";

import { useState, useEffect } from "react";
import { CustomButton } from "@/components/ui/CustomButton";
import { Input } from "@/components/ui/Input";

type KeyPair = {
  key: string;
  kcv: string;
};

type KeySection = {
  keyUnderLmk: string;
  keyUnderLmkKcv: string;
  keyUnderZmk?: string;
  keyUnderZmkKcv?: string;
};

type KeyErrors = {
  keyUnderLmk?: string;
  keyUnderLmkKcv?: string;
  zmkKcv?: string;
  component?: string;
  keyUnderZmk?: string;
  keyUnderZmkKcv?: string;
};

type HsmKeyData = {
  ZMK?: (KeySection & { zmkKcv?: string; components?: KeyPair[] }) | null;
  KEK?: KeySection | null;
  MKAC?: KeySection | null;
  CVK?: KeySection | null;
};

type HsmKeyPayload = {
  ZMK: KeySection & { zmkKcv: string; components: KeyPair[] };
  KEK: KeySection;
  MKAC: KeySection;
  CVK: KeySection;
};

type SaveResult = {
  success: boolean;
  message?: string;
};

type AddHsmKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  onSave?: (data: HsmKeyPayload) => void | SaveResult | Promise<void | SaveResult>;
  currentData?: HsmKeyData;
};

const GENERIC_SAVE_ERROR = "Something went wrong, please try again.";

export function AddHsmKeyModal({ isOpen, onClose, clientName, onSave, currentData }: AddHsmKeyModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const [ZMK, setZMK] = useState<KeySection>({
    keyUnderLmk: "",
    keyUnderLmkKcv: "",
  });

  const [KEK, setKEK] = useState<KeySection>({
    keyUnderLmk: "",
    keyUnderLmkKcv: "",
    keyUnderZmk: "",
    keyUnderZmkKcv: "",
  });

  const [MKAC, setMKAC] = useState<KeySection>({
    keyUnderLmk: "",
    keyUnderLmkKcv: "",
  });

  const [CVK, setCVK] = useState<KeySection>({
    keyUnderLmk: "",
    keyUnderLmkKcv: "",
  });

  const [key, setKey] = useState("");
  const [kcv, setKcv] = useState("");
  const [keyError, setKeyError] = useState({ key: "", kcv: "" });
  const [zmkComponents, setZmkComponents] = useState<KeyPair[]>([]);

  // Error states for each key type
  const [ZMKErrors, setZMKErrors] = useState<KeyErrors>({});
  const [KEKErrors, setKEKErrors] = useState<KeyErrors>({});
  const [MKACErrors, setMKACErrors] = useState<KeyErrors>({});
  const [CVKErrors, setCVKErrors] = useState<KeyErrors>({});

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
      setErrorMessage("");
      setZMK({
        keyUnderLmk: currentData?.ZMK?.keyUnderLmk || "",
        keyUnderLmkKcv: currentData?.ZMK?.keyUnderLmkKcv || "",
      });
      setKEK({
        keyUnderLmk: currentData?.KEK?.keyUnderLmk || "",
        keyUnderLmkKcv: currentData?.KEK?.keyUnderLmkKcv || "",
        keyUnderZmk: currentData?.KEK?.keyUnderZmk || "",
        keyUnderZmkKcv: currentData?.KEK?.keyUnderZmkKcv || "",
      });
      setMKAC({
        keyUnderLmk: currentData?.MKAC?.keyUnderLmk || "",
        keyUnderLmkKcv: currentData?.MKAC?.keyUnderLmkKcv || "",
      });
      setCVK({
        keyUnderLmk: currentData?.CVK?.keyUnderLmk || "",
        keyUnderLmkKcv: currentData?.CVK?.keyUnderLmkKcv || "",
      });
      setKey("");
      setKcv("");
      setKeyError({ key: "", kcv: "" });
      setZmkComponents(currentData?.ZMK?.components || []);
      setZMKErrors({});
      setKEKErrors({});
      setMKACErrors({});
      setCVKErrors({});
    }
  }, [isOpen, currentData]);

  const handleChange = (section: "ZMK" | "KEK" | "MKAC" | "CVK", field: keyof KeySection, value: string) => {
    const processedValue = value.toUpperCase().trim();
    
    if (section === "ZMK") {
      setZMK(prev => ({ ...prev, [field]: processedValue }));
      if (processedValue !== "") {
        setZMKErrors(prev => ({ ...prev, [field]: "" }));
      }
    } else if (section === "KEK") {
      setKEK(prev => ({ ...prev, [field]: processedValue }));
      if (processedValue !== "") {
        setKEKErrors(prev => ({ ...prev, [field]: "" }));
      }
    } else if (section === "MKAC") {
      setMKAC(prev => ({ ...prev, [field]: processedValue }));
      if (field === "keyUnderLmk" && processedValue !== "") {
        setMKACErrors(prev => ({ ...prev, keyUnderLmk: "" }));
        if (MKAC.keyUnderLmkKcv !== "") {
          setMKACErrors(prev => ({ ...prev, keyUnderLmkKcv: "" }));
        }
      } else if (field === "keyUnderLmkKcv" && processedValue !== "") {
        setMKACErrors(prev => ({ ...prev, keyUnderLmkKcv: "" }));
        if (MKAC.keyUnderLmk !== "") {
          setMKACErrors(prev => ({ ...prev, keyUnderLmk: "" }));
        }
      }
    } else if (section === "CVK") {
      setCVK(prev => ({ ...prev, [field]: processedValue }));
      if (field === "keyUnderLmk" && processedValue !== "") {
        setCVKErrors(prev => ({ ...prev, keyUnderLmk: "" }));
        if (CVK.keyUnderLmkKcv !== "") {
          setCVKErrors(prev => ({ ...prev, keyUnderLmkKcv: "" }));
        }
      } else if (field === "keyUnderLmkKcv" && processedValue !== "") {
        setCVKErrors(prev => ({ ...prev, keyUnderLmkKcv: "" }));
        if (CVK.keyUnderLmk !== "") {
          setCVKErrors(prev => ({ ...prev, keyUnderLmk: "" }));
        }
      }
    }
  };

  const addKey = () => {
    if (!key || !kcv) {
      setKeyError({
        key: key ? "" : "Required*",
        kcv: kcv ? "" : "Required*"
      });
      return;
    }
    const nextKey = key.toUpperCase().trim();
    const nextKcv = kcv.toUpperCase().trim();
    setZmkComponents(prev => [
      ...prev.filter((item) => item.key !== nextKey),
      { key: nextKey, kcv: nextKcv },
    ]);
    setKey("");
    setKcv("");
    setKeyError({ key: "", kcv: "" });
    setErrorMessage("");
    setZMKErrors((prev) => ({ ...prev, component: "" }));
  };

  const removeKey = (keyToRemove: string) => {
    setZmkComponents(prev => prev.filter(item => item.key !== keyToRemove));
  };

  // Validation functions
  const validateZMKKeys = (): KeyErrors => {
    const errors: KeyErrors = {};
    if (zmkComponents.length === 0) errors.component = "Required*";
    if (ZMK.keyUnderLmk === "") errors.keyUnderLmk = "Required*";
    if (ZMK.keyUnderLmkKcv === "") errors.keyUnderLmkKcv = "Required*";
    return errors;
  };

  const validateKEKKeys = (): KeyErrors => {
    const errors: KeyErrors = {};
    if (KEK.keyUnderLmk === "") errors.keyUnderLmk = "Required*";
    if (KEK.keyUnderLmkKcv === "") errors.keyUnderLmkKcv = "Required*";
    if (KEK.keyUnderZmk === "") errors.keyUnderZmk = "Required*";
    if (KEK.keyUnderZmkKcv === "") errors.keyUnderZmkKcv = "Required*";
    return errors;
  };

  const validateMKACKeys = (): KeyErrors => {
    const errors: KeyErrors = {};
    if (MKAC.keyUnderLmk === "" && MKAC.keyUnderLmkKcv !== "") errors.keyUnderLmk = "Required*";
    if (MKAC.keyUnderLmkKcv === "" && MKAC.keyUnderLmk !== "") errors.keyUnderLmkKcv = "Required*";
    return errors;
  };

  const validateCVKKeys = (): KeyErrors => {
    const errors: KeyErrors = {};
    if (CVK.keyUnderLmk === "" && CVK.keyUnderLmkKcv !== "") errors.keyUnderLmk = "Required*";
    if (CVK.keyUnderLmkKcv === "" && CVK.keyUnderLmk !== "") errors.keyUnderLmkKcv = "Required*";
    return errors;
  };

  const saveKeys = async () => {
    const zmkErrors = validateZMKKeys();
    const kekErrors = validateKEKKeys();
    const mkacErrors = validateMKACKeys();
    const cvkErrors = validateCVKKeys();

    if (Object.keys(zmkErrors).length > 0 || 
        Object.keys(kekErrors).length > 0 || 
        Object.keys(mkacErrors).length > 0 || 
        Object.keys(cvkErrors).length > 0) {
      setZMKErrors(zmkErrors);
      setKEKErrors(kekErrors);
      setMKACErrors(mkacErrors);
      setCVKErrors(cvkErrors);
      if (zmkErrors.component) {
        setErrorMessage("Please provide necessary ZMK components");
      }
      return;
    }

    setLoading(true);
    setErrorMessage("");
    try {
      const data: any = {
        ZMK: {
          ...ZMK,
          zmkKcv: ZMK.keyUnderLmkKcv,
          components: zmkComponents,
        },
        KEK,
        MKAC: MKAC.keyUnderLmk ? MKAC : null,
        CVK: CVK.keyUnderLmk ? CVK : null,
      };

      const result = await onSave?.(data);
      if (result && !result.success) {
        setErrorMessage(result.message || GENERIC_SAVE_ERROR);
        return;
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(GENERIC_SAVE_ERROR);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-start overflow-y-auto px-4 py-6 sm:py-10">
      <div className="relative w-full max-w-5xl bg-white p-5 sm:p-8 mb-10 max-h-[calc(100vh-48px)] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Add HSM KEY</h1>
            <p className="text-sm text-gray-500">
              To add your HSM Keys to <span className="font-semibold text-gray-600">{clientName}</span>, select the HSM key and provide the necessary key and key value check (KCV)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div> 

        {errorMessage && (
          <div className="mb-4 p-1 bg-red-50 border border-red-200 text-red-700 rounded-[8px] w-fit">
            {errorMessage}
          </div>
        )}

        <div className="space-y-8">
          {/* ZMK Keys */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">ZMK Keys</h2>
            <div className="grid md:grid-cols-2 gap-6 border-t border-b border-gray-200 py-6">
              <div className="bg-gray-100 p-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Under LMK</p>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8">
                    <Input
                      label="Key"
                      value={ZMK.keyUnderLmk}
                      onChange={(val) => handleChange("ZMK", "keyUnderLmk", val)}
                      max={33}
                      disabled={loading}
                      error={ZMKErrors.keyUnderLmk}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      label="KCV"
                      value={ZMK.keyUnderLmkKcv}
                      onChange={(val) => handleChange("ZMK", "keyUnderLmkKcv", val)}
                      max={6}
                      disabled={loading}
                      error={ZMKErrors.keyUnderLmkKcv}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#081A46] mb-3">Provide the necessary Key and KCV for the ZMK components</p>
                <div className="grid grid-cols-12 items-start gap-3 mb-3">
                  <div className="col-span-12 sm:col-span-7">
                    <Input
                      label="Key"
                      value={key}
                      onChange={(val) => {
                        setKey(val.toUpperCase().trim());
                        setKeyError((prev) => ({ ...prev, key: "" }));
                      }}
                      max={33}
                      error={keyError.key}
                    />
                  </div>
                  <div className="col-span-7 sm:col-span-3">
                    <Input
                      label="KCV"
                      value={kcv}
                      onChange={(val) => {
                        setKcv(val.toUpperCase().trim());
                        setKeyError((prev) => ({ ...prev, kcv: "" }));
                      }}
                      max={6}
                      error={keyError.kcv}
                    />
                  </div>
                  <button
                    onClick={addKey}
                    className="col-span-5 sm:col-span-2 mt-[24px] h-[30px] bg-[#081A46] text-white px-4 rounded-md text-sm  cursor-pointer"
                  >
                    Add
                  </button>
                </div>
                {zmkComponents.length > 0 && (
                  <div className="mt-4 bg-[#F9FAFB] p-6 sm:p-10">
                    <p className="mb-7 text-[20px] sm:text-[14px] font-[700] text-[#1F2933]">ZMK Components</p>
                    {zmkComponents.map((item) => (
                      <div key={item.key} className="flex items-center gap-6 sm:gap-10 text-[#4B5563]">
                        <button
                          onClick={() => removeKey(item.key)}
                          className="shrink-0 text-[#374151] hover:text-red-600"
                          aria-label={`Remove ${item.key}`}
                        >
                          <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <span className="min-w-0 flex-1 break-all text-[8px] sm:text-[10px] font-[600]">{item.key}</span>
                        <span className="shrink-0 break-all text-[8px] sm:text-[10px] font-[600]">{item.kcv}</span>
                      </div>
                    ))}
                  </div>
                )}
                {ZMKErrors.component && (
                  <span className="mt-1 block text-[10px] font-[400] text-red-500">
                    {ZMKErrors.component}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* KEK Keys */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">KEK Keys</h2>
            <div className="grid md:grid-cols-2 gap-6 border-t border-b border-gray-200 py-6">
              <div className="bg-gray-100 p-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Under LMK</p>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8">
                    <Input
                      label="Key"
                      value={KEK.keyUnderLmk}
                      onChange={(val) => handleChange("KEK", "keyUnderLmk", val)}
                      max={33}
                      disabled={loading}
                      error={KEKErrors.keyUnderLmk}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      label="KCV"
                      value={KEK.keyUnderLmkKcv}
                      onChange={(val) => handleChange("KEK", "keyUnderLmkKcv", val)}
                      max={6}
                      disabled={loading}
                      error={KEKErrors.keyUnderLmkKcv}
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 p-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Under ZMK</p>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8">
                    <Input
                      label="Key"
                      value={KEK.keyUnderZmk || ""}
                      onChange={(val) => handleChange("KEK", "keyUnderZmk", val)}
                      max={33}
                      disabled={loading}
                      error={KEKErrors.keyUnderZmk}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      label="KCV"
                      value={KEK.keyUnderZmkKcv || ""}
                      onChange={(val) => handleChange("KEK", "keyUnderZmkKcv", val)}
                      max={6}
                      disabled={loading}
                      error={KEKErrors.keyUnderZmkKcv}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MKAC Keys */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">MKAC Keys</h2>
              <span className="text-sm italic text-gray-500">(Optional)</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6 border-t border-b border-gray-200 py-6">
              <div className="bg-gray-100 p-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Under LMK</p>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8">
                    <Input
                      label="Key"
                      value={MKAC.keyUnderLmk}
                      onChange={(val) => handleChange("MKAC", "keyUnderLmk", val)}
                      max={33}
                      disabled={loading}
                      error={MKACErrors.keyUnderLmk}
                      optional
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      label="KCV"
                      value={MKAC.keyUnderLmkKcv}
                      onChange={(val) => handleChange("MKAC", "keyUnderLmkKcv", val)}
                      max={6}
                      disabled={loading}
                      error={MKACErrors.keyUnderLmkKcv}
                      optional
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CVK Keys */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">CVK Keys</h2>
              <span className="text-sm italic text-gray-500">(Optional)</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6 border-t border-b border-gray-200 py-6">
              <div className="bg-gray-100 p-4">
                <p className="text-sm font-medium text-gray-600 mb-3">Under LMK</p>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-8">
                    <Input
                      label="Key"
                      value={CVK.keyUnderLmk}
                      onChange={(val) => handleChange("CVK", "keyUnderLmk", val)}
                      max={33}
                      disabled={loading}
                      error={CVKErrors.keyUnderLmk}
                      optional
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      label="KCV"
                      value={CVK.keyUnderLmkKcv}
                      onChange={(val) => handleChange("CVK", "keyUnderLmkKcv", val)}
                      max={6}
                      disabled={loading}
                      error={CVKErrors.keyUnderLmkKcv}
                      optional
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <CustomButton
            label="Add HSM Keys"
            onClick={saveKeys}
            loading={loading}
            disabled={loading}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}