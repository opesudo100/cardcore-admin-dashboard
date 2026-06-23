"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { CreateKeyModal } from "@/components/dashboard/cardcore/CreateKeyModal";
import { KeyService } from "@/lib/services/keyService";
import { GeneralService } from "@/lib/services/generalService";
import moment from "moment";

export default function KeysPage() {
  const router = useRouter();
  
  const [loadingData, setLoadingData] = useState(false);
  const [keys, setKeys] = useState<any[]>([]);
  
  // State for search and filters (matching Angular)
  const [search, setSearch] = useState("");
  const [institution, setInstitution] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const getKeys = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await KeyService.getKeys({
        search,
        startDate,
        endDate,
        institution,
        limit,
        page
      });
      
      if (!res.failed && res.statusCode === 200) {
        setKeys(res.data || []);
        setTotalPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
      }
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    } finally {
      setLoadingData(false);
    }
  }, [search, startDate, endDate, institution, limit, page]);

  useEffect(() => {
    getKeys();
  }, [getKeys]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const applyFilters = (filters: any) => {
    setInstitution(filters['Institution'] || "");
    
    if (filters['Date range']) {
      const { startDate: s, endDate: e } = filters['Date range'];
      setStartDate(s === '' && e !== '' ? moment().format('YYYY-MM-DD') : s);
      setEndDate(e === '' && s !== '' ? moment().format('YYYY-MM-DD') : e);
    }
    setPage(1);
  };

  const getFormattedDate = (date: string) => moment(date).format('ll');
  
  const shortenSecret = (sec: string) => {
    if (!sec) return '*****';
    return '*****' + sec.slice(-6);
  };

  const keyFilters = [
    {
      title: 'Date range',
      type: 'date',
      values: { startDate: '', endDate: '' },
    },
    {
      title: 'Institution',
      type: 'input',
      value: '',
    },

    // {
    //   title: 'status',
    //   type: 'select',
    //   value: '',
    //   options: [
    //     { label: 'Active', value: 'active' },
    //     { label: 'Inactive', value: 'inactive' },
    //   ],
    // },
  ];

  return (
    <DashboardLayout>
      <div className="w-full min-w-0 flex flex-col animate-in fade-in duration-150">
        <PageHeader
          totalResults={total}
          actionLabel="Add New Key"
          onSearchChange={handleSearch}
          onActionClick={() => setIsModalOpen(true)}
          filters={keyFilters}
          onFilterApply={applyFilters}
        />

        <div className="responsive-table bg-white rounded-[4px] min-h-[400px]">
          <div className="cardcore-table-header flex items-center justify-between px-3 uppercase tracking-wider sm:px-5">
            <div className="min-w-0 flex-1 sm:w-[20%] sm:flex-none">Name</div>
            <div className="hidden sm:block sm:w-[18%]">HSM</div>
            <div className="hidden sm:block sm:w-[20%]">Key</div>
            <div className="hidden sm:block sm:w-[17%]">KCV</div>
            <div className="w-[86px] shrink-0 text-right sm:w-[13%] sm:text-left">Status</div>
            <div className="hidden lg:block lg:w-[12%] lg:text-right">Created At</div>
          </div>

          <div className="divide-y divide-gray-100 flex flex-col">
            {loadingData ? (
              <div className="w-full h-[350px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
              </div>
            ) : keys.length === 0 ? (
              <div className="w-full h-[350px] flex flex-col items-center justify-center text-gray-500">
                <p className="text-lg font-medium">No cryptographic keys found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
              </div>
            ) : (
              keys.map((item, index) => (
                <button
                  key={item.id || item._id || `key-${index}`}
                  type="button"
                  onClick={() => router.push(`/cardcore/keys/${item.id || item._id}`)}
                  className="cardcore-table-row flex min-h-[70px] w-full items-center justify-between gap-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer px-3 text-[13px] text-left transition-colors sm:px-5"
                >
                  <div className="min-w-0 flex-1 font-semibold text-[#091D4A] sm:w-[20%] sm:flex-none">
                    <div className="truncate">{item.name}</div>
                    <div className="mt-1 font-mono text-[11px] font-normal text-gray-500 sm:hidden truncate">
                      {shortenSecret(item.key)}
                    </div>
                  </div>
                  <div className="hidden text-gray-600 sm:block sm:w-[18%] truncate">{item.hsmCode || item.hsm || "N/A"}</div>
                  <div className="hidden font-mono text-gray-500 sm:block sm:w-[20%] truncate pr-2">{shortenSecret(item.key)}</div>
                  <div className="hidden font-mono text-gray-500 sm:block sm:w-[17%] truncate pr-2">{shortenSecret(item.kcv)}</div>
                  <div className="w-[86px] shrink-0 text-right sm:w-[13%] sm:text-left">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-[4px] tracking-wider ${
                        item.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status || "inactive"}
                    </span>
                  </div>
                  <div className="hidden text-right text-gray-500 lg:block lg:w-[12%]">{getFormattedDate(item.createdAt)}</div>
                </button>
              ))
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

      <CreateKeyModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          getKeys(); // Refresh list after close
        }} 
      />
    </DashboardLayout>
  );
}
