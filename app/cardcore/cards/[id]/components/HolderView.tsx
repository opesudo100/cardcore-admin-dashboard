// app/cardcore/cards/[id]/components/HolderView.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoadingContent } from "@/components/ui/LoadingSpinner";

const display = (value: any) => value || "--";

export function HolderView({ card, loading }: { card?: any; loading?: boolean }) {
  const holder = card?.customer || card?.cardHolder || {};
  const address = holder?.address || {};

  const holderDetails = [
    { label: "UNIQUE ID", value: display(holder?.customer?.uniqueId) },
    { label: "FIRST NAME", value: display(holder?.firstName) },
    { label: "MIDDLE NAME", value: display(holder?.middleName) },
    { label: "LAST NAME", value: display(holder?.lastName) },
    { label: "EMAIL", value: display(holder?.email || holder?.emailAddress) },
    { label: "PHON NUMBER", value: display(holder?.phone || holder?.phoneNumber) },
    { label: "DATE OF BIRTH", value: display(holder?.dateOfBirth || holder?.dob) },
    { label: "ADDRESS LINE 1", value: display(address?.line1 || holder?.addressLine1) },
    { label: "ADDRESS LINE 2", value: display(address?.line2 || holder?.addressLine2) },
    { label: "POSTAL CODE", value: display(address?.postalCode || holder?.postalCode) },
    { label: "CITY", value: display(address?.city || holder?.city) },
    { label: "STATE", value: display(address?.state || holder?.state) },
    { label: "COUNTRY", value: display(address?.country || holder?.country) },
  ];

  return (
    <div className="w-full min-w-0 pt-[10px]">
      {/* Section Title */}
      <div className="pb-[5px] border-b border-[#E5E7EB]">
        <h2 className="text-[12px] leading-[28px] font-[400] text-[#374151]">
          A summary of the card holders information
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

        {holderDetails.map((item) => (
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
              <span className="break-words text-right text-[12px] font-[700] leading-[28px] text-[#374151]">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}