// app/cardcore/cards/[id]/components/CardTabs.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { DetailsView } from './DetailsView';
import { HolderView } from './HolderView';
import { TransactionView } from './TransactionView';

export function CardTabs({
  cardId,
  cardDetails,
  loading = false,
  initialTab = "details",
}: {
  cardId: string;
  cardDetails?: any;
  loading?: boolean;
  initialTab?: string;
}) {
  const [active, setActive] = useState(initialTab);

  const tabs = [
    { id: 'details', label: 'Card Details' },
    { id: 'holder', label: 'Card Holder' },
    { id: 'transactions', label: 'Card Transactions' },
  ];

  return (
    <div className="w-full min-w-0">
      {/* Tab Header */}
      <div className="mb-4 flex w-full gap-3 overflow-x-auto border-b border-[#F4F5F7] pb-0">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                shrink-0
                pb-2
                text-[14px] 
                sm:text-[15px]
                font-bold 
                transition-all 
                relative
                ${isActive 
                  ? 'text-[#111827] border-b-[3px] border-[#111827] -mb-[1px]' 
                  : 'text-[#717784] border-b-[3px] border-transparent hover:text-[#111827]'
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {active === 'details' && <DetailsView card={cardDetails} loading={loading} />}
        {active === 'holder' && <HolderView card={cardDetails} loading={loading} />}
        {active === 'transactions' && <TransactionView id={cardId} />}
      </div>
    </div>
  );
}
