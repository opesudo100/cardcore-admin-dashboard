"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { InviteInstitutionModal } from "@/components/dashboard/cloudcard/InviteInstitutionModal";
import { cloudCardInstitutionsService } from "@/lib/services/cloudCardInstitutionsService";
import { GeneralService } from "@/lib/services/generalService";
import moment from "moment";

type InstitutionRow = {
  id?: string;
  _id?: string;
  name: string;
  email?: string;
  emailAddress?: string;
  phone?: string;
  phoneNumber?: string;
  type?: string;
  walletId?: string;
  createdAt?: string;
};

type InstitutionsResponse = {
  data?: InstitutionRow[];
  pagination?: {
    total?: number;
    totalPages?: number;
    pages?: number;
  };
};

export default function InstitutionsPage() {
  const router = useRouter();
  const [loadingData, setLoadingData] = useState(false);
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const getInstitutions = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await cloudCardInstitutionsService.getInstitutions({
        search,
        startDate,
        endDate,
        limit,
        page
      });
      
      const response = res as InstitutionsResponse;
      const data = Array.isArray(response.data) ? response.data : [];
      const pagination = response.pagination || {};
      setInstitutions(data);
      setTotalPages(pagination.pages || pagination.totalPages || 1);
      setTotal(pagination.total || 0);
    } catch (err) {
      console.error("Failed to fetch institutions:", err);
    } finally {
      setLoadingData(false);
    }
  }, [search, startDate, endDate, limit, page]);

  useEffect(() => {
    getInstitutions();
  }, [getInstitutions]);

  const getAvatarLetters = (name: string) => {
    return GeneralService.getAcronym(name);
  };

  const applyFilters = (filters: any) => {
    if (filters['Date range']) {
      const { startDate: s, endDate: e } = filters['Date range'];
      setStartDate(s === '' && e !== '' ? moment().format('YYYY-MM-DD') : s);
      setEndDate(e === '' && s !== '' ? moment().format('YYYY-MM-DD') : e);
    }
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="w-full flex flex-col animate-in fade-in duration-150">
        <PageHeader
          totalResults={total}
          actionLabel="Invite Institution"
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
            }
          ]}
          onFilterApply={applyFilters}
        />

        <div className="w-full overflow-x-auto rounded-[8px]">
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
            <table className="w-full min-w-full text-left border-collapse table-auto">
              <thead>
                <tr className="border-b border-gray-100 text-[13px] font-semibold bg-gray-100">
                  <th className="py-4 pl-6 pr-4 font-bold text-[#4B5563]">Name</th>
                  <th className="py-4 px-4 font-bold text-[#4B5563]">Type</th>
                  <th className="py-4 px-4 font-bold text-[#4B5563]">Wallet ID</th>
                  <th className="py-4 pl-4 pr-6 font-bold text-[#4B5563] text-right">Created At</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-[14px]">
                {institutions.map((inst, index) => {
                  const institutionId = inst.id || inst._id || `inst-${index}`;
                  return (
                    <tr
                      key={institutionId}
                      onClick={() => institutionId && router.push(`/cloudcard/institutions/${institutionId}`)}
                      className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                    >
                      <td className="py-4 pl-6 pr-4 flex items-center gap-3">
                        <div className="w-[36px] h-[36px] bg-[#E0E7FF] text-[#4338CA] text-[12px] font-bold rounded-[4px] flex items-center justify-center shrink-0">
                          {getAvatarLetters(inst.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[#111827] truncate">{inst.name}</span>
                          <span className="text-[12px] text-gray-400 font-normal truncate">
                            {inst.emailAddress || inst.email || "No email provided"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#111827] font-medium capitalize">{inst.type || "-"}</td>
                      <td className="py-4 px-4 text-[#111827] font-medium tracking-wide uppercase">{inst.walletId || "-"}</td>
                      <td className="py-4 pl-4 pr-6 text-gray-500 font-normal text-right whitespace-nowrap">
                        {moment(inst.createdAt).format('lll')}
                      </td>
                    </tr>
                  );
                })}
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

        <InviteInstitutionModal isOpen={isModalOpen} onClose={() => {
          setIsModalOpen(false);
          getInstitutions();
        }} onSuccess={() => {
          setPage(1);
          getInstitutions();
        }} />
      </div>
    </DashboardLayout>
  );
}
