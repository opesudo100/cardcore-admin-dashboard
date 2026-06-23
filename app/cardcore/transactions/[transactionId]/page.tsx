"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import { TransactionService } from "@/lib/services/transactionService";
import { GeneralService } from "@/lib/services/generalService";
import {
  AccountType,
  PosConditionCode,
  PosEntryMode,
  serviceCodes,
} from "@/lib/constants/isoCode";

import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Info,
} from "lucide-react";

const pickFirst = (payload: any) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data[0] : data;
};

const display = (value: any) => value || "N/A";

const formatDescription = (value?: string) =>
  value ? value.replaceAll("_", " ") : "N/A";

const getTimestamp = (transaction: any, key: string) =>
  transaction?.timestamps?.[key]?.timestamp || "";

const getResponseMessage = (transaction: any) =>
  transaction?.response?.["0"] || "N/A";

const getResponseCode = (transaction: any) =>
  transaction?.response?.["39"] || transaction?.responseCode || "N/A";

const getIsoResponseLabel = (code: string) =>
  code && code !== "N/A"
    ? `${code} - (${formatDescription(GeneralService.getISOCodes(code).description)})`
    : "N/A";

const getAccountTypeLabel = (type: string) =>
  type ? `${type} (${AccountType[type as keyof typeof AccountType] || "N/A"})` : "N/A";

const getPosEntryModeLabel = (code: string) =>
  code ? `${code} (${PosEntryMode[code]?.meaning || ""})` : "N/A";

const getConditionCodeLabel = (code: string) =>
  code ? `${code} (${PosConditionCode[code]?.meaning || ""})` : "N/A";

const getServiceCodeLabel = (code: string) => {
  if (!code) return "N/A";
  const field = serviceCodes.find((item) => item.code === code);
  return field ? `${code} (${field.interchange} || ${field.restrictions})` : code;
};

const getAcceptorAddress = (transaction: any) => {
  const acceptorData = transaction?.posData?.acceptorData;
  if (!acceptorData) return "N/A";

  return (
    [acceptorData["2"], acceptorData["4"], acceptorData["5"], acceptorData["7"]]
      .filter(Boolean)
      .join(", ") || "N/A"
  );
};

