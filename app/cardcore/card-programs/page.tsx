"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { CardProgramDetails } from "./[id]/CardProgramDetails";
import type { CardProgram } from "./[id]/CardProgramDetails";
import CreateCardProgramForm from "./components/CreateCardProgramForm";
import { CardProgramService } from "@/lib/services/cardProgramService";
import { GeneralService } from "@/lib/services/generalService";
import moment from "moment";

const SCHEME_ICONS: Record<string, string> = {
  verve: "/assets/images/verve.svg",
  visa: "/assets/images/visa.svg",
  mastercard: "/assets/images/mastercard.svg",
  afrigo: "/assets/images/afrigo.svg",
};

export default function CardProgramsPage() {
  const [loadingData, setLoadingData] = useState(false);
  const [cardPrograms, setCardPrograms] = useState<any[]>([]);
  
  // State for search and filters (matching Angular)
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [scheme, setScheme] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [institution, setInstitution] = useState("");
  
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedProgram, setSelectedProgram] = useState<CardProgram | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const getCardPrograms = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await CardProgramService.getCardPrograms({
        search,
        type,
        scheme,
        startDate,
        endDate,
        institution,
        limit,
        page
      });
      
      if (!res.failed && res.data) {
        setCardPrograms(res.data);
        setTotalPages(res.pagination?.pages || 1);
        setTotal(res.pagination?.total || 0);
        setPage(res.pagination?.page || 1);
      }
    } catch (err) {
      console.error("Failed to fetch card programs:", err);
    } finally {
      setLoadingData(false);
    }
  }, [search, type, scheme, startDate, endDate, institution, limit, page]);

  useEffect(() => {
    getCardPrograms();
  }, [getCardPrograms]);

  const applyFilters = (filters: any) => {
    setInstitution(filters['Institution'] || "");
    setType(filters['Type'] || "");
    setScheme(filters['Scheme'] || "");
    
    if (filters['Date range']) {
      const { startDate: s, endDate: e } = filters['Date range'];
      setStartDate(s === '' && e !== '' ? moment().format('YYYY-MM-DD') : s);
      setEndDate(e === '' && s !== '' ? moment().format('YYYY-MM-DD') : e);
    }
    setPage(1);
  };

  const getAcronym = (name: string) => {
    return GeneralService.getAcronym(name || "");
  };

  const programFilters = [
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
    {
      title: 'Type',
      type: 'checkbox',
      values: {
        options: ['physical', 'virtual'],
        option: '',
      },
    },
    {
      title: 'Scheme',
      type: 'checkbox',
      values: {
        options: ['Mastercard', 'Visa', 'Verve', 'AfriGo'],
        option: '',
      },
    },
  ];

  return (
    <DashboardLayout>
      {selectedProgram ? (
        <CardProgramDetails
          cardProgram={selectedProgram}
          previousPage={() => {
            setSelectedProgram(null);
            getCardPrograms(); 
          }}
        />
      ) : (
        // SHOW LIST VIEW
        <div className="w-full min-w-0 flex flex-col animate-in fade-in duration-150">
        <PageHeader
            totalResults={total}
            actionLabel="Add Card Program"
            onSearchChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            onActionClick={() => setIsCreateOpen(true)}
            filters={programFilters}
            onFilterApply={applyFilters}
          />

          <div className="responsive-table rounded-sm">
            <div className="cardcore-table-header flex items-center justify-between px-3 sm:px-4">
              <div className="min-w-0 flex-1 sm:w-[35%] sm:flex-none">Institution</div>
              <div className="hidden sm:block sm:w-[30%]">Name</div>
              <div className="hidden sm:block sm:w-[20%]">Type</div>
              <div className="hidden lg:block lg:w-[20%]">Service Code</div>
              <div className="w-[86px] shrink-0 text-right sm:w-[15%]">Scheme</div>
            </div>

            <div className="divide-y divide-gray-100 min-h-[400px]">
              {loadingData ? (
                <div className="w-full h-[400px] flex items-center justify-center bg-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
                </div>
              ) : cardPrograms.length === 0 ? (
                <div className="w-full h-[400px] flex flex-col items-center justify-center text-gray-500 bg-white">
                  <p className="text-lg font-medium">No card programs found</p>
                  <p className="text-sm">Try adjusting your filters or search query</p>
                </div>
              ) : (
                cardPrograms.map((prog, index) => (
                  <div
                    key={prog.id || prog._id || `prog-${index}`}
                    onClick={() => setSelectedProgram(prog)}
                    className="cardcore-table-row flex items-center justify-between gap-3 px-3 cursor-pointer hover:bg-gray-50 transition-colors bg-white sm:px-4"
                  >
                    <div className="min-w-0 flex-1 flex items-center gap-2 sm:w-[35%] sm:flex-none sm:gap-3">
                      <div className="w-[37px] h-[37px] shrink-0 bg-[#EDEEFF] text-[14px] font-bold rounded-[4px] flex items-center justify-center">
                        {getAcronym(prog.institution?.name || "")}
                      </div>
                      <div className="min-w-0 flex flex-col">
                        <span className="text-[14px] font-medium truncate">{prog.institution?.name || "N/A"}</span>
                        <span className="text-[10px] uppercase text-gray-500 sm:hidden truncate">
                          {prog.name || "N/A"} {prog.type ? `• ${prog.type}` : ""}
                        </span>
                      </div>
                    </div>

                    <div className="w-[30%] hidden sm:block text-[14px] truncate">{prog.name}</div>
                    <div className="w-[20%] hidden sm:block text-[14px] uppercase">{prog.type}</div>
                    <div className="w-[20%] hidden lg:block text-[14px]">{prog.serviceCode}</div>

                    <div className="w-[86px] shrink-0 flex justify-end sm:w-[15%]">
                      {SCHEME_ICONS[prog.scheme?.toLowerCase()] ? (
                        <Image
                          src={SCHEME_ICONS[prog.scheme.toLowerCase()]}
                          alt={prog.scheme}
                          width={50}
                          height={50}
                          className="h-[42px] w-[50px] object-contain sm:h-[50px]"
                        />
                      ) : (
                        <span className="text-[12px] font-bold">{prog.scheme?.toUpperCase() || "N/A"}</span>
                      )}
                    </div>
                  </div>
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

          <CreateCardProgramForm
            isOpen={isCreateOpen}
            close={() => {
              setIsCreateOpen(false);
              getCardPrograms();
            }}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
