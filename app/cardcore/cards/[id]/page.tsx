"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CardTabs } from "./components/CardTabs";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import { CardService } from "@/lib/services/cardService";
import { GeneralService } from "@/lib/services/generalService";

const pickFirst = (payload: any) => {
  const data = payload?.data ?? payload;
  return Array.isArray(data) ? data[0] : data;
};

const fullName = (customer: any) =>
  [customer?.firstName, customer?.middleName, customer?.lastName]
    .filter(Boolean)
    .join(" ") || "N/A";

export default function CardDetailsPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const id = params.id;
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCard = async () => {
      setLoading(true);
      try {
        const response = await CardService.getCard(id);
        if (mounted && response?.statusCode === 200) {
          setCardDetails(pickFirst(response));
        }
      } catch (error) {
        console.error("Error fetching card details:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (id) loadCard();

    return () => {
      mounted = false;
    };
  }, [id]);

  const expiry = useMemo(
    () =>
      GeneralService.getExpiryDate(
        Number(cardDetails?.expiryMonth || 0),
        cardDetails?.expiryYear || ""
      ),
    [cardDetails?.expiryMonth, cardDetails?.expiryYear]
  );

  const scheme = cardDetails?.scheme || cardDetails?.brand || "Verve";
  const schemeIcon = GeneralService.getCardScheme(scheme);
  const maskedPan = GeneralService.formatPanNumber(cardDetails?.pan || "");
  const spacedPan = maskedPan.replace(/(.{4})/g, "$1 ").trim() || "---- ---- ---- ----";
  const initialTab = searchParams.get("card") === "transactions" ? "transactions" : undefined;

  return (
    <DashboardLayout>
      <div className="w-full min-w-0 px-0 pt-[10px] pb-[40px] sm:px-[8px]">
        <Link
          href="/cardcore/cards"
          className="inline-flex items-center gap-2 text-[15px] text-[#4B5563]  transition-colors"
        >
          <ChevronLeft size={15} strokeWidth={1.8} />
          <span>Back</span>
        </Link>

        {/* Main Content */}
        <div className="mt-8 flex w-full min-w-0 flex-col-reverse items-stretch gap-8 xl:mt-12 xl:flex-row xl:items-start xl:justify-between xl:gap-[48px]">
          {/* Left Section */}
          <div className="w-full min-w-0 xl:flex-1">
            <CardTabs
              cardId={id}
              cardDetails={cardDetails}
              loading={loading}
              initialTab={initialTab}
            />
          </div>

          <div className="w-full shrink-0 xl:-mt-[18px] xl:w-auto">
            <div className="mx-auto flex aspect-[340/210] w-full max-w-[340px] flex-col justify-between overflow-hidden rounded-[18px] bg-gradient-to-br from-[#0B1739] to-[#1e2a5f] p-5 text-white shadow-xl sm:p-6 xl:mx-0 xl:h-[210px] xl:w-[340px]">
              <div className="flex justify-end gap-2">
                <span className="bg-white backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-gray-700 font-bold uppercase tracking-wide">
                  {cardDetails?.type || cardDetails?.cardType || "Card"}
                </span>
                <span className="bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
                  <Image src="/assets/icons/9ja.svg" alt="NGN" width={14} height={10} className="object-cover rounded-sm" />
                  <span className="text-[10px]">{cardDetails?.currency || cardDetails?.currencyCode || "NGN"}</span>
                </span>
              </div>

              <div className="mt-2">
                <Image
                  src="/assets/images/panel.svg"
                  alt="Chip"
                  width={40}
                  height={30}
                  className="object-contain"
                />
              </div>

              <div className="space-y-3">
                <div className="break-words font-mono text-[13px] font-medium tracking-widest sm:text-base">
                  {loading ? (
                    <LoadingContent label="Loading..." spinnerClassName="h-4 w-4 border-white/30 border-t-white" />
                  ) : spacedPan}
                </div>

                <div className="flex items-center gap-4 text-[8px]">
                  <div className="leading-none opacity-70">
                    VALID<br />THRU
                  </div>
                  <div className="font-mono text-[12px]">
                    {expiry.month || "--"} / {expiry.year || "--"}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="min-w-0 truncate text-[10px] font-medium tracking-wide uppercase">
                  {fullName(cardDetails?.customer)}
                </span>
                <div className="relative">
                  <Image
                    src={schemeIcon}
                    alt={scheme}
                    width={60}
                    height={20}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
