// app/cardcore/cards/[id]/components/DetailsView.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import Image from "next/image";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import { GeneralService } from "@/lib/services/generalService";

const display = (value: any) => {
  if (value === true) return "TRUE";
  if (value === false) return "FALSE";
  
  return value || "";
};

export function DetailsView({ card, loading }: { card?: any; loading?: boolean }) {
  const expiry = GeneralService.getExpiryDate(
    Number(card?.expiryMonth || 0),
    card?.expiryYear || ""
  );
  const scheme = card?.scheme || card?.brand || "Verve";
  const schemeIcon = GeneralService.getCardScheme(scheme);
  const account = card?.account || card?.accounts?.[0] || {};

  const details = [
    { label: "PAN", value: GeneralService.formatPanNumber(card?.pan || "") || "--" },
    { label: "CVV", value: "***" },
    { label: "EXPIRY DATE", value: `${expiry.month || "--"} / ${expiry.year || "--"}` },
    { label: "CARD PROGRAM", value: card?.cardProgram?.name || card?.program?.name || card?.cardProgram || "--" },
    { label: "BIN", value: card?.bin || card?.pan?.slice?.(0, 6) || "--" },
    { label: "PIN ENABLED", value: display(card?.pinEnabled) },
    { label: "DEFAULT PIN", value: display(card?.defaultPin)  },
    { label: "SEQUENCE NUMBER", value: display(card?.seqNumber || card?.sequenceNumber) },
    { label: "2FA ENABLED", value: display(card?.enroll2FA) },
    { label: "CARD SCHEME", value: "IMAGE" },
    { label: "ACCOUNT NUMBER", value: display(card?.account?.number) },
    { label: "CURRENCY", value: display(card?.currency || card?.currencyCode || account?.currency) },
    { label: "BANK CODE", value: display(account?.bankCode || card?.bankCode) },
  ];

  return (
    <div className="w-full min-w-0 pt-[10px]">
      {/* Section Title */}
      <div className="pb-[5px] border-b border-[#E5E7EB]">
        <h2 className="text-[12px] leading-[28px] font-[400] text-[#374151]">
          A summary of the card details
        </h2>
      </div>

      {/* Details List */}
      <div className="pt-[10px] flex flex-col">
        {loading && (
          <div className="py-8 text-[13px] font-[600] text-[#6B7280]">
            <LoadingContent
              label=""
              spinnerClassName="h-4 w-4 border-[#09245A]/20 border-t-[#09245A]"
            />
          </div>
        )}

        {details.map((item) => (
          <div
            key={item.label}
            className="flex flex-row items-start justify-between gap-4 border-b border-[#E5E7EB] py-[14px] last:border-b-0"
          >
            {/* Label — always on the left */}
            <span className="shrink-0 text-[10px] font-[500] uppercase leading-[24px] text-[#374151]">
              {item.label}
            </span>

            {/* Value — always on the right */}
            <div className="flex min-w-0 flex-1 justify-end">
              {item.value === "IMAGE" ? (
                <div className="flex h-[32px] w-[56px] items-center justify-center rounded-[4px] bg-[#F3F4F6]">
                  <Image
                    src={schemeIcon}
                    alt={scheme}
                    width={48}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <span className="break-words text-right text-[12px] font-[700] leading-[28px] text-[#374151]">
                  {item.value}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}