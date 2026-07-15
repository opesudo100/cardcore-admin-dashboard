"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
    <>
      <div className="w-full min-w-0 flex flex-col animate-in fade-in duration-150">
        <PageHeader
          totalResults={total}
          actionLabel="Add New Key"
          onSearchChange={handleSearch}
          onActionClick={() => setIsModalOpen(true)}
          filters={keyFilters}
          onFilterApply={applyFilters}
        />

        <div className="cardcore-table-container min-h-[400px]">
          {loadingData ? (
            <div className="w-full h-[350px] flex items-center justify-center bg-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
            </div>
          ) : keys.length === 0 ? (
            <div className="w-full h-[350px] flex flex-col items-center justify-center text-gray-500 bg-white">
              <p className="text-lg font-medium">No cryptographic keys found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <table className="w-full table-fixed text-left border-collapse">
              <thead>
                <tr className="cardcore-table-header">
                  <th className="w-[60%] py-4 pl-3 pr-2 font-bold text-[#4B5563] sm:w-[20%] sm:pl-6 sm:pr-4">Name</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[18%]">HSM</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[20%]">Key</th>
                  <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[17%]">KCV</th>
                  <th className="w-[40%] py-4 pl-2 pr-3 font-bold text-[#4B5563] text-right sm:w-[13%] sm:px-4 sm:text-left">Status</th>
                  <th className="hidden py-4 pl-4 pr-6 font-bold text-[#4B5563] text-right lg:table-cell lg:w-[12%]">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[13px]">
                {keys.map((item, index) => (
                  <tr
                    key={item.id || item._id || `key-${index}`}
                    onClick={() => router.push(`/dashboard/keys/${item.id || item._id}`)}
                    className="cardcore-table-row hover:bg-slate-50/60 cursor-pointer transition-colors bg-white"
                  >
                    <td className="py-3 pl-3 pr-2 sm:py-4 sm:pl-6 sm:pr-4 font-semibold text-[#091D4A]">
                      <div className="truncate">{item.name}</div>
                      <div className="mt-1 font-mono text-[11px] font-normal text-gray-500 sm:hidden truncate">
                        {shortenSecret(item.key)}
                      </div>
                    </td>
                    <td className="hidden py-4 px-4 text-gray-600 sm:table-cell truncate">{item.hsmCode || item.hsm || "N/A"}</td>
                    <td className="hidden py-4 px-4 font-mono text-gray-500 sm:table-cell truncate pr-2">{shortenSecret(item.key)}</td>
                    <td className="hidden py-4 px-4 font-mono text-gray-500 sm:table-cell truncate pr-2">{shortenSecret(item.kcv)}</td>
                    <td className="py-3 pl-2 pr-3 text-right sm:py-4 sm:px-4 sm:text-left">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-[4px] tracking-wider ${
                          item.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.status || "inactive"}
                      </span>
                    </td>
                    <td className="hidden py-4 pl-4 pr-6 text-gray-500 text-right lg:table-cell whitespace-nowrap">{getFormattedDate(item.createdAt)}</td>
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

      <CreateKeyModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          getKeys(); // Refresh list after close
        }} 
      />
    </>
  );
}
