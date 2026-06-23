"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
    <DashboardLayout>
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
        <div className="responsive-table bg-white rounded-[4px] min-h-[400px]">
          <div className="cardcore-table-header flex items-center justify-between uppercase tracking-wider px-3 sm:px-0">
            <div className="min-w-0 flex-1 sm:w-[20%] sm:flex-none sm:px-5">HSM Code</div>
            <div className="hidden sm:block sm:w-[20%] sm:px-3">IP Address</div>
            <div className="hidden sm:block sm:w-[12%] sm:px-3">Port</div>
            <div className="hidden sm:block sm:w-[15%] sm:px-3">Primary</div>
            <div className="hidden sm:block sm:w-[15%] sm:px-3">Status</div>
            <div className="w-[108px] shrink-0 text-right sm:w-[18%] sm:px-5">Created At</div>
          </div>

          <div className="w-full flex flex-col">
            {loadingData ? (
              <div className="w-full h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
              </div>
            ) : hsms.length === 0 ? (
              <div className="w-full h-[350px] flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg font-medium">No HSM clusters found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
              </div>
            ) : (
              hsms.map((item, index) => (
                <div
                  key={item.id || item._id || `hsm-${index}`}
                  className="cardcore-table-row flex w-full items-center justify-between gap-3 border-b border-[#E5E7EB] text-[12px]"
                >
                  <div className="min-w-0 flex-1 pl-3 font-semibold sm:w-[20%] sm:flex-none sm:px-5 sm:font-normal">
                    <div className="truncate">{item.code}</div>
                    <div className="mt-1 w-fit max-w-full truncate bg-gray-100 px-1 text-[11px] font-normal text-gray-600 sm:hidden">
                      {item.ip} : {item.port}
                    </div>
                  </div>
                  <div className="hidden px-3 sm:block sm:w-[20%] truncate">{item.ip}</div>
                  <div className="hidden px-3 sm:block sm:w-[12%]">{item.port}</div>
                  <div className="hidden px-3 sm:block sm:w-[15%]">{item.isPrimary ? "true" : "false"}</div>
                  <div className="hidden px-3 sm:block sm:w-[15%]">
                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-[4px] ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status || 'inactive'}
                    </span>
                  </div>
                  <div className="flex w-[108px] shrink-0 flex-col items-end pr-3 text-right font-medium text-gray-500 sm:w-[18%] sm:px-5">
                    <span className={`mb-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-[4px] sm:hidden ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.status || 'inactive'}
                    </span>
                    <span>{getFormattedDate(item.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
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
    </DashboardLayout>
  );
}
