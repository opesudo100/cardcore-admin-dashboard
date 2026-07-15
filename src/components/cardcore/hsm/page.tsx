"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { CreateHsmModal } from "@/components/dashboard/cardcore/CreateHsmModal";
import { HsmService } from "@/lib/services/hsmService";
import type { Hsm } from "@/types/api";
import moment from "moment";

export default function HsmPage() {
  const [loadingData, setLoadingData] = useState(false);
  const [hsms, setHsms] = useState<Hsm[]>([]);
  
  // State for search and filters (matching Angular)
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const getHsm = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await HsmService.getHsms({
        search,
        startDate,
        endDate,
        page,
        limit
      });
      
      if (res && res.statusCode === 200) {
        setHsms(res.data || []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
      }
    } catch (err) {
      console.error("Failed to fetch HSMs:", err);
    } finally {
      setLoadingData(false);
    }
  }, [search, startDate, endDate, page, limit]);

  useEffect(() => {
    getHsm();
  }, [getHsm]);

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

  const getFormattedDate = (date: string) => moment(date).format('ll');

  return (
    <>
      <div className="w-full min-w-0 flex flex-col animate-in duration-150">
        <PageHeader
          totalResults={total}
          actionLabel="Create HSM"
          onSearchChange={handleSearch}
          onActionClick={() => setIsModalOpen(true)}
          filters={[
            {
              title: 'Date range',
              type: 'date',
              values: { startDate: '', endDate: '' },
            },
          ]}
          onFilterApply={applyFilters}
        />

        {/* TABLE CONTAINER */}
        <div className="cardcore-table-container min-h-[400px]">
          {loadingData ? (
            <div className="w-full h-[350px] flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
            </div>
          ) : hsms.length === 0 ? (
            <div className="w-full h-[350px] flex flex-col items-center justify-center text-gray-500 bg-white">
              <p className="text-lg font-medium">No HSM clusters found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="cardcore-table-header">
                  <th className="w-[60%] py-4 pl-3 pr-2 font-bold text-[#4B5563] sm:w-[20%] sm:pl-6 sm:pr-4">HSM Code</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[20%]">IP Address</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[12%]">Port</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[15%]">Primary</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[15%]">Status</th>
                  <th className="w-[40%] py-4 pl-2 pr-6 font-bold text-[#4B5563] text-right sm:w-[18%] whitespace-nowrap">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[12px]">
                {hsms.map((item, index) => (
                  <tr
                    key={item.id || item._id || `hsm-${index}`}
                    className="cardcore-table-row hover:bg-slate-50/60 cursor-pointer transition-colors bg-white"
                  >
                    <td className="py-3 pl-3 pr-2 sm:py-4 sm:pl-6 sm:pr-4 font-semibold sm:font-normal">
                      <div className="truncate">{item.code}</div>
                      <div className="mt-1 w-fit max-w-full truncate bg-gray-100 px-1 text-[11px] font-normal text-gray-600 sm:hidden">
                        {item.ip} : {item.port}
                      </div>
                    </td>
                    <td className="hidden py-4 px-4 sm:table-cell truncate">{item.ip}</td>
                    <td className="hidden py-4 px-4 sm:table-cell">{item.port}</td>
                    <td className="hidden py-4 px-4 sm:table-cell">{item.isPrimary ? "true" : "false"}</td>
                    <td className="hidden py-4 px-4 sm:table-cell">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-[4px] ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {item.status || 'inactive'}
                      </span>
                    </td>
                    <td className="py-3 pl-2 pr-6 text-right sm:py-4">
                      <div className="flex flex-col items-end text-right font-medium text-gray-500">
                        <span className={`mb-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-[4px] sm:hidden ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {item.status || 'inactive'}
                        </span>
                        <span>{getFormattedDate(item.createdAt)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
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

      {/* MODAL OVERLAY */}
      <CreateHsmModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          getHsm(); // Refresh list after close
        }} 
      />
    </>
  );
}
