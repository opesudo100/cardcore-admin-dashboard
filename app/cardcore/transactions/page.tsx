"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";
import { TablePagination } from "@/components/layout/TablePagination";
import { TransactionRecord, TransactionService } from "@/lib/services/transactionService";
import { CardProgramService } from "@/lib/services/cardProgramService";
import { GeneralService } from "@/lib/services/generalService";
import moment from "moment";

interface CardProgramOption {
  id: string;
  name: string;
}

interface DateFilterValue {
  startDate?: string;
  endDate?: string;
}

type FilterValues = Record<string, string | DateFilterValue | undefined>;

export default function TransactionsPage() {
  const router = useRouter();

  const [loadingData, setLoadingData] = useState(false);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [cardPrograms, setCardPrograms] = useState<CardProgramOption[]>([]);
  
  // State for search and filters (matching Angular)
  const [search, setSearch] = useState("");
  const [limit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [transmissiondateFrom, setTransmissiondateFrom] = useState("");
  const [transmissiondateTo, setTransmissiondateTo] = useState("");
  const [cardProgram, setCardProgram] = useState("");
  const [amountMax, setAmountMax] = useState(0);
  const [amountMin, setAmountMin] = useState(0);
  const [wallet, setWallet] = useState("");
  const [account, setAccount] = useState("");
  const [card, setCard] = useState("");
  const [currencyCode, setCurrencyCode] = useState("");
  const [tags, setTags] = useState("");

  const loadCardPrograms = useCallback(async () => {
    try {
      const res = await CardProgramService.getCardPrograms();
      if (res && res.statusCode === 200) {
        setCardPrograms(res.data || []);
      }
    } catch (err) {
      console.error("Error loading card programs:", err);
    }
  }, []);

  const getTransactions = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await TransactionService.getTransactions({
        search,
        limit,
        page,
        startDate,
        endDate,
        transmissiondateFrom,
        transmissiondateTo,
        cardProgram,
        amountMax,
        amountMin,
        wallet,
        account,
        card,
        currencyCode,
        tags
      });
      
      if (res && res.statusCode === 200) {
        setTransactions(res.data || []);
        setTotalPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingData(false);
    }
  }, [search, limit, page, startDate, endDate, transmissiondateFrom, transmissiondateTo, cardProgram, amountMax, amountMin, wallet, account, card, currencyCode, tags]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getTransactions();
    loadCardPrograms();
  }, [getTransactions, loadCardPrograms]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const applyFilters = (filters: FilterValues) => {
    const dateRange = filters['Date range'];
    if (typeof dateRange === "object" && dateRange) {
      const { startDate: s = "", endDate: e = "" } = dateRange;
      setStartDate(s === '' && e !== '' ? moment().format('YYYY-MM-DD') : s);
      setEndDate(e === '' && s !== '' ? moment().format('YYYY-MM-DD') : e);
    }
    
    const transmissionDate = filters['Transmission Start Date'];
    if (typeof transmissionDate === "object" && transmissionDate) {
      const { startDate: s = "", endDate: e = "" } = transmissionDate;
      setTransmissiondateFrom(s);
      setTransmissiondateTo(e);
    }

    setCardProgram(String(filters['Transaction Program'] || ""));
    setAmountMax(parseFloat(String(filters['Max. Amount'] || "")) || 0);
    setAmountMin(parseFloat(String(filters['Min. Amount'] || "")) || 0);
    setWallet(String(filters['Wallet'] || ""));
    setAccount(String(filters['Account'] || ""));
    setCard(String(filters['Card'] || ""));
    setCurrencyCode(String(filters['Currency Code'] || ""));
    setTags(String(filters['Tag'] || ""));
    
    setPage(1);
  };

  const formatToAmount = (amount: number, currency: string = 'NGN'): string => {
    if (!amount) return '₦0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    })
      .format(amount)
      .replace('NGN', '₦');
  };

  const getStatusStyle = (code: string) => {
    const res = GeneralService.getResponseCode(code);
    return {
      border: res?.color || "border-l-2 border-l-slate-600",
      box: res?.box || "bg-slate-600",
      message: res?.message || "",
    };
  };

  const getDate = (date: string) => moment(date).format('ll');
  const getTime = (date: string) => moment(date).format('LT');

  const filters = [
    {
      title: 'Date range',
      type: 'date',
      values: { startDate: '', endDate: '' },
    },
    {
      title: 'Transmission Start Date',
      type: 'date',
      values: { startDate: '', endDate: '' },
    },
    {
      title: 'Transaction Program',
      type: 'select',
      value: '',
      options: cardPrograms.map((p) => ({
        label: p.name,
        value: p.id,
      })),
    },
    {
      title: 'Max. Amount',
      type: 'number',
      value: '',
    },
    {
      title: 'Min. Amount',
      type: 'number',
      value: '',
    },
    {
      title: 'Tag',
      type: 'input',
      value: '',
    },
    {
      title: 'Wallet',
      type: 'input',
      value: '',
    },
    {
      title: 'Account',
      type: 'input',
      value: '',
    },
    {
      title: 'Card',
      type: 'input',
      value: '',
    },
    {
      title: 'Currency Code',
      type: 'input',
      value: '',
    },
  ];

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col animate-in fade-in duration-150 min-w-0">
        <PageHeader
          totalResults={total}
          showActionButton={false}
          onSearchChange={handleSearch}
          filters={filters}
          onFilterApply={applyFilters}
        />

        <div className="responsive-table bg-white min-h-[400px]">
          {/* TABLE HEADER */}
          <div className="cardcore-table-header flex items-center justify-between border-y border-[#E5E7EB] px-3 sm:px-0">
            <div className="min-w-0 flex-1 sm:w-[30%] sm:flex-none sm:px-5">Card</div>
            <div className="hidden sm:block sm:w-[12%] sm:px-3">RESPONSE</div>
            <div className="hidden sm:block sm:w-[17%] sm:px-3">RRN</div>
            <div className="hidden lg:block lg:w-[17%] lg:px-3">TERMINAL ID</div>
            <div className="hidden xl:block xl:w-[10%] xl:px-3">STAN</div>
            <div className="w-[120px] shrink-0 text-right sm:w-[24%] sm:px-5 lg:w-[14%]">AMOUNT</div>
          </div>

          {/* TABLE BODY */}
          <div className="flex flex-col">
            {loadingData ? (
              <div className="w-full h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="w-full h-[350px] flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg font-medium">No transactions found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
              </div>
            ) : (
              transactions.map((item, index) => {
                const style = getStatusStyle(item.transactionStatus || "");
                const responseText = item.response?.["0"] || item.responseCode || "";
                return (
                  <div
                    key={item.id || item._id || `tx-${index}`}
                    onClick={() => router.push(`/cardcore/transactions/${item._id || item.id || item.rrn}`)}
                    className={`cardcore-table-row flex w-full items-center justify-between gap-3 border-b border-[#E5E7EB] hover:bg-[#FAFAFA] cursor-pointer ${style.border}`}
                  >
                    <div className="min-w-0 flex-1 flex flex-col justify-center pl-3 sm:w-[30%] sm:flex-none sm:px-5">
                      <span className="text-[12px] text-[#374151] font-semibold truncate sm:font-normal">
                        {item.institution?.name || "N/A"} | {item.card?.customer?.firstName || "Unknown"} {item.card?.customer?.lastName || ""}
                      </span>
                      <span className="text-[12px] text-[#6B7280] mt-1">
                        {getDate(item.createdAt || "")} | {getTime(item.createdAt || "")}
                      </span>
                      <span className="text-[10px] text-[#6B7280] mt-1 sm:hidden truncate">
                        RRN: {item.rrn || "N/A"}
                      </span>
                    </div>
                    <div className="hidden items-center gap-2 px-3 sm:flex sm:w-[12%]">
                      {style.message && (
                        <span className={`${style.box} text-white text-[10px] font-[700] px-2 py-[2px] rounded-full`}>
                          {style.message}
                        </span>
                      )}
                      <span className="text-[12px] text-[#374151] font-[500]">{responseText}</span>
                    </div>
                    <div className="hidden items-center px-3 text-[12px] text-[#374151] sm:flex sm:w-[17%] truncate">{item.rrn}</div>
                    <div className="hidden items-center px-3 text-[12px] text-[#374151] lg:flex lg:w-[17%] truncate">{item.terminalId}</div>
                    <div className="hidden items-center px-3 text-[12px] text-[#374151] xl:flex xl:w-[10%] truncate">{item.stan}</div>
                    <div className="flex w-[120px] shrink-0 flex-col items-end justify-center pr-3 text-right text-[12px] font-[700] text-[#374151] sm:w-[24%] sm:px-5 lg:w-[14%]">
                      {style.message && (
                        <span className="mb-1 flex items-center gap-1 rounded-[10px] bg-gray-100 px-2 text-[10px] font-medium sm:hidden">
                          <span className={`${style.box} h-fit rounded-full px-1 leading-[10px] text-white`}>
                            {style.message}
                          </span>
                          {responseText}
                        </span>
                      )}
                      <span className="whitespace-nowrap">{formatToAmount(item.amount || 0, item.currencyCode)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
