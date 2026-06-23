"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Check, ChevronDown } from "lucide-react";
import moment from "moment";
import { toast } from "react-hot-toast";
import type { CardProgram } from "../[id]/CardProgramDetails";
import { GeneralService } from "@/lib/services/generalService";
import { InstitutionService } from "@/lib/services/institutionService";
import { KeyService } from "@/lib/services/keyService";
import { HsmService } from "@/lib/services/hsmService";
import { CardProgramService } from "@/lib/services/cardProgramService";
import { DateInput as CustomDateInput } from "@/components/ui/DateInput";
import { LoadingContent } from "@/components/ui/LoadingSpinner";

export const UpdateDetailsForm = ({ 
  close, 
  cardProgram 
}: { 
  close?: () => void;
  cardProgram?: CardProgram; 
}) => {
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [hsms, setHsms] = useState<any[]>([]);
  const [allKeys, setAllKeys] = useState<any[]>([]);
  const [keys, setKeys] = useState<any[]>([]);
  
  const [form, setForm] = useState<any>({
    name: "",
    institution: "",
    serviceCode: "601",
    panPrefix: "",
    panStart: "",
    panEnd: "",
    panLength: "",
    maxExpiry: "",
    renewable: false,
    scheme: "Mastercard",
    settlementAccount: "",
    settlementSchedule: "",
    settlementConfig: "",
    settlementAccountName: "",
    type: "physical",
    code: "",
    active: true,
    issuer: "",
    anonymous: true,
    randomCardNumber: true,
    smart: true,
    allowTips: true,
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().add(100, "years").format("YYYY-MM-DD"),
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [fetchingAccountDetails, setFetchingAccountDetails] = useState(false);
  const [validatingName, setValidatingName] = useState(false);
  const [validName, setValidName] = useState(false);
  const [programName, setProgramName] = useState("");

  const [channels, setChannels] = useState<any>({
    pos: { enabled: true, dailyLimit: { count: "", amount: "0" } },
    atm: { enabled: true, dailyLimit: { count: "", amount: "0" } },
    web: { enabled: true, dailyLimit: { count: "", amount: "0" } },
  });

  useEffect(() => {
    if (cardProgram) {
      setForm({
        ...cardProgram,
        panPrefix: cardProgram.panPrefix,
        maxExpiry: cardProgram.maxExpiry + (cardProgram.maxExpiry > 1 ? " months" : " month"),
        scheme: cardProgram.scheme,
        settlementAccount: (cardProgram as any).settlementConfig?.settlementAccount || cardProgram.settlementAccount || "",
        settlementSchedule: (cardProgram as any).settlementConfig?.schedule || "",
        settlementConfig: (cardProgram as any).settlementConfig?.config || "",
        settlementAccountName: (cardProgram as any).settlementConfig?.accountName || "",
      });
      if (cardProgram.channels) {
        setChannels({
          pos: {
            enabled: cardProgram.channels.pos?.enabled ?? true,
            dailyLimit: {
              count: cardProgram.channels.pos?.dailyLimit?.count ?? "",
              amount: cardProgram.channels.pos?.dailyLimit?.amount ?? "0"
            }
          },
          atm: {
            enabled: cardProgram.channels.atm?.enabled ?? true,
            dailyLimit: {
              count: cardProgram.channels.atm?.dailyLimit?.count ?? "",
              amount: cardProgram.channels.atm?.dailyLimit?.amount ?? "0"
            }
          },
          web: {
            enabled: cardProgram.channels.web?.enabled ?? true,
            dailyLimit: {
              count: cardProgram.channels.web?.dailyLimit?.count ?? "",
              amount: cardProgram.channels.web?.dailyLimit?.amount ?? "0"
            }
          },
        });
      }
    }
  }, [cardProgram]);

  const getInstitutions = useCallback(async () => {
    try {
      const res = await InstitutionService.getInstitutions();
      if (res.data) setInstitutions(res.data);
    } catch (err) {
      console.error("Failed to fetch institutions", err);
    }
  }, []);

  useEffect(() => {
    getInstitutions();
  }, [getInstitutions]);

  const handleChange = (name: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [name]: value }));
    if (value === "" && name !== "otherNames") {
      setFormErrors((prev: any) => ({ ...prev, [name]: "Required*" }));
    } else {
      setFormErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const handleToggle = (name: string) => {
    setForm((prev: any) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleChannel = (name: "pos" | "atm" | "web") => {
    setChannels((prev: any) => ({
      ...prev,
      [name]: { ...prev[name], enabled: !prev[name].enabled }
    }));
  };

  const handleChannelChange = (name: "pos" | "atm" | "web", type: "amount" | "count", value: any) => {
    setChannels((prev: any) => ({
      ...prev,
      [name]: {
        ...prev[name],
        dailyLimit: { ...prev[name].dailyLimit, [type]: value }
      }
    }));
  };

  const validateName = async (name: string) => {
    setValidatingName(true);
    try {
      const res = await CardProgramService.searchCardPrograms(name);
      if (res.statusCode === 200) {
        if (res.data.length > 0) {
          const data: any[] = res.data;
          let isFound = false;
          data.forEach((d) => {
            if (d.name.toLowerCase() === name.toLowerCase()) {
              setValidName(true);
              isFound = true;
            }
          });
          if (!isFound) setValidName(false);
        } else {
          setValidName(true);
        }
      }
    } catch (err) {
      console.error("Error validating name", err);
    } finally {
      setValidatingName(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredName = value.trim().replace(/[^a-zA-Z]/g, "");
    setProgramName(filteredName);
    setForm((prev: any) => ({ ...prev, name: filteredName }));
    if (value === "") {
      setFormErrors((prev: any) => ({ ...prev, name: "Required*" }));
    } else {
      setFormErrors((prev: any) => ({ ...prev, name: "" }));
      validateName(value);
    }
  };

  const handleBinChange = (value: string) => {
    setForm((prev: any) => {
      const newForm = { ...prev, panPrefix: value };
      if (value === "") {
        setFormErrors((e: any) => ({ ...e, panPrefix: "Required*" }));
      } else if (value.length < 6) {
        setFormErrors((e: any) => ({ ...e, panPrefix: "Should be at least 6 char*" }));
      } else {
        setFormErrors((e: any) => ({ ...e, panPrefix: "" }));
      }

      if (value.length >= 6 && prev.panLength) {
        const panLength = parseInt(prev.panLength.toString());
        const binLength = value.length;
        newForm.panStart = `${value}${"0".repeat(panLength - binLength)}`;
        newForm.panEnd = `${value}${"9".repeat(panLength - binLength)}`;
        setFormErrors((e: any) => ({ ...e, panStart: "", panEnd: "" }));
      }
      return newForm;
    });
  };

  const selectPanLength = (value: string | number) => {
    setForm((prev: any) => {
      const panLength = parseInt(value.toString());
      const binLength = prev.panPrefix?.length || 0;
      const panStart = `${prev.panPrefix}${"0".repeat(panLength - binLength)}`;
      const panEnd = `${prev.panPrefix}${"9".repeat(panLength - binLength)}`;
      
      setFormErrors((e: any) => ({ ...e, panStart: "", panEnd: "" }));
      
      return {
        ...prev,
        panLength: value,
        panStart,
        panEnd
      };
    });
  };

  const validateChannels = (channelName: "pos" | "atm" | "web") => {
    const { enabled, dailyLimit } = channels[channelName];
    const err: any = {};
    if (enabled) {
      if (channelName === "pos") {
        if (dailyLimit.count === "" || dailyLimit.count === "0") err.posCount = "Required*";
        if (dailyLimit.amount === "0" || dailyLimit.amount === "") err.posAmount = "Required*";
      }
      if (channelName === "atm") {
        if (dailyLimit.count === "" || dailyLimit.count === "0") err.atmCount = "Required*";
        if (dailyLimit.amount === "0" || dailyLimit.amount === "") err.atmAmount = "Required*";
      }
      if (channelName === "web") {
        if (dailyLimit.count === "" || dailyLimit.count === "0") err.webCount = "Required*";
        if (dailyLimit.amount === "0" || dailyLimit.amount === "") err.webAmount = "Required*";
      }
    }
    return err;
  };

  const validateForm = () => {
    const { panPrefix, panLength, panStart, panEnd, maxExpiry, code } = form;
    let error: any = {};
    if (panPrefix === "") error.panPrefix = "Required*";
    if (panLength === "") error.panLength = "Required*";
    if (panStart === "") error.panStart = "Required*";
    if (panEnd === "") error.panEnd = "Required*";
    if (maxExpiry === "") error.maxExpiry = "Required*";
    if (code === "") error.code = "Required*";
    return error;
  };

  const getAccountDetails = async (accountNumber: string) => {
    if (accountNumber.length !== 10) {
      setFormErrors((prev: any) => ({ ...prev, settlementAccount: "Required*" }));
      return;
    }

    setFetchingAccountDetails(true);
    try {
      const res = await GeneralService.nameInquiry({
        bankCode: "999240",
        accountNumber: accountNumber,
      });
      if (res.statusCode === 200 || res.statusCode === 201) {
        setForm((prev: any) => ({
          ...prev,
          settlementAccount: accountNumber,
          settlementAccountName: res.data.accountName,
        }));
        setFormErrors((prev: any) => ({ ...prev, settlementAccount: "" }));
      } else {
        setFormErrors((prev: any) => ({ ...prev, settlementAccount: "Invalid account number*" }));
      }
    } catch (err) {
      setFormErrors((prev: any) => ({ ...prev, settlementAccount: "Invalid account number*" }));
    } finally {
      setFetchingAccountDetails(false);
    }
  };

  const handleUpdate = async () => {
    if (!cardProgram?._id) return;

    const formErrorsFound = validateForm();
    const posErrors = validateChannels("pos");
    const atmErrors = validateChannels("atm");
    const webErrors = validateChannels("web");

    if (
      Object.keys(formErrorsFound).length > 0 ||
      Object.keys(posErrors).length > 0 ||
      Object.keys(atmErrors).length > 0 ||
      Object.keys(webErrors).length > 0
    ) {
      setFormErrors((prev: any) => ({
        ...prev,
        ...formErrorsFound,
        ...posErrors,
        ...atmErrors,
        ...webErrors,
      }));
      toast.error("Please fix the errors before updating");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        scheme: form.scheme,
        panPrefix: form.panPrefix,
        panLength: form.panLength,
        panStart: form.panStart,
        panEnd: form.panEnd,
        code: form.code,
        maxExpiry: form.maxExpiry.replace(" months", "").replace(" month", ""),
        renewable: form.renewable,
        channels: {
          pos: channels.pos,
          atm: channels.atm,
          web: channels.web,
        },
        startDate: form.startDate,
        endDate: form.endDate,
        anonymous: form.anonymous,
        randomCardNumber: form.randomCardNumber,
        allowTips: form.allowTips,
      };
      const res = await CardProgramService.updateCardProgram(cardProgram._id, payload);
      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success("Card Program Updated Successfully");
        if (close) close();
      } else {
        toast.error(res.message || "Failed to update card program");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] bg-[#00000075] overflow-y-auto p-3 sm:p-4 lg:py-8 flex items-start justify-center">
      <div className="fixed inset-0" onClick={close} />

      <div className="relative z-10 my-3 max-h-[calc(100dvh-1.5rem)] w-full max-w-[1180px] overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-[#ECECEC] px-5 py-5 sm:px-8 sm:py-7">
          <div className="min-w-0">
            <h2 className="text-[21px] sm:text-[24px] leading-tight font-[700] text-[#111827]">Update Card Program</h2>
            <p className="text-[14px] text-[#6B7280] mt-2">Filling out the form to update the card program</p>
          </div>
          <button type="button" onClick={close} className="w-[34px] h-[34px] shrink-0 flex items-center justify-center rounded-[6px] cursor-pointer">
            <X size={20} className="text-[#374151]" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col gap-8 sm:gap-[45px]">
            <section>
              <h3 className="text-[17px] font-[600] text-[#374151] mb-5">Card program information</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                <div className="col-span-12 md:col-span-4">
                  <Input 
                    label="Embossing code" 
                    placeholder="Embossing code" 
                    value={form.name} 
                    onChange={handleNameChange}
                  />
                  {formErrors.name && <span className="text-red-500 text-[12px]">{formErrors.name}</span>}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[17px] font-[600] text-[#374151] mb-5">PAN details</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                <div className="col-span-12 md:col-span-4">
                  <Input 
                    label="BIN" 
                    placeholder="202020" 
                    value={form.panPrefix} 
                    onChange={(e) => handleBinChange(e.target.value)}
                  />
                  {formErrors.panPrefix && <span className="text-red-500 text-[12px]">{formErrors.panPrefix}</span>}
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Select 
                    label="PAN length" 
                    value={form.panLength} 
                    options={["16", "19"]} 
                    onSelect={selectPanLength}
                  />
                  {formErrors.panLength && <span className="text-red-500 text-[12px]">{formErrors.panLength}</span>}
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Input 
                    label="PAN start" 
                    placeholder="PAN start" 
                    value={form.panStart} 
                    onChange={(e) => handleChange("panStart", e.target.value)} 
                  />
                  {formErrors.panStart && <span className="text-red-500 text-[12px]">{formErrors.panStart}</span>}
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Input 
                    label="PAN end" 
                    placeholder="PAN end" 
                    value={form.panEnd} 
                    onChange={(e) => handleChange("panEnd", e.target.value)} 
                  />
                  {formErrors.panEnd && <span className="text-red-500 text-[12px]">{formErrors.panEnd}</span>}
                </div>
                <div className="col-span-12 md:col-span-4">
                  <Select 
                    label="Max expiry" 
                    value={form.maxExpiry} 
                    options={GeneralService.getExpiryMonths()} 
                    onSelect={(val) => handleChange("maxExpiry", val)} 
                  />
                  {formErrors.maxExpiry && <span className="text-red-500 text-[12px]">{formErrors.maxExpiry}</span>}
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[15px] font-[400] text-[#374151] mb-5">Card control</h3>
              <div className="flex flex-col gap-7">
                <ToggleCard 
                  title="Renewable" 
                  desc="Let all cards be renewable upon expiry" 
                  value={form.renewable} 
                  valueText={form.renewable ? "Renewable" : "Disabled"} 
                  onToggle={() => handleToggle("renewable")} 
                />
                <ToggleCard 
                  title="Anonymous" 
                  desc="Let all card holders be anonymous." 
                  value={form.anonymous} 
                  valueText={form.anonymous ? "Anonymous" : "Disabled"} 
                  onToggle={() => handleToggle("anonymous")} 
                />
                <ToggleCard 
                  title="Random Card Number" 
                  desc="Enable random card numbers" 
                  value={form.randomCardNumber} 
                  valueText={form.randomCardNumber ? "Enabled" : "Disabled"} 
                  onToggle={() => handleToggle("randomCardNumber")} 
                />
                <ToggleCard 
                  title="Smart Card" 
                  desc="Allow smart cards in this card program" 
                  value={form.smart} 
                  valueText={form.smart ? "Allowed" : "Disabled"} 
                  onToggle={() => handleToggle("smart")} 
                />
                <ToggleCard 
                  title="Allow Tips" 
                  desc="Allow tips on cards in this card program" 
                  value={form.allowTips} 
                  valueText={form.allowTips ? "Allowed" : "Disabled"} 
                  onToggle={() => handleToggle("allowTips")} 
                />
              </div>
            </section>

            <section>
              <h3 className="text-[17px] font-[600] text-[#374151] mb-5">Set card program duration</h3>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
                <div className="col-span-12 md:col-span-4">
                  <CustomDateInput
                    label="Start Date"
                    date={form.startDate}
                    setDate={(val: string) =>
                      setForm((prev: any) => ({ ...prev, startDate: val }))
                    }
                    error={formErrors.startDate}
                  />
                </div>
                <div className="col-span-12 md:col-span-4">
                  <CustomDateInput
                    label="End Date"
                    date={form.endDate}
                    setDate={(val: string) =>
                      setForm((prev: any) => ({ ...prev, endDate: val }))
                    }
                    error={formErrors.endDate}
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[17px] font-[600] text-[#374151] mb-5">Select Card Scheme</h3>
              <div className="flex flex-wrap gap-5">
                {[{name: "Mastercard", image: "/assets/icons/master.svg"}, {name: "Visa", image: "/assets/icons/visa.svg"}, {name: "Verve", image: "/assets/icons/verve.svg"}, {name: "AfriGo", image: "/assets/icons/afrigo.png"}].map((item) => (
                  <button key={item.name} type="button" onClick={() => handleChange("scheme", item.name)} className={`relative h-[62px] w-full sm:w-[125px] border rounded-[6px] flex items-center justify-center transition-all ${form.scheme === item.name ? "bg-[#F1F5F9] border-[#CBD5E1]" : "border-[#E5E7EB]"}`}>
                    <Image src={item.image} alt={item.name} width={90} height={24} className="max-h-[24px] w-auto object-contain" />
                    {form.scheme === item.name && (<div className="absolute top-[8px] right-[8px]"><Check size={14} className="text-[#081A46]" /></div>)}
                  </button>
                ))}
              </div>
            </section>

            <section className="border border-[#E5E7EB] rounded-[10px] overflow-hidden">
              <div className="border-b border-[#ECECEC] px-6 py-5"><h3 className="text-[17px] font-[600] text-[#374151]">Setup card channels</h3></div>
              <div>
                {[
                  { id: "atm", name: "ATM", desc: "Cash withdrawal transactions" },
                  { id: "pos", name: "POS", desc: "Point of sale payments" },
                  { id: "web", name: "WEB", desc: "Online card transactions" }
                ].map((channel) => {
                  const chan = channels[channel.id as keyof typeof channels];
                  return (
                    <div key={channel.id} className={`px-6 py-6 ${channel.id !== "web" ? "border-b border-[#ECECEC]" : ""}`}>
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                        <div className="min-w-0">
                          <span className="h-[30px] px-4 uppercase rounded-[4px] bg-[#EDEEFF] flex items-center justify-center text-[#252F3F] text-[13px] font-[600] w-fit">{channel.name}</span>
                          <p className="text-[14px] text-[#6B7280] mt-3">{channel.desc}</p>
                        </div>
                        <div className="flex flex-col text-[11px] gap-[6px] items-center rounded-[4px] p-[10px] px-[13px] border border-[#ECECEC] capitalize">
                          <button type="button" onClick={() => toggleChannel(channel.id as any)} className={`w-[40px] h-[22px] rounded-full relative transition-all ${chan.enabled ? "bg-[#DCD9FF]" : "bg-[#E5E7EB]"}`}>
                            <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-[#081A46] transition-all ${chan.enabled ? "right-[2px]" : "left-[2px]"}`} />
                          </button>
                          <span className="text-[10px] text-[#374151]">{chan.enabled ? "Enabled" : "Disabled"}</span>
                        </div>
                      </div>
                      {chan.enabled && (
                        <div className="flex gap-5 mt-5 flex-wrap">
                          <div className="flex flex-col gap-1">
                            <AmountInput 
                              label="Amount" 
                              value={chan.dailyLimit.amount} 
                              onChange={(val) => handleChannelChange(channel.id as any, "amount", val)}
                            />
                            {formErrors[`${channel.id}Amount`] && <span className="text-red-500 text-[12px]">{formErrors[`${channel.id}Amount`]}</span>}
                          </div>
                          <div className="w-[180px] flex flex-col gap-1">
                            <Input 
                              label="Count" 
                              value={chan.dailyLimit.count} 
                              onChange={(e) => handleChannelChange(channel.id as any, "count", e.target.value)}
                            />
                            {formErrors[`${channel.id}Count`] && <span className="text-red-500 text-[12px]">{formErrors[`${channel.id}Count`]}</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="flex justify-end pt-4">
              <button 
                type="button" 
                onClick={handleUpdate} 
                disabled={loading}
                className="bg-[#081A46]  transition-all text-white h-[46px] w-full sm:w-[285px] px-8 rounded-[6px] text-[14px] font-[500] cursor-pointer "
              >
                {loading ? <LoadingContent label="" /> : "Update Card Program"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Input({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = "text" 
}: { 
  label: string; 
  placeholder?: string; 
  value?: string | number; 
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-[500] text-[#4B5563]">{label}</label>
      <input 
        type={type}
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        className="h-[44px] border border-[#D1D5DB] rounded-[6px] px-4 text-[14px] outline-none focus:border-[#081A46] w-full" 
      />
    </div>
  );
}

function AmountInput({ 
  label, 
  placeholder, 
  value, 
  onChange 
}: { 
  label: string; 
  placeholder?: string; 
  value?: string | number; 
  onChange?: (val: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[14px] font-[500] text-[#4B5563]">{label}</label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280]">₦</span>
        <input 
          placeholder={placeholder} 
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="h-[44px] w-full border border-[#D1D5DB] rounded-[6px] pl-8 pr-4 text-[14px] outline-none focus:border-[#081A46]" 
        />
      </div>
    </div>
  );
}

function Select({ 
  label, 
  value, 
  options, 
  onSelect 
}: { 
  label: string; 
  value: string | number; 
  options?: string[]; 
  onSelect?: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-2 relative">
      <label className="text-[14px] font-[500] text-[#4B5563]">{label}</label>
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="h-[44px] border border-[#D1D5DB] rounded-[6px] px-4 flex items-center justify-between text-[14px] w-full"
      >
        {value}
        <ChevronDown size={16} />
      </button>
      {isOpen && options && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-[#D1D5DB] rounded-[6px] shadow-lg z-20 max-h-[200px] overflow-y-auto">
          {options.map((opt) => (
            <div 
              key={opt} 
              onClick={() => {
                onSelect?.(opt);
                setIsOpen(false);
              }}
              className="px-4 py-2 hover:bg-[#F9FAFB] cursor-pointer text-[14px]"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleCard({ title, desc, value, valueText, onToggle }: { title: string; desc: string; value: boolean; valueText: string; onToggle: () => void }) {
  return (
    <div className="border border-[#DADADA] px-4 py-5 flex items-center justify-between">
      <div>
        <h4 className="text-[15px] font-[700] text-[#1F2937]">{title}</h4>
        <p className="text-[12px] text-[#6B7280] mt-2">{desc}</p>
      </div>
      <div className="flex flex-col text-[11px] gap-[6px] items-center rounded-[4px] p-[14px] px-[15px] bg-[#FAFAFA] capitalize min-w-[110px]">
        <button type="button" onClick={onToggle} className={`w-[40px] h-[22px] rounded-full relative transition-all ${value ? "bg-[#DCD9FF]" : "bg-[#E5E7EB]"}`}>
          <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-[#081A46] transition-all ${value ? "right-[2px]" : "left-[2px]"}`} />
        </button>
        <span className="text-[10px] text-[#374151] font-[500]">{valueText}</span>
      </div>
    </div>
  );
}
