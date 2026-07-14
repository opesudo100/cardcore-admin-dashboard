"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import moment from "moment";
import { toast } from "react-hot-toast";
import { CardProgramService } from "@/lib/services/cardProgramService"; 
import { UpdateDetailsForm } from "../components/UpdateDetailsForm";
import { UpdateKeysForm } from "../components/UpdateKeysForm";
import { DeactivateForm } from "../components/DeactivateForm";
import { LoadingContent } from "@/components/ui/LoadingSpinner";

export type CardProgram = {
  id?: string;
  _id?: string;
  institution: { name: string; _id?: string };
  name: string;
  type: string;
  serviceCode: string;
  scheme: string;
  active?: boolean;
  status?: string; 
  createdAt: string;
  panPrefix: string;
  panStart?: string | number; // Added field mapping
  panEnd?: string | number;   // Added field mapping
  maxExpiry: number;
  panLength: number;
  renewable: boolean | string;
  smart?: boolean | string;     // Updated type flexibility
  anonymous?: boolean | string; // Updated type flexibility
  allowTips?: boolean | string; // Updated type flexibility
  settlementAccount?: string;
  channels: {
    pos: { enabled: boolean; dailyLimit: { amount: string | number; count: string | number } };
    atm: { enabled: boolean; dailyLimit: { amount: string | number; count: string | number } };
    web: { enabled: boolean; dailyLimit: { amount: string | number; count: string | number } };
  };
  keys?: {
    _id?: string;
    mkac?: string;
    mksmi?: string;
    mksmc?: string;
    cvk?: string;
    pek?: string;
  };
};

