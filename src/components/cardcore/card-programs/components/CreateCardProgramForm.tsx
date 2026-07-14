"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, ChevronDown, X } from "lucide-react";
import { InstitutionService } from "@/lib/services/institutionService";
import { CardProgramService } from "@/lib/services/cardProgramService";
import { GeneralService } from "@/lib/services/generalService";
import { toast } from "react-hot-toast";
import moment from "moment";
import { DateInput as CustomDateInput } from "@/components/ui/DateInput";
import { LoadingContent } from "@/components/ui/LoadingSpinner";

interface CreateCardProgramFormProps {
  isOpen: boolean;
  close: () => void;
}

interface ChannelType {
  name: "ATM" | "POS" | "WEB";
  desc: string;
  enabled: boolean;
  amount: string;
  count: string;
}

export default function CreateCardProgramForm({
  isOpen,
  close,
}: CreateCardProgramFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetchingAccountDetails, setFetchingAccountDetails] = useState(false);
  const [validatingName, setValidatingName] = useState(false);
  const [validName, setValidName] = useState(false);

  const [institutions, setInstitutions] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    serviceCode: "601",
    institution: "",
    embossingCode: "",
    seqNumber: "",
    code: "",
    panPrefix: "",
    panLength: "16",
    maxExpiry: "12 months",
    settlementConfig: "off-us",
    settlementSchedule: "Instant",
    settlementAccount: "",
    settlementAccountName: "",
    renewable: true,
    anonymous: true,
    allowRandomPan: true,
    smart: true,
    allowTips: true,
    startDate: moment().format("YYYY-MM-DD"),
    endDate: moment().add(100, "years").format("YYYY-MM-DD"),
    type: "physical",
    scheme: "Mastercard",
    webhookType: "JSON",
    webhookUrl: "",
    webhookHeader: "",
    webhookSecret: "",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchInstitutions();
    }
  }, [isOpen]);

  const fetchInstitutions = async () => {
    try {
      const res = await InstitutionService.getInstitutions({ limit: 100 });
      if (res?.statusCode === 200 || res?.statusCode === 201) {
        setInstitutions(res.data);
      }
    } catch (error) {
      console.error("Error fetching institutions", error);
    }
  };

  const validateName = async (name: string) => {
    if (!name) return;
    setValidatingName(true);
    try {
      const res = await CardProgramService.searchCardPrograms(name);
      if (res.statusCode === 200) {
        if (res.data.length > 0) {
          const exists = res.data.some(
            (d: any) => d.name.toLowerCase() === name.toLowerCase()
          );
          setValidName(!exists);
        } else {
          setValidName(true);
        }
      }
    } catch (error) {
      console.error("Error validating name", error);
    } finally {
      setValidatingName(false);
    }
  };

  const handleNameChange = (val: string) => {
    const cleanedName = val.trim().replace(/[^a-zA-Z0-9 ]/g, "");
    setForm({ ...form, name: cleanedName });
    if (!cleanedName) {
      setFormErrors((prev) => ({ ...prev, name: "Required*" }));
    } else {
      setFormErrors((prev) => ({ ...prev, name: "" }));
      validateName(cleanedName);
    }
  };

  const getAccountDetails = async (accountNumber: string) => {
    setForm((prev) => ({
      ...prev,
      settlementAccount: accountNumber,
      settlementAccountName: "",
    }));

    if (accountNumber.length === 0) {
      setFormErrors((prev) => ({ ...prev, settlementAccount: "Required*" }));
      return;
    }

    setFormErrors((prev) => ({ ...prev, settlementAccount: "" }));

    if (accountNumber.length === 10) {
      setFetchingAccountDetails(true);
      try {
        const res = await GeneralService.nameInquiry({
          bankCode: "999240",
          accountNumber: accountNumber,
        });
        if (res.statusCode === 200 || res.statusCode === 201) {
          setForm((prev) => ({
            ...prev,
            settlementAccountName: res.data.accountName,
          }));
        } else {
          setFormErrors((prev) => ({
            ...prev,
            settlementAccount: "Invalid account number*",
          }));
        }
      } catch (error) {
        setFormErrors((prev) => ({
          ...prev,
          settlementAccount: "Invalid account number*",
        }));
      } finally {
        setFetchingAccountDetails(false);
      }
    }
  };

  const panStart = (() => {
    if (!form.panPrefix || !form.panLength) return "";
    const totalLength = Number(form.panLength);
    const remaining = totalLength - form.panPrefix.length;
    return remaining > 0
      ? `${form.panPrefix}${"0".repeat(remaining)}`
      : form.panPrefix;
  })();

  const panEnd = (() => {
    if (!form.panPrefix || !form.panLength) return "";
    const totalLength = Number(form.panLength);
    const remaining = totalLength - form.panPrefix.length;
    return remaining > 0
      ? `${form.panPrefix}${"9".repeat(remaining)}`
      : form.panPrefix;
  })();

  const [channels, setChannels] = useState<ChannelType[]>([
    {
      name: "ATM",
      desc: "Cash withdrawal transactions",
      enabled: true,
      amount: "0",
      count: "0",
    },
    {
      name: "POS",
      desc: "Point of sale payments",
      enabled: true,
      amount: "0",
      count: "0",
    },
    {
      name: "WEB",
      desc: "Online card transactions",
      enabled: true,
      amount: "0",
      count: "0",
    },
  ]);

  const panLengths = ["12", "13", "14", "15", "16", "17", "18", "19"];

  const expiryMonths = GeneralService.getExpiryMonths();

  const toggleChannel = (index: number) => {
    const updated = [...channels];
    updated[index].enabled = !updated[index].enabled;
    setChannels(updated);
  };

  const handleChannelChange = (
    index: number,
    field: "amount" | "count",
    value: string
  ) => {
    const updated = [...channels];
    updated[index][field] = value;
    setChannels(updated);
  };

  const validateChannels = (channelName: "ATM" | "POS" | "WEB") => {
    const channel = channels.find((c) => c.name === channelName);
    const err: Record<string, string> = {};
    if (channel?.enabled) {
      const lowerName = channelName.toLowerCase();
      if (!channel.count || channel.count === "0") {
        err[`${lowerName}Count`] = "Required*";
      }
      if (!channel.amount || channel.amount === "0") {
        err[`${lowerName}Amount`] = "Required*";
      }
    }
    return err;
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!form.name) errors.name = "Required*";
    if (!form.institution) errors.institution = "Required*";
    if (!form.serviceCode) errors.serviceCode = "Required*";
    if (!form.panPrefix) errors.panPrefix = "Required*";
    if (form.panPrefix.length < 6) errors.panPrefix = "Min. 6 chars*";
    if (!form.panLength) errors.panLength = "Required*";
    if (!form.maxExpiry) errors.maxExpiry = "Required*";
    if (!form.seqNumber) errors.seqNumber = "Required*";
    if (!form.code) errors.code = "Required*";
    if (!form.embossingCode) errors.embossingCode = "Required*";

    if (form.settlementConfig === "on-us") {
      if (!form.settlementAccount) errors.settlementAccount = "Required*";
      if (!form.settlementSchedule) errors.settlementSchedule = "Required*";
    }

    if (!form.webhookUrl) errors.webhookUrl = "Required*";
    else if (!GeneralService.urlValidator(form.webhookUrl))
      errors.webhookUrl = "Invalid URL*";

    const channelErrors = {
      ...validateChannels("ATM"),
      ...validateChannels("POS"),
      ...validateChannels("WEB"),
    };

    const allErrors = { ...errors, ...channelErrors };
    setFormErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const settlement =
        form.settlementConfig === "off-us"
          ? { config: form.settlementConfig }
          : {
              bankCode: "999240",
              settlementAccount: form.settlementAccount,
              accountName: form.settlementAccountName,
              schedule: form.settlementSchedule
                .toUpperCase()
                .replace("+", "")
                .replace(/\s+/g, ""),
              config: form.settlementConfig,
            };

      const payload = {
        institution: form.institution,
        name: form.name,
        scheme: form.scheme,
        type: form.type,
        panPrefix: form.panPrefix,
        panLength: form.panLength,
        panStart: panStart,
        panEnd: panEnd,
        serviceCode: form.serviceCode.toString(),
        code: form.code,
        maxExpiry: form.maxExpiry.replace(" months", "").replace(" month", ""),
        renewable: form.renewable,
        channels: {
          pos: channels.find((c) => c.name === "POS"),
          atm: channels.find((c) => c.name === "ATM"),
          web: channels.find((c) => c.name === "WEB"),
        },
        startDate: form.startDate,
        endDate: form.endDate,
        active: true,
        anonymous: form.anonymous,
        allowRandomPan: form.allowRandomPan,
        smart: form.smart,
        allowTips: form.allowTips,
        seqNumber: form.seqNumber,
        settlementConfig: settlement,
        webHookConfig: {
          url: form.webhookUrl,
          secret: form.webhookSecret,
          header: form.webhookHeader,
          type: form.webhookType,
        },
      };

      const res = await CardProgramService.createCardProgram(payload);
      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success("Card Program Created Successfully");
        close();
      } else {
        toast.error(res.message || "Failed to create card program");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex fixed top-0 left-0 right-0 bottom-0 bg-[#00000085] overflow-auto z-[9999999] sm:p-[50px] p-[16px] pb-0 items-center justify-center">
      <div className="h-screen w-full overflow-auto pb-[50px] flex items-center justify-center">
        <div
          onClick={close}
          className="absolute left-0 right-0 bottom-0 top-0"
        />

        <form
          onSubmit={handleSubmit}
          className="bg-[#fff] relative z-[9999999999] rounded-[5px] w-full h-fit max-h-[90vh] sm:p-[40px] sm:px-[40px] px-[16px] p-[20px] pt-[40px] pb-[10px] sm:max-w-[80vw] flex flex-col mt-[100px] gap-[30px]"
        >
          <div className="flex justify-between">
            <div className="flex bg-[#fff] flex-col">
              <span className="sm:text-[27px] text-[24px] font-[600] text-[#111827]">
                Create Card Program
              </span>

              <span className="text-gray-400 text-[14px]">
                Create a new card program by filling out the form
              </span>
            </div>

            <button
              type="button"
              onClick={close}
              className="cursor-pointer absolute md:top-[40px] md:right-[40px] top-[20px] right-[20px]"
            >
              <X className="text-[#111827]" size={22} />
            </button>
          </div>

          <div className="flex flex-col gap-[14px] h-[calc(100vh-250px)] overflow-y-auto scrollbar-hidden px-1">
            {/* Card program information */}
            <section className="flex flex-col gap-[14px] w-full">
              <span className="text-[#374151] mb-[14px] text-[16px] font-[600]">
                Card program information
              </span>

              <div className="grid grid-cols-12 gap-[20px]">
                <div className="sm:col-span-4 col-span-12">
                  <Input
                    label="Name"
                    placeholder="Enter card program name"
                    value={form.name}
                    onChange={handleNameChange}
                    error={formErrors.name}
                  />
                </div>

                <div className="sm:col-span-4 col-span-12">
                  <Input
                    label="Service code"
                    placeholder="Enter card program service code"
                    value={form.serviceCode}
                    onChange={(val) =>
                      setForm({ ...form, serviceCode: val })
                    }
                    error={formErrors.serviceCode}
                  />
                </div>

                <div className="sm:col-span-4 col-span-12">
                  <Select
                    label="Institution"
                    options={institutions.map((i) => ({
                      label: i.name,
                      value: i._id,
                    }))}
                    value={
                      institutions.find((i) => i._id === form.institution)
                        ?.name || ""
                    }
                    onChange={(val) =>
                      setForm({ ...form, institution: val })
                    }
                    placeholder="Select institution"
                    error={formErrors.institution}
                  />
                </div>

                <div className="sm:col-span-4 col-span-12">
                  <Input
                    label="Embossing code"
                    placeholder="E.g !1234ABZ"
                    value={form.embossingCode}
                    onChange={(val) =>
                      setForm({ ...form, embossingCode: val })
                    }
                    error={formErrors.embossingCode}
                  />
                </div>

                <div className="sm:col-span-4 col-span-12">
                  <Input
                    label="Sequence Number"
                    placeholder="E.g !1234ABZ"
                    value={form.seqNumber}
                    onChange={(val) =>
                      setForm({ ...form, seqNumber: val })
                    }
                    error={formErrors.seqNumber}
                  />
                </div>

                {/* <div className="sm:col-span-4 col-span-12">
                  <Input
                    label="Code"
                    placeholder="Enter card program code"
                    value={form.code}
                    onChange={(val) =>
                      setForm({ ...form, code: val })
                    }
                    error={formErrors.code}
                  />
                </div> */}
              </div>
            </section>

            {/* PAN details */}
            <section className="flex flex-col gap-[14px] w-full mt-[40px]">
              <span className="text-[#374151] text-[16px] mb-[14px] font-[600]">
                PAN details
              </span>

              <div className="grid grid-cols-12 gap-[20px]">
                <div className="sm:col-span-4 col-span-6">
                  <Input
                    label="BIN"
                    placeholder="E.g 123456"
                    value={form.panPrefix}
                    onChange={(val) =>
                      setForm({ ...form, panPrefix: val })
                    }
                    error={formErrors.panPrefix}
                  />
                </div>

                <div className="sm:col-span-4 col-span-6">
                  <Select
                    label="PAN length"
                    options={panLengths}
                    value={form.panLength}
                    onChange={(val) =>
                      setForm({ ...form, panLength: val })
                    }
                    placeholder="Select pan length"
                    error={formErrors.panLength}
                  />
                </div>

                <div className="sm:col-span-4 col-span-6">
                  <Input
                    label="PAN start"
                    placeholder="e.g 000001"
                    value={panStart}
                    disabled
                  />
                </div>

                <div className="sm:col-span-4 col-span-6">
                  <Input
                    label="PAN end"
                    placeholder="e.g 999999"
                    value={panEnd}
                    disabled
                  />
                </div>

                <div className="sm:col-span-4 col-span-6">
                  <Select
                    label="Max expiry"
                    options={expiryMonths}
                    value={form.maxExpiry}
                    onChange={(val) =>
                      setForm({ ...form, maxExpiry: val })
                    }
                    placeholder="Select max expiry"
                    error={formErrors.maxExpiry}
                  />
                </div>
              </div>
            </section>

            {/* Settlement config */}
            <section className="flex flex-col gap-[14px] w-full mt-[40px]">
              <span className="text-[#374151] text-[16px] mb-[14px] font-[600]">
                Settlement account configuration
              </span>

              <div className="flex flex-wrap items-center sm:gap-[40px] gap-[16px]">
                <CheckCard
                  title="On Us"
                  desc="Sudo Africa manages settlements on your behalf"
                  checked={form.settlementConfig === "on-us"}
                  onClick={() =>
                    setForm({ ...form, settlementConfig: "on-us" })
                  }
                />

                <CheckCard
                  title="Off Us"
                  desc="The selected institution manages their settlements"
                  checked={form.settlementConfig === "off-us"}
                  onClick={() =>
                    setForm({ ...form, settlementConfig: "off-us" })
                  }
                />
              </div>

              {form.settlementConfig === "on-us" && (
                <div className="grid grid-cols-12 gap-[20px] bg-gray-50 w-full rounded-[4px] p-[16px]">
                  <div className="sm:col-span-4 col-span-6">
                    <Select
                      label="Settlement Schedule"
                      options={["Instant", "T + 1"]}
                      value={form.settlementSchedule}
                      onChange={(val) =>
                        setForm({ ...form, settlementSchedule: val })
                      }
                      error={formErrors.settlementSchedule}
                    />
                  </div>

                  <div className="sm:col-span-4 col-span-6 relative">
                    <Input
                      label="Settlement Account"
                      placeholder="e.g 0105080622"
                      value={form.settlementAccount}
                      onChange={getAccountDetails}
                      error={formErrors.settlementAccount}
                    />

                    <span className="absolute flex items-center gap-[10px] bottom-[0.7px] right-0 text-[10px] max-w-[80%]">
                      <span className="truncate whitespace-nowrap text-[#081A46]">
                        {fetchingAccountDetails
                          ? <LoadingContent label="" spinnerClassName="h-3 w-3 border-[#09245A]/20 border-t-[#09245A]" />
                          : form.settlementAccountName}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* Card control */}
            <section className="flex flex-col gap-[14px] w-full mt-[40px]">
              <span className="text-[#374151] text-[16px] mb-[14px] font-[600]">
                Card control
              </span>

              <div className="flex flex-col w-full gap-[20px]">
                <ToggleCard
                  title="Renewable"
                  desc="Let all cards be renewable upon expiry"
                  checked={form.renewable}
                  value={form.renewable ? "Renewable" : "Not renewable"}
                  onToggle={() =>
                    setForm({ ...form, renewable: !form.renewable })
                  }
                />

                <ToggleCard
                  title="Anonymous"
                  desc="Let all card holders be anonymous"
                  checked={form.anonymous}
                  value={form.anonymous ? "Anonymous" : "Not Anonymous"}
                  onToggle={() =>
                    setForm({ ...form, anonymous: !form.anonymous })
                  }
                />

                <ToggleCard
                  title="Allow Random PAN"
                  desc="Enable random PAN for cards"
                  checked={form.allowRandomPan}
                  value={form.allowRandomPan ? "Allowed" : "Disallowed"}
                  onToggle={() =>
                    setForm({
                      ...form,
                      allowRandomPan: !form.allowRandomPan,
                    })
                  }
                />

                <ToggleCard
                  title="Smart Card"
                  desc="Allow smart cards in this card program"
                  checked={form.smart}
                  value={form.smart ? "Allowed" : "Disallowed"}
                  onToggle={() =>
                    setForm({ ...form, smart: !form.smart })
                  }
                />

                <ToggleCard
                  title="Allow Tips"
                  desc="Allow tips on cards in this card program"
                  checked={form.allowTips}
                  value={form.allowTips ? "Allowed" : "Disallowed"}
                  onToggle={() =>
                    setForm({ ...form, allowTips: !form.allowTips })
                  }
                />
              </div>
            </section>

            {/* Duration */}
            <section className="flex flex-col gap-[14px] w-full mt-[40px]">
              <span className="text-[#374151] text-[16px] font-[600]">
                Set card program duration
              </span>

              <div className="grid grid-cols-12 gap-[20px]">
                <div className="sm:col-span-4 col-span-12">
                  <CustomDateInput
                    label="Start Date"
                    date={form.startDate}
                    setDate={(val: string) =>
                      setForm((prev) => ({ ...prev, startDate: val }))
                    }
                    error={formErrors.startDate}
                  />
                </div>

                <div className="sm:col-span-4 col-span-12">
                  <CustomDateInput
                    label="End Date"
                    date={form.endDate}
                    setDate={(val: string) =>
                      setForm((prev) => ({ ...prev, endDate: val }))
                    }
                    error={formErrors.endDate}
                  />
                </div>
              </div>
            </section>

            {/* Card type */}
            <section className="flex flex-col gap-[14px] w-full mt-[40px]">
              <span className="text-[#374151] text-[16px] font-[600]">
                Select card type
              </span>

              <div className="flex flex-wrap items-center sm:gap-[40px] gap-[16px]">
                <CheckCard
                  title="Physical cards"
                  desc="Use physical cards for this card program"
                  checked={form.type === "physical"}
                  onClick={() => setForm({ ...form, type: "physical" })}
                />

                <CheckCard
                  title="Virtual cards"
                  desc="Use virtual cards for this card program"
                  checked={form.type === "virtual"}
                  onClick={() => setForm({ ...form, type: "virtual" })}
                />
              </div>
            </section>

            {/* Scheme */}
            <section className="flex flex-col gap-[14px] w-full mt-[40px]">
              <span className="text-[#374151] text-[16px] font-[600]">
                Select Card Scheme
              </span>

              <div className="flex items-center flex-wrap sm:gap-[40px] gap-[10px]">
                {[
                  {
                    name: "Mastercard",
                    image: "/assets/icons/master.svg",
                  },
                  {
                    name: "Visa",
                    image: "/assets/icons/visa.svg",
                  },
                  {
                    name: "Verve",
                    image: "/assets/icons/verve.svg",
                  },
                  {
                    name: "AfriGo",
                    image: "/assets/icons/afrigo.png",
                  },
                ].map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setForm({ ...form, scheme: item.name })}
                    className={`h-[80px] relative flex items-center justify-center w-[150px] border border-gray-300 cursor-pointer rounded-[5px] ${
                      form.scheme === item.name
                        ? "bg-[#F1F5F9]"
                        : "opacity-[0.8]" 
                    }`}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={90}
                      height={22}
                      className="max-h-[22px] w-auto object-contain"
                    />

                    {form.scheme === item.name && (
                      <Check
                        size={16}
                        className="absolute top-[10px] right-[10px] text-[#081A46]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Channels */}
            <section className="flex flex-col w-full sm:border border-gray-100 mt-[40px] sm:p-[30px] py-[30px] rounded-[10px]">
              <span className="text-[#374151] text-[16px] sm:mb-0 mb-[40px] font-[600]">
                Setup card channels
              </span>

              {channels.map((channel, index) => (
                <div
                  key={channel.name}
                  className={`flex flex-col w-full ${
                    index !== channels.length - 1 ? "border-b border-gray-100" : ""
                  } py-4`}
                >
                  <div className="flex justify-between items-center gap-[20px]">
                    <div className="flex flex-col gap-2">
                      <span className="h-[30px] w-[56px] uppercase rounded-[4px] bg-[#EDEEFF] flex items-center justify-center text-[#252F3F] text-[13px]">
                        {channel.name}
                      </span>

                      <span className="text-[#4B5563] text-[14px]">
                        {channel.desc}
                      </span>
                    </div>

                    <div className="flex flex-col text-[11px] gap-[6px] items-center rounded-[4px] p-[10px] px-[13px] border border-gray-200 capitalize">
                      <button
                        type="button"
                        onClick={() => toggleChannel(index)}
                        className={`w-[45px] h-[20px] rounded-full relative transition-all ${
                          channel.enabled
                            ? "bg-[#DCD9FF]"
                            : "bg-[#E5E7EB]"
                        }`}
                      >
                        <div
                          className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-[#081A46] transition-all ${
                            channel.enabled
                              ? "right-[2px]"
                              : "left-[2px]"
                          }`}
                        />
                      </button>

                      {channel.enabled ? "Enabled" : "Disabled"}
                    </div>
                  </div>

                  {channel.enabled && (
                    <div className="flex sm:gap-[40px] gap-[10px] sm:flex-nowrap flex-wrap mt-[10px]">
                      <div className="sm:max-w-[180px] w-full">
                        <AmountInput
                          label="Amount"
                          value={channel.amount}
                          onChange={(val) =>
                            handleChannelChange(index, "amount", val)
                          }
                          error={formErrors[`${channel.name.toLowerCase()}Amount`]}
                        />
                      </div>

                      <div className="sm:max-w-[180px] w-full">
                        <Input
                          label="Count"
                          placeholder="e.g 5"
                          value={channel.count}
                          onChange={(val) =>
                            handleChannelChange(index, "count", val)
                          }
                          error={formErrors[`${channel.name.toLowerCase()}Count`]}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </section>

            {/* Webhook */}
            <section className="flex flex-col w-full sm:border border-gray-100 mt-[40px] sm:p-[30px] py-[30px] rounded-[10px]">
              <span className="text-[#374151] text-[16px] font-[600]">
                Setup webhook configuration
              </span>

              <div className="flex flex-col mt-[14px]">
                <div className="grid grid-cols-12 w-full gap-[20px]">
                  <div className="sm:col-span-6 col-span-12">
                    <Select
                      label="Type"
                      options={["JSON", "ISO"]}
                      value={form.webhookType}
                      onChange={(val) =>
                        setForm({ ...form, webhookType: val })
                      }
                      error={formErrors.webhookType}
                    />
                  </div>

                  <div className="sm:col-span-6 col-span-12">
                    <Input
                      label="URL"
                      placeholder="E.g https://example.com"
                      value={form.webhookUrl}
                      onChange={(val) =>
                        setForm({ ...form, webhookUrl: val })
                      }
                      error={formErrors.webhookUrl}
                    />
                  </div>
                </div>

                <div className="w-full mt-[14px] flex flex-col rounded-[10px] gap-[12px]">
                  <span>Webhook Header</span>

                  <div className="grid grid-cols-12 w-full gap-[20px]">
                    <div className="sm:col-span-6 col-span-12">
                      <Input
                        label="Header"
                        placeholder="E.g Authorization"
                        value={form.webhookHeader}
                        onChange={(val) =>
                          setForm({ ...form, webhookHeader: val })
                        }
                        error={formErrors.webhookHeader}
                      />
                    </div>

                    <div className="sm:col-span-6 col-span-12">
                      <Input
                        label="Secret"
                        placeholder="E.g XXXXXXXXXYYYYYYZZZZZ"
                        value={form.webhookSecret}
                        onChange={(val) =>
                          setForm({ ...form, webhookSecret: val })
                        }
                        error={formErrors.webhookSecret}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
             <div className="w-full flex justify-end my-[40px] mr-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:max-w-[300px] w-full bg-[#081A46] hover:bg-[#0B245F] h-[46px] rounded-[6px] text-white text-[14px] font-[500] transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-l-transparent rounded-full animate-spin" />
                  ) : (
                    "Create Card Program"
                  )}
                </button>
              </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-[5px] w-full">
      <span className="text-[#6B7280] text-[14px] font-[500]">
        {label}
      </span>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`border ${
          error ? "border-red-500" : "border-gray-300"
        } text-[#4B5563] w-full rounded-[8px] h-[43px] outline-none focus:ring-2 focus:ring-[#bbcdfc86] p-[12px] disabled:bg-gray-50 disabled:cursor-not-allowed`}
      />
      {error && <span className="text-red-500 text-[12px]">{error}</span>}
    </div>
  );
}

function AmountInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-[5px] w-full">
      <span className="text-[#6B7280] text-[14px] font-[500]">
        {label}
      </span>

      <div className="relative w-full">
        <span className="absolute left-[12px] top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280]">
          ₦
        </span>

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`border ${
            error ? "border-red-500" : "border-gray-300"
          } text-[#4B5563] w-full rounded-[8px] h-[43px] outline-none focus:ring-2 focus:ring-[#bbcdfc86] pl-[28px] pr-[12px]`}
        />
      </div>
      {error && <span className="text-red-500 text-[12px]">{error}</span>}
    </div>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  options: (string | { label: string; value: string })[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-[5px] w-full relative">
      <span className="text-[#6B7280] text-[14px] font-[500]">
        {label}
      </span>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`border ${
          error ? "border-red-500" : "border-gray-300"
        } text-[#4B5563] w-full rounded-[8px] h-[43px] outline-none p-[12px] flex items-center justify-between bg-white`}
      >
        <span>{value || placeholder}</span>

        <ChevronDown
          size={16}
          className={`transition-all ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute top-[100%] left-0 right-0 bg-white border rounded-[8px] shadow-lg z-20 overflow-hidden mt-1 max-h-[200px] overflow-y-auto">
            {options.map((item) => {
              const labelText = typeof item === "string" ? item : item.label;
              const val = typeof item === "string" ? item : item.value;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    onChange(val);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-[14px]"
                >
                  {labelText}
                </button>
              );
            })}
          </div>
        </>
      )}
      {error && <span className="text-red-500 text-[12px]">{error}</span>}
    </div>
  );
}

function ToggleCard({
  title,
  desc,
  checked,
  value,
  onToggle,
}: {
  title: string;
  desc: string;
  checked: boolean;
  value: string;
  onToggle: () => void;
}) {
  return (
    <div className="border border-[#DADADA] px-4 py-5 flex items-center justify-between rounded-[6px]">
      <div>
        <h4 className="text-[15px] font-[700] text-[#1F2937]">
          {title}
        </h4>

        <p className="text-[12px] text-[#6B7280] mt-2">{desc}</p>
      </div>

      <div className="flex flex-col text-[11px] gap-[6px] items-center rounded-[4px] p-[14px] px-[15px] bg-[#FAFAFA] capitalize min-w-[110px]">
        <button
          type="button"
          onClick={onToggle}
          className={`w-[40px] h-[22px] rounded-full relative transition-all ${
            checked ? "bg-[#DCD9FF]" : "bg-[#E5E7EB]"
          }`}
        >
          <div
            className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-[#081A46] transition-all ${
              checked ? "right-[2px]" : "left-[2px]"
            }`}
          />
        </button>

        <span className="text-[10px] text-[#374151] font-[500]">
          {value}
        </span>
      </div>
    </div>
  );
}

function CheckCard({
  title,
  desc,
  checked,
  onClick,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col mb-[16px] border  w-full max-w-[380px] gap-[14px] p-[16px] rounded-[4px] text-left ${
        checked ? "border-[#081A46] bg-[#081a4608]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center ${
            checked ? "border-[#081A46]" : "border-gray-300"
          }`}
        >
          {checked && (
            <div className="w-[10px] h-[10px] rounded-full bg-[#081A46]" />
          )}
        </div>

        <span className="text-[14px] font-[700] text-[#111827]">
          {title}
        </span>
      </div>

      <span className="text-[12px] text-[#6B7280] ml-[30px]">
        {desc}
      </span>
    </button>
  );
}
