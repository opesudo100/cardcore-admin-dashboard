"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { CardService } from "@/lib/services/cardService";
import { GeneralService } from "@/lib/services/generalService";
import moment from "moment";

const CARD_FILTERS = [
  {
    title: "Date range",
    type: "date",
    values: {
      startDate: '',
      endDate: '',
    },
  },
];

export default function CardsPage() {
  const [loadingData, setLoadingData] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // States matching Angular logic
  const [type, setType] = useState('');
  const [scheme, setScheme] = useState('');
  const [cardProgram, setCardProgram] = useState('');

  const router = useRouter();

  const getCards = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await CardService.getCards({
        search,
        type,
        scheme,
        startDate,
        endDate,
        cardProgram,
        limit,
        page
      });
      
      if (!res.failed && res.statusCode === 200) {
        setCards(res.data || []);
        setTotalPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
      }
    } catch (err) {
      console.error("Failed to fetch cards:", err);
    } finally {
      setLoadingData(false);
    }
  }, [search, type, scheme, startDate, endDate, cardProgram, limit, page]);

  useEffect(() => {
    getCards();
  }, [getCards]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const applyFilters = (filters: any) => {
    if (filters['Date range']) {
      const { startDate: s, endDate: e } = filters['Date range'];
      setStartDate(s === '' && e !== '' ? moment().format('YYYY-MM-DD') : s);
      setEndDate(e === '' && s !== '' ? moment().format('YYYY-MM-DD') : e);
    }
    setPage(1);
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'active') return 'bg-green-100 text-green-600';
    if (s === 'pending') return 'bg-[#daa5202b] text-[goldenrod]';
    if (['deleted', 'inactive', 'blocked'].includes(s)) return 'bg-red-100 text-red-600';
    return 'bg-[#081a4621] text-[#081A46]';
  };

  const formatPanNumber = (pan: string) => {
    return GeneralService.formatPanNumber(pan);
  };

  return (
    <DashboardLayout>
      <div className="w-full min-w-0 flex flex-col animate-in fade-in duration-150">
        {/* Header */}
        <PageHeader
          totalResults={total}
          showActionButton={false}
          onSearchChange={handleSearch}
          filters={CARD_FILTERS}
          onFilterApply={applyFilters}
        />

        {/* Table */}
        <div className="responsive-table rounded-[2px] min-h-[400px]">
          {loadingData ? (
            <div className="w-full h-[400px] flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
            </div>
          ) : cards.length === 0 ? (
            <div className="w-full h-[400px] flex flex-col items-center justify-center text-gray-500 bg-white">
              <p className="text-lg font-medium">No cards found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="cardcore-table-header">
                  <th className="w-[64%] py-4 pl-3 pr-2 font-bold text-[#4B5563] sm:w-[30%] sm:pl-6 sm:pr-4">Issuer</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[30%]">Card Details</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] lg:table-cell lg:w-[12%]">Status</th>
                  <th className="w-[36%] py-4 pl-2 pr-3 font-bold text-[#4B5563] text-right sm:w-[18%] sm:px-4 sm:text-left">Card Scheme</th>
                  <th className="hidden py-4 pl-4 pr-6 font-bold text-[#4B5563] text-right lg:table-cell lg:w-[10%]">Created At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-[13px]">
                {cards.map((card, index) => (
                  <tr
                    key={card.id || card._id || `card-${index}`}
                    onClick={() => router.push(`/cardcore/cards/${card.id || card._id}`)}
                    className="cardcore-table-row hover:bg-slate-50/60 cursor-pointer transition-colors bg-white"
                  >
                    <td className="py-3 pl-3 pr-2 sm:py-4 sm:pl-6 sm:pr-4">
                      <div className="flex min-w-0 flex-col">
                        <span className="text-gray-700 font-semibold sm:font-medium truncate">
                        {card.institution?.name || card.cardProgram?.institution?.name || card.issuer || "N/A"}
                        </span>
                        <span className="text-[12px] text-gray-700 sm:hidden truncate">
                          {card.customer 
                            ? `${card.customer.firstName} ${card.customer.lastName}`
                            : card.customerName || card.holder || "Unknown"
                          }
                        </span>
                        <span className="text-[10px] text-gray-500 sm:hidden truncate">
                          {formatPanNumber(card.pan)}
                        </span>
                        <span className={`mt-1 inline-flex w-fit items-center px-2 py-0.5 rounded-[4px] text-[9px] font-extrabold tracking-wider uppercase lg:hidden ${getStatusStyle(card.status)}`}>
                          {card.status || "UNKNOWN"}
                        </span>
                      </div>
                    </td>

                    <td className="hidden py-4 px-4 sm:table-cell">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-700">
                          {card.customer 
                            ? `${card.customer.firstName} ${card.customer.lastName}`
                            : card.customerName || card.holder || "Unknown"
                          }
                        </span>
                        <span className="text-[12px] text-gray-600 font-normal">
                          {formatPanNumber(card.pan)}
                        </span>
                      </div>
                    </td>

                    <td className="hidden py-4 px-4 lg:table-cell">
                      <span className={`inline-flex items-center px-3 py-1 rounded-[4px] text-[11px] font-extrabold tracking-wider uppercase ${getStatusStyle(card.status)}`}>
                        {card.status || "UNKNOWN"}
                      </span>
                    </td>

                    <td className="py-3 pl-2 pr-3 sm:py-4 sm:px-4">
                      <div className="flex items-center justify-end gap-1 sm:justify-start sm:gap-2">
                        <span className="text-[10px] text-gray-700 font-medium uppercase sm:text-[13px]">
                          {card.type || card.scheme}
                        </span>
                        <span className="text-gray-400 text-[10px] hidden sm:inline">•</span>
                        <div className="h-[32px] min-w-[48px] px-2 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center sm:h-[35px] sm:min-w-[68px] sm:px-3">
                          <Image
                            src={`/assets/images/${(card.scheme || card.brand || 'verve').toLowerCase()}.svg`}
                            alt={card.scheme || "scheme"}
                            width={40}
                            height={25}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    </td>

                    <td className="hidden py-4 pl-4 pr-6 text-gray-500 font-normal text-right whitespace-nowrap lg:table-cell">
                      {moment(card.createdAt || card.date).format('ll')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6">
          <TablePagination
            page={page}
            totalPages={totalPages}
            totalResults={total}
            pageLimit={limit}
            onPageChange={setPage}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