export const CardProgramDetails = ({
  cardProgram: initialCardProgram,
  previousPage,
}: {
  cardProgram: CardProgram;
  previousPage: () => void;
}) => {
  const [activeModal, setActiveModal] = useState<"details" | "keys" | "deactivate" | null>(null);
  const [programData, setProgramData] = useState<CardProgram>(initialCardProgram);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const programId = initialCardProgram.id || initialCardProgram._id || "";

  const fetchCardProgramData = useCallback(async () => {
    if (!programId) return;
    setLoading(true);
    try {
      const res = await CardProgramService.getCardProgram(programId);
      if (res && res.data && res.data.length > 0) {
        setProgramData(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch fresh card program specifications:", err);
      toast.error("Failed to synchronize program settings with server.");
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchCardProgramData();
  }, [fetchCardProgramData]);

  const isProgramActive = programData.active === true || programData.status?.toLowerCase() === "active";

  const programChannels = [
    { 
      name: "ATM", 
      enabled: programData.channels?.atm?.enabled ?? false,
      amount: programData.channels?.atm?.dailyLimit?.amount || "0",
      count: programData.channels?.atm?.dailyLimit?.count || "0"
    },
    { 
      name: "POS", 
      enabled: programData.channels?.pos?.enabled ?? false,
      amount: programData.channels?.pos?.dailyLimit?.amount || "0",
      count: programData.channels?.pos?.dailyLimit?.count || "0"
    },
    { 
      name: "WEB", 
      enabled: programData.channels?.web?.enabled ?? false,
      amount: programData.channels?.web?.dailyLimit?.amount || "0",
      count: programData.channels?.web?.dailyLimit?.count || "0"
    },
  ];

  const handleToggleActivation = async () => {
    setActionLoading(true);
    try {
      const res = isProgramActive
        ? await CardProgramService.deleteCardProgram(programId)
        : await CardProgramService.activateCardProgram(programId);

      if (res && (res.statusCode === 200 || !res.failed)) {
        // Explict individual messages tailored for each mutation action flow
        if (isProgramActive) {
          toast.success("Card program deactivated successfully.");
        } else {
          toast.success("Card program activated successfully.");
        }
        setActiveModal(null);
        await fetchCardProgramData();
      } else {
        const fallbackError = isProgramActive 
          ? "Server rejected card program deactivation request." 
          : "Server rejected card program activation request.";
        toast.error(res?.message || fallbackError);
      }
    } catch (err) {
      console.error("Card program mutation failed:", err);
      const contextualCatchError = isProgramActive
        ? "Network interface error occurred during deactivation execution."
        : "Network interface error occurred during activation execution.";
      toast.error(contextualCatchError);
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (value: string | number) => {
    const num = Number(value) || 0;
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(num);
  };

  // Helper utility to parse multi-type booleans cleanly into display strings
  const renderBooleanValue = (value: any) => {
    if (value === true || value === "true") return "True";
    return "False";
  };

  return (
    <div className="w-full flex flex-col pb-10 animate-in fade-in duration-200">
      {/* Navigation Line */}
      <div className="flex items-center justify-between mb-6 w-full">
        <button
          onClick={previousPage}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#081a46] transition-all font-semibold"
        >
          <span className="text-[20px] leading-none">‹</span>
          <span className="text-[15px]">Back</span>
        </button>

        {/* Repositioned Top Action Button Header Panel Group */}
        {!loading && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveModal("details")}
              className="bg-[#081a46]  transition-all text-white h-[40px] px-6 rounded-[6px] text-[12px] font-semibold tracking-wide whitespace-nowrap shadow-sm cursor-pointer"
            >
              Update Details
            </button>
            <button
              onClick={() => setActiveModal("keys")}
              className="bg-[#081a46]  transition-all text-white h-[40px] px-6 rounded-[6px] text-[12px] font-semibold tracking-wide whitespace-nowrap shadow-sm cursor-pointer"
            >
              Update Keys
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="w-full h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#081a46]" />
        </div>
      ) : (
        <>
          {/* Identity Information Banner block */}
          <section className="w-full bg-[#f5f5ffcc] rounded-[8px] border border-slate-100 px-8 py-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-[22px] font-[700] text-[#1F2937] break-words">
                  {programData.name}
                </h1>
                <div className="flex items-center gap-2 mt-2 text-[#6B7280]">
                  <Image src="/assets/icons/clock.svg" alt="Time" width={15} height={15} />
                  <p className="text-[12px] font-[500]">
                    {programData.createdAt ? moment(programData.createdAt).format("llll") : "---"}
                  </p>
                </div>
                <p className="mt-5 text-[12px] text-[#6B7280] italic tracking-wide">
                  BY{" "}
                  <span className="not-italic font-[700] text-[#4B5563] uppercase">
                    {programData.institution?.name || "---"}
                  </span>
                </p>
              </div>

              <div
                className={`px-3 py-1 rounded-[4px] text-[12px] uppercase tracking-wider font-bold ${
                  isProgramActive ? "bg-[#C8F3D6] text-[#27AE60]" : "bg-red-100 text-red-700"
                }`}
              >
                {isProgramActive ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="border-t border-dashed border-[#D1D5DB] my-8" />

            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-[12px] text-[#374151] font-semibold mb-3">Card Scheme:</p>
                  <Image
                    src={`/assets/images/${programData.scheme?.toLowerCase() || "mastercard"}.svg`}
                    width={140}
                    height={45}
                    alt={programData.scheme || "Scheme"}
                    className="object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                  <span className="text-[14px] font-bold text-gray-700 capitalize block lg:hidden">{programData.scheme}</span>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-[12px] text-[#374151] font-semibold">Settlement Config:</p>
                  <span className="bg-[#081a46] text-white text-[11px] uppercase tracking-wider font-[700] px-3 py-1 rounded-[4px]">
                    {programData.settlementAccount ? "on-us" : "off-us"}
                  </span>
                </div>

                {/* Card Program Duration - Wired up dynamically */}
                <div className="bg-[#FCFCFC] border border-[#ECECEC] rounded-[4px] p-4 w-[260px]">
                  <h3 className="text-[12px] font-[600] text-[#374151] mb-4">Card Program Duration</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[#9CA3AF] text-[12px]">Starts At:</span>
                      <span className="text-[#4B5563] text-[12px] font-[500]">
                        {programData.createdAt ? moment(programData.createdAt).format("MMM DD, YYYY h:mm A") : "---"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#9CA3AF] text-[12px]">Ends At:</span>
                      <span className="text-[#4B5563] text-[12px] font-[500]">
                        {programData.createdAt ? moment(programData.createdAt).add(programData.maxExpiry || 1, "M").format("MMM DD, YYYY h:mm A") : "---"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Dynamic Metadata Grid Layout */}
              <div className="bg-white border border-gray-100 rounded-[6px] p-5 min-w-[340px] shadow-sm">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  {[
                    ["BIN / Pan Prefix", programData.panPrefix || "---"],
                    ["Max Expiry", programData.maxExpiry ? `${programData.maxExpiry} ${programData.maxExpiry > 1 ? 'months' : 'month'}` : "---"],
                    ["Pan Length", String(programData.panLength || "---")],
                    ["Pan Start", String(programData.panStart || "---")],
                    ["Pan End", String(programData.panEnd || "---")],
                    ["Service Code", programData.serviceCode || "---"],
                    ["Renewable", renderBooleanValue(programData.renewable)],
                    ["Active Status", renderBooleanValue(isProgramActive)],
                    ["Smart Card", renderBooleanValue(programData.smart)],
                    ["Anonymous Card", renderBooleanValue(programData.anonymous)],
                    ["Allow Tips", renderBooleanValue(programData.allowTips)],
                  ].map(([label, value]) => (
                    <div key={label} className="contents border-b border-gray-50">
                      <span className="text-[12px] font-medium text-[#556175]">{label}:</span>
                      <span className="text-right text-[12px] font-[700] tracking-wide text-[#1F2937] break-all">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Channels Section */}
          <section className="mt-10">
            <h2 className="text-[18px] font-[700] text-[#1F2937] mb-5">Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {programChannels.map((channel) => (
                <div key={channel.name} className="bg-white rounded-[6px] border border-gray-100 px-6 py-5 shadow-sm h-[170px] transition-all hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <h3 className="text-[18px] font-[700] text-[#081a46]">{channel.name}</h3>
                    <div className="flex flex-col items-center">
                      <div className={`w-[44px] h-[24px] rounded-full relative p-1 transition-colors duration-200 ${channel.enabled ? "bg-[#E7E5FF]" : "bg-gray-200"}`}>
                        <div className={`w-[16px] h-[16px] rounded-full transition-all duration-200 absolute top-1 ${channel.enabled ? "right-1 bg-[#081a46]" : "left-1 bg-gray-400"}`} />
                      </div>
                      <span className="text-[11px] font-semibold text-[#6B7280] mt-1">
                        {channel.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-10">
                    <div>
                      <p className="text-[12px] font-medium text-[#9CA3AF] mb-1">Daily Limit</p>
                      <h4 className="text-[16px] font-[700] text-[#1F2937]">
                        {channel.enabled ? formatCurrency(channel.amount) : "---"}
                      </h4>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-medium text-[#9CA3AF] mb-1">Count</p>
                      <h4 className="text-[16px] font-[700] text-[#1F2937]">
                        {channel.enabled ? channel.count : "---"}
                      </h4>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Manage section */}
          <section className="mt-12">
            <div className="flex flex-col gap-5">
              <div className={`rounded-[8px]  bg-white flex flex-col sm:flex-row gap-4 sm:items-center  transition-colors ${isProgramActive ? "hover:border-red-400" : "hover:border-green-400 cursor-pointer "}`}>
                <div>
                </div>
                <button
                  disabled={actionLoading}
                  onClick={() => setActiveModal("deactivate")}
                  className={` cursor-pointer transition-all text-white h-[48px] px-5 rounded-[6px] text-[12px] font-semibold tracking-wide whitespace-nowrap disabled:opacity-50 ${isProgramActive ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700 cursor-pointer"}`}
                >
                  {actionLoading ? <LoadingContent label="Processing..." /> : isProgramActive ? "Deactivate Card Program" : "Activate Card Program"}
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      {activeModal === "details" && (
        <UpdateDetailsForm
          cardProgram={programData}
          close={() => {
            setActiveModal(null);
            fetchCardProgramData();
          }}
        />
      )}
      
      {activeModal === "keys" && (
        <UpdateKeysForm 
          programId={programId}
          keys={programData.keys}
          onCancel={() => setActiveModal(null)} 
          onSuccess={() => {
            setActiveModal(null);
            fetchCardProgramData();
          }}
        />
      )}
      
      {activeModal === "deactivate" && (
        <DeactivateForm
          title={`${isProgramActive ? "Deactivate" : "Activate"} Card Program`}
          message={`Are you sure you want to alter authorization configurations for ${programData.name}?`}
          loading={actionLoading}
          onCancel={() => setActiveModal(null)}
          onConfirm={handleToggleActivation}
        />
      )}
    </div>
  );
};