const InfoRow = ({
  label,
  value,
  noBorder = false,
}: {
  label: string;
  value: React.ReactNode;
  noBorder?: boolean;
}) => {
  return (
    <div
      className={`grid grid-cols-12 gap-3 py-3 text-[10px] ${
        !noBorder ? "border-b border-[#E5E7EB]" : ""
      }`}
    >
      <span className="col-span-5 text-[#6B7280]">{label}</span>
      <div className="col-span-7 text-[#374151] break-words font-[500]">{value}</div>
    </div>
  );
};

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <div className="border border-[#E5E7EB] bg-white rounded-[4px] overflow-hidden">
      <div className="h-[46px] border-b border-[#E5E7EB] px-5 flex items-center bg-[#FAFAFA]">
        <h3 className="text-[14px] font-[600] text-[#111827]">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const transactionId = params.transactionId as string;
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadTransaction = async () => {
      setLoading(true);
      try {
        const response = await TransactionService.getTransactionById(transactionId);
        if (mounted && response?.statusCode === 200) {
          setTransactionDetails(pickFirst(response));
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (transactionId) loadTransaction();

    return () => {
      mounted = false;
    };
  }, [transactionId]);

  const formatToAmount = (val: any, currency = "NGN") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency })
      .format(Number(val || 0))
      .replace("NGN", "₦");

  const fullDateTime = (date: string) =>
    date
      ? new Date(date).toLocaleString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "N/A";

  const formatLocalDate = (date: string) => {
    if (!date || date.length < 14) return "N/A";
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    const hour = date.slice(8, 10);
    const minute = date.slice(10, 12);
    const second = date.slice(12, 14);
    return `${day}/${month}/${year} -- ${hour}:${minute}:${second}`;
  };

  const posDataTags = useMemo(() => {
    const code = transactionDetails?.transactionChannel?.posDataCode;
    if (!code) return [];
    try {
      return GeneralService.decodePosDataCode(code).map(
        (item) => `${item.value} - ${item.meaning}`
      );
    } catch {
      return [];
    }
  }, [transactionDetails?.transactionChannel?.posDataCode]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-[14px] font-[600] text-[#6B7280]">
          <LoadingContent
            label="Loading transaction details..."
            spinnerClassName="h-4 w-4 border-[#09245A]/20 border-t-[#09245A]"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (!transactionDetails) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-[18px] font-[600] text-red-500">Transaction not found</h1>
        </div>
      </DashboardLayout>
    );
  }

  const responseCode = getResponseCode(transactionDetails);
  const responseMessage = getResponseMessage(transactionDetails);
  const mti = transactionDetails?.mti || "N/A";
  const localDate = transactionDetails?.dates?.local || "";

  const expiry = `${transactionDetails?.card?.expiryMonth || "--"} / ${
    transactionDetails?.card?.expiryYear || "--"
  }`;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-10 max-w-[1800px] mx-auto animate-in fade-in duration-200">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#6B7280] w-fit text-[13px] hover:text-[#111827]"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {/* FLOW */}
        <div className="border border-gray-100 bg-white rounded-[4px] overflow-hidden">
          {/* Header */}
          <div className="h-[52px] border-b border-gray-100 px-5 flex items-center">
            <h2 className="text-[15px] font-[600] text-[#111827]">
              Transaction Number:
              <span className="ml-2 font-[700]">{display(transactionDetails?.rrn)}</span>
            </h2>
          </div>

          {/* Flow body — stacks vertically on mobile only, horizontal from sm up */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8">

            {/* ORIGIN */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <div className="text-[13px]">
                <span className="text-[#6B7280]">Origin:</span>{" "}
                <span className="font-[700]">JCARD</span>
              </div>

              <div className="bg-[#F3F4F6] p-4 flex flex-col gap-3 text-[11px] text-[#6B7280] w-full sm:min-w-[260px] rounded-[4px]">
                <div className="flex items-center gap-2">
                  <ArrowRight size={14} className="shrink-0" />
                  <span>
                    {mti} ({fullDateTime(getTimestamp(transactionDetails, "jcardToCardCore"))})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowLeft size={14} className="shrink-0" />
                  <span>
                    {responseMessage} (
                    {fullDateTime(getTimestamp(transactionDetails, "cardCoreToJcard"))})
                  </span>
                </div>
              </div>
            </div>

            {/* CENTER GLOBE */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span className="text-[12px] text-[#374151]">Online System</span>
              <Globe size={36} className="text-[#374151]" />
            </div>

            {/* DESTINATION */}
            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <div className="text-[13px]">
                <span className="text-[#6B7280]">Destination:</span>{" "}
                <span className="font-[700]">
                  {display(transactionDetails?.institution?.name)}
                </span>
              </div>

              <div className="bg-[#F3F4F6] p-4 flex flex-col gap-3 text-[11px] text-[#6B7280] w-full sm:min-w-[260px] rounded-[4px]">
                <div className="flex items-center gap-2">
                  <ArrowRight size={14} className="shrink-0" />
                  <span>
                    {mti} (
                    {fullDateTime(
                      getTimestamp(transactionDetails, "cardCoreToInstitution")
                    )}
                    )
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowLeft size={14} className="shrink-0" />
                  <span>
                    {responseMessage} (
                    {fullDateTime(
                      getTimestamp(transactionDetails, "institutionToCardCore")
                    )}
                    )
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* CONTENT — two columns from sm (640px) up, single column on mobile */}
        <div className="grid grid-cols-12 gap-5">

          {/* LEFT */}
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-5">
            <SectionCard title="Summary">
              <InfoRow
                label="PAN"
                value={display(
                  GeneralService.formatPanNumber(
                    transactionDetails?.card?.pan || ""
                  ).trim()
                )}
              />
              <InfoRow label="Terminal ID" value={display(transactionDetails?.terminalId)} />
              <InfoRow label="Card Acceptor ID" value="--" noBorder />
            </SectionCard>

            <SectionCard title="POS Data">
              <InfoRow
                label="Acceptor Address"
                value={getAcceptorAddress(transactionDetails)}
              />
              <InfoRow
                label="Category Code"
                value={display(transactionDetails?.posData?.categoryCode)}
                noBorder
              />
            </SectionCard>

            <SectionCard title="TPP Data">
              <InfoRow
                label="Network"
                value={display(transactionDetails?.tppData?.networkName)}
              />
              <InfoRow
                label="Protocol Version"
                value={display(transactionDetails?.tppData?.protocolVersion)}
                noBorder
              />
            </SectionCard>

            <SectionCard title="Amounts">
              <InfoRow
                label="Amount"
                value={formatToAmount(
                  transactionDetails?.amount,
                  transactionDetails?.currencyCode || "NGN"
                )}
              />
              <InfoRow
                label="Merchant Fee"
                value={formatToAmount(
                  transactionDetails?.merchantFeeAmount,
                  transactionDetails?.currencyCode || "NGN"
                )}
                noBorder
              />
            </SectionCard>

            <SectionCard title="Transaction">
              <InfoRow
                label="Real Time Transaction Number"
                value={display(transactionDetails?.rrn)}
              />
              <InfoRow
                label="Message Type"
                value={`${mti} (${transactionDetails?.messageType || "N/A"})`}
              />
              <InfoRow
                label="Transaction Type"
                value={display(transactionDetails?.transactionType)}
              />
              <InfoRow
                label="Retrieval Ref. No."
                value={display(transactionDetails?.rrn)}
              />
              <InfoRow
                label="Source Node"
                value={display(transactionDetails?.institutions?.acquirer)}
              />
              <InfoRow
                label="Sink Node"
                value={display(transactionDetails?.institutions?.forwarding)}
              />
              <InfoRow
                label="Message Reason Code"
                value={`${responseCode} ${
                  GeneralService.getISOFields(responseCode).description
                }`}
              />
              <InfoRow
                label="System Trace Audit No."
                value={display(transactionDetails?.stan)}
              />
              <InfoRow
                label="Original Transaction Approved"
                value={display(transactionDetails?.transactionStatus)}
              />
              <InfoRow
                label="Transaction Reversed"
                value={transactionDetails?.reversed ? "Yes" : "No"}
                noBorder
              />
            </SectionCard>

            {/* DATE & TIME */}
            <SectionCard title="Date And Time">
              <InfoRow
                label="Terminal Date/Time (Local)"
                value={formatLocalDate(localDate)}
              />
              <InfoRow
                label="Local Date/Time (GMT)"
                value={formatLocalDate(localDate)}
                noBorder
              />
            </SectionCard>
          </div>

          {/* RIGHT */}
          <div className="col-span-12 sm:col-span-6 flex flex-col gap-5">
            <SectionCard title="Card">
              <InfoRow
                label="Card Number (PAN)"
                value={display(
                  GeneralService.formatPanNumber(transactionDetails?.card?.pan || "")
                )}
              />
              <InfoRow
                label="Card Sequence No."
                value={display(
                  transactionDetails?.card?.seqNumber ||
                    transactionDetails?.card?.sequenceNumber
                )}
              />
              <InfoRow label="Card Expiry Date" value={expiry} />
              <InfoRow
                label="Service Restriction Code"
                value={display(transactionDetails?.card?.serviceCode)}
                noBorder
              />
            </SectionCard>

            <SectionCard title="Account">
              <InfoRow
                label="From Account Type"
                value={getAccountTypeLabel(
                  transactionDetails?.card?.account?.type || ""
                )}
              />
              <InfoRow
                label="From Account ID"
                value={display(transactionDetails?.accounts?.account1)}
              />
              <InfoRow label="To Account Type" value="--" />
              <InfoRow
                label="To Account ID"
                value={display(transactionDetails?.accounts?.account2)}
                noBorder
              />
            </SectionCard>

            <SectionCard title="Response Codes">
              <InfoRow
                label="Request Code"
                value={getIsoResponseLabel(
                  transactionDetails?.originalMessage?.["39"] || ""
                )}
              />
              <InfoRow
                label="Response Code"
                value={getIsoResponseLabel(responseCode)}
                noBorder
              />
            </SectionCard>

            <SectionCard title="Transaction Channel">
              <InfoRow
                label="Channel Type"
                value={`${display(
                  transactionDetails?.transactionChannel?.channelType
                )} (${display(
                  transactionDetails?.transactionChannel?.detailedChannelType
                )})`}
              />
              <InfoRow
                label="Entry Mode"
                value={getPosEntryModeLabel(
                  transactionDetails?.transactionChannel?.entryMode || ""
                )}
              />
              <InfoRow
                label="Card Present"
                value={
                  transactionDetails?.transactionChannel?.isCardPresent ? "Yes" : "No"
                }
              />
              <InfoRow
                label="POS Condition Code"
                value={getConditionCodeLabel(
                  transactionDetails?.transactionChannel?.posConditionCode || ""
                )}
              />

              {/* POS DATA CODE */}
              <div className="border-b border-[#E5E7EB] py-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[#6B7280] text-[13px]">POS Data Code</span>
                  <span className="font-mono text-[13px] text-[#374151]">
                    {display(transactionDetails?.transactionChannel?.posDataCode)}
                  </span>
                  <Info size={14} className="text-gray-400" />
                </div>

                <div className="flex flex-wrap gap-2">
                  {posDataTags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-[#F3F4F6] border border-[#E5E7EB] px-3 py-1 rounded-[3px] text-[11px] text-[#6B7280]"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>

              <InfoRow
                label="Service Code"
                value={getServiceCodeLabel(
                  transactionDetails?.transactionChannel?.serviceCode || ""
                )}
              />
              <InfoRow
                label="Method"
                value={
                  transactionDetails?.transactionChannel?.isPhysical
                    ? "Physical"
                    : transactionDetails?.transactionChannel?.isOnline
                      ? "Online"
                      : transactionDetails?.transactionChannel?.isAtm
                        ? "ATM"
                        : "N/A"
                }
                noBorder
              />
            </SectionCard>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}