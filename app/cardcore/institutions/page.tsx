"use client";

import React, { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { CreateInstitutionModal } from "@/components/dashboard/cardcore/CreateInstitutionModal";
import { InstitutionService } from "@/lib/services/institutionService";
import { GeneralService } from "@/lib/services/generalService";
import moment from "moment";
import InstitutionDetails from "./[id]/institutiondetails";

export default function InstitutionsPage() {
  const [loadingData, setLoadingData] = useState(false);
  const [institutions, setInstitutions] = useState<any[]>([]);
  
  // State for search and filters (matching Angular)
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<any | null>(null);

  const getInstitutions = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await InstitutionService.getInstitutions({
        search,
        code,
        status,
        emailAddress,
        startDate,
        endDate,
        limit,
        page
      });
      
      if (!res.failed && res.data) {
        setInstitutions(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch institutions:", err);
    } finally {
      setLoadingData(false);
    }
  }, [search, code, status, emailAddress, startDate, endDate, limit, page]);

  useEffect(() => {
    getInstitutions();
  }, [getInstitutions]);

  const getAvatarLetters = (name: string) => {
    return GeneralService.getAcronym(name);
  };

  const getStatusStyle = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'active') return 'bg-green-100 text-green-600';
    if (s === 'pending') return 'bg-[#daa5202b] text-[goldenrod]';
    if (['deleted', 'inactive', 'blocked'].includes(s)) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  const applyFilters = (filters: any) => {
    setCode(filters['Institution Code'] || "");
    setEmailAddress(filters['Email Address'] || "");
    setStatus(filters['Status'] || "");
    
    if (filters['Date range']) {
      const { startDate: s, endDate: e } = filters['Date range'];
      setStartDate(s === '' && e !== '' ? moment().format('YYYY-MM-DD') : s);
      setEndDate(e === '' && s !== '' ? moment().format('YYYY-MM-DD') : e);
    }
    setPage(1);
  };

  return (
    <DashboardLayout>
      {selectedInstitution ? (
        <InstitutionDetails
          institution={selectedInstitution}
          onBack={() => {
            setSelectedInstitution(null);
            getInstitutions(); // Soft refresh registry from DB on back navigation
          }}
          onStatusUpdate={(updatedId, nextStatusStr) => {
            // Instantly sync status change in table row state matrix
            setInstitutions(prev => 
              prev.map(inst => 
                (inst.id === updatedId || inst._id === updatedId)
                  ? { ...inst, status: nextStatusStr }
                  : inst
              )
            );
          }}
        />
      ) : (
        <div className="w-full min-w-0 flex flex-col animate-in fade-in duration-150">
          <PageHeader
            totalResults={total}
            actionLabel="Add Institution"
            onActionClick={() => setIsModalOpen(true)}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            filters={[
              {
                title: 'Date range',
                type: 'date',
                values: { startDate: '', endDate: '' },
              },
              {
                title: 'Institution Code',
                type: 'input',
                value: '',
              },
              {
                title: 'Email Address',
                type: 'input',
                value: '',
              },
              {
                title: 'Status',
                type: 'checkbox', 
                values: {
                  options: ['active', 'pending'],
                  option: '',
                },
              },
            ]}
            onFilterApply={applyFilters}
          />

          <div className="responsive-table rounded-[8px]">
            {loadingData ? (
              <div className="w-full h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
              </div>
            ) : institutions.length === 0 ? (
              <div className="w-full h-[400px] flex flex-col items-center justify-center text-gray-500 bg-gray-50/30">
                <p className="text-lg font-medium">No institutions found</p>
                <p className="text-sm">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <table className="w-full table-fixed text-left border-collapse">
                <thead>
                  <tr className="cardcore-table-header">
                    <th className="w-[68%] py-4 pl-3 pr-2 text-left font-bold text-[#4B5563] sm:w-[45%] sm:pl-6 sm:pr-4">Name</th>
                    <th className="hidden py-4 px-4 font-bold text-[#4B5563] sm:table-cell sm:w-[20%]">Institution code</th>
                    <th className="w-[32%] py-4 pl-2 pr-3 text-right font-bold text-[#4B5563] sm:w-[15%] sm:px-4 sm:text-left">Status</th>
                    <th className="hidden py-4 pl-4 pr-6 font-bold text-[#4B5563] text-right lg:table-cell lg:w-[20%]">Created At</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100 text-[14px]">
                  {institutions.map((inst, index) => (
                    <tr
                      key={inst.id || inst._id || `inst-${index}`}
                      onClick={() => setSelectedInstitution(inst)}
                      className="cardcore-table-row hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pl-3 pr-2 sm:py-4 sm:pl-6 sm:pr-4">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div className="w-[36px] h-[36px] bg-[#E0E7FF] text-[#4338CA] text-[12px] font-bold rounded-[4px] flex items-center justify-center shrink-0">
                          {getAvatarLetters(inst.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[#111827] truncate">{inst.name}</span>
                          <span className="text-[12px] text-gray-400 font-normal truncate">
                            {inst.emailAddress || inst.email || "No email provided"}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium sm:hidden truncate">
                            Code: {inst.code || "N/A"}
                          </span>
                        </div>
                        </div>
                      </td>
                      <td className="hidden py-4 px-4 text-[#111827] font-medium sm:table-cell">{inst.code}</td>
                      <td className="py-3 pl-2 pr-3 text-right sm:py-4 sm:px-4 sm:text-left">
                        <span className={`inline-flex px-2.5 py-1 text-[11px] font-extrabold rounded-[4px] tracking-wider uppercase ${getStatusStyle(inst.status)}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td className="hidden py-4 pl-4 pr-6 text-gray-500 font-normal text-right whitespace-nowrap lg:table-cell">
                        {moment(inst.createdAt).format('lll')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <TablePagination 
            page={page} 
            totalPages={totalPages} 
            totalResults={total} 
            pageLimit={limit} 
            onPageChange={setPage} 
          />

          <CreateInstitutionModal isOpen={isModalOpen} onClose={() => {
            setIsModalOpen(false);
            getInstitutions();
          }} />
        </div>
      )}
    </DashboardLayout>
  );
}
