// app/cardcore/cards/[id]/components/TransactionView.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { LoadingContent } from "@/components/ui/LoadingSpinner";
import { TransactionService } from "@/lib/services/transactionService";
import moment from "moment";

export function TransactionView({ id }: { id: string }) {
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const router = useRouter();

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await TransactionService.getTransactions({
        search,
        limit,
        page,
        card: id,
      });

      if (response?.statusCode === 200) {
        setTransactions(response.data || []);
        setTotalPages(response.pagination?.pages || 1);
        setTotal(response.pagination?.total || 0);
        setPage(response.pagination?.page || page);
      }
    } catch (error) {
      console.error("Error fetching card transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [id, limit, page, search]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const formatToAmount = (amount: any, currency = "NGN") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency })
      .format(Number(amount || 0))
      .replace("NGN", "₦");

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="w-full min-w-0 sm:-mt-5">
      <div className="flex justify-start sm:-mb-10">
        <PageHeader
          showActionButton={false}
          totalResults={total}
          onSearchChange={handleSearch}
        />
      </div>

      <div className="responsive-table mt-4 w-full">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            <tr className="cardcore-table-header">
              <th className="w-[58%] py-3 pl-3 pr-2 text-[11px] font-semibold text-[#6B7280] uppercase sm:w-[28%] sm:px-6">Terminal ID</th>
              <th className="hidden py-3 px-6 text-[11px] font-semibold text-[#6B7280] uppercase sm:table-cell sm:w-[28%]">RRN</th>
              <th className="hidden py-3 px-6 text-[11px] font-semibold text-[#6B7280] uppercase lg:table-cell lg:w-[18%]">Response</th>
              <th className="w-[42%] py-3 pl-2 pr-3 text-[11px] font-semibold text-[#6B7280] uppercase text-right sm:w-[26%] sm:px-6">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-[13px] font-[600] text-[#6B7280]">
                  <LoadingContent label="" spinnerClassName="h-4 w-4 border-[#09245A]/20 border-t-[#09245A]" />
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center text-[13px] font-[600] text-[#6B7280]">
                  No transactions found
                </td>
              </tr>
            ) : transactions.map((tx) => (
              <tr
                key={tx.id || tx._id || tx.rrn}
                onClick={() => router.push(`/cardcore/transactions/${tx._id || tx.id || tx.rrn}`)}
                className="cardcore-table-row hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <td className="py-3 pl-3 pr-2 text-[12px] text-[#374151] sm:px-6">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{tx.terminalId || "--"}</span>
                    <span className="mt-1 truncate font-mono text-[10px] text-[#6B7280] sm:hidden">
                      RRN: {tx.rrn || "--"}
                    </span>
                    <span className="mt-1 text-[10px] text-[#6B7280] lg:hidden">
                      Response: {tx.responseCode || tx.response?.["39"] || "--"}
                    </span>
                  </div>
                </td>
                <td className="hidden py-3 px-6 text-[13px] text-[#4B5563] font-mono sm:table-cell">{tx.rrn || "--"}</td>
                <td className="hidden py-3 px-6 text-[12px] text-[#374151] lg:table-cell">{tx.responseCode || tx.response?.["39"] || "--"}</td>
                <td className="py-3 pl-2 pr-3 text-right sm:px-6">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-gray-600">
                      {tx.createdAt ? `${moment(tx.createdAt).format("ll")} | ${moment(tx.createdAt).format("LT")}` : "--"}
                    </span>
                    <span className="text-[12px] font-bold text-[#111827]">
                      {formatToAmount(tx.amount, tx.currencyCode || "NGN")}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  );
}



 
