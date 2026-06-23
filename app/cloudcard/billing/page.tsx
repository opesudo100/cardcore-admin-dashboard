"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  Layers3,
  ReceiptText,
  X,
  Download,
  Mail,
} from "lucide-react";
import toast from "react-hot-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { Invoice, Pagination } from "@/types/api";
import { invoicesService } from "@/lib/services/invoices";

function formatAmount(value: number) {
  return typeof value === "number" ? value.toLocaleString() : "0";
}

function formatDate(value: string) {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BillingPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 25,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoadingData(true);
    try {
      const response = await invoicesService.getInvoices({
        status,
        limit,
        page,
        fromDate: dateFrom,
        toDate: dateTo,
      });

      if (response && !response.failed && response.data) {
        setInvoices(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      console.error("Error loading invoices:", error);
    } finally {
      setLoadingData(false);
    }
  }, [status, limit, page, dateFrom, dateTo]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    if (selectedInvoiceId) {
      const invoice = invoices.find((inv) => inv._id === selectedInvoiceId);
      setSelectedInvoice(invoice || null);
    } else {
      setSelectedInvoice(null);
    }
  }, [invoices, selectedInvoiceId]);

  // Filter by search term (client name)
  const filteredInvoices = useMemo(() => {
    if (!search) return invoices;
    const searchLower = search.toLowerCase();
    return invoices.filter((invoice) =>
      invoice.client?.name?.toLowerCase().includes(searchLower),
    );
  }, [invoices, search]);

  const handlePageChange = (updateFn: (p: number) => number) => {
    const newPage = updateFn(page);
    setPage(newPage);
  };

  const handleFilterApply = (values: any) => {
    setStatus(values.Status || "");

    if (values["Date range"]) {
      setDateFrom(values["Date range"].startDate || "");
      setDateTo(values["Date range"].endDate || "");
    } else {
      setDateFrom("");
      setDateTo("");
    }

    setPage(1);
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      // NOTE: Hook up your real service download endpoint here if available
      // e.g., await invoicesService.downloadInvoice(invoiceId);
      toast.success("Downloading invoice PDF...");
    } catch (error) {
      console.error("Failed to download invoice:", error);
      toast.error("Could not download invoice. Please try again.");
    }
  };

  const handleSendInvoiceToMail = async (invoiceId: string) => {
    try {
      // NOTE: Hook up your real service mailing endpoint here if available
      // e.g., await invoicesService.sendEmail(invoiceId);
      toast.success("Invoice sent to registered email successfully!");
    } catch (error) {
      console.error("Failed to email invoice:", error);
      toast.error("Failed to send email. Please try again.");
    }
  };

  const filtersConfig = [
    {
      title: "Status",
      type: "checkbox",
      values: {
        options: ["pending", "completed"],
      },
    },
    {
      title: "Date range",
      type: "date",
    },
  ];

  return (
    <DashboardLayout>
      <div className="relative min-w-0 pb-10">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-[22px] sm:text-[28px] font-[700] text-[#111827]">
            Billing Info
          </h1>
        </div>

        <div className="w-full">
          <div className="space-y-4">
            <div className="rounded-[18px] border border-[#E5E7EB] bg-white p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="text-[16px] font-[700] text-[#111827]">
                  Invoice workspace
                </h2>
                <p className="text-[13px] text-[#6B7280]">
                  Select an invoice to view details
                </p>
              </div>

              {/* PageHeader Component */}
              <PageHeader
                totalResults={pagination.total}
                showActionButton={false}
                onSearchChange={setSearch}
                filters={filtersConfig}
                onFilterApply={handleFilterApply}
              />

              <div className="w-full overflow-x-auto rounded-[8px] mt-4">
                {loadingData ? (
                  <div className="w-full h-[400px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
                  </div>
                ) : filteredInvoices.length === 0 ? (
                  <div className="w-full h-[400px] flex flex-col items-center justify-center text-gray-500 bg-gray-50/30">
                    <p className="text-lg font-medium">No invoices found</p>
                    <p className="text-sm">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                ) : (
                  <>
                    <table className="w-full min-w-full text-left border-collapse table-auto">
                      <thead>
                        <tr className="border-b border-gray-100 text-[13px] font-semibold bg-gray-100">
                          <th className="py-4 pl-6 pr-4 font-bold text-[#4B5563]">
                            Date
                          </th>
                          <th className="py-4 px-4 font-bold text-[#4B5563]">
                            Client
                          </th>
                          <th className="py-4 px-4 font-bold text-[#4B5563]">
                            Amount
                          </th>
                          <th className="py-4 pl-4 pr-6 font-bold text-[#4B5563] text-right">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-[14px]">
                        {filteredInvoices.map((invoice) => {
                          const isSelected = selectedInvoiceId === invoice._id;
                          return (
                            <tr
                              key={invoice._id}
                              onClick={() => setSelectedInvoiceId(invoice._id)}
                              className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${
                                isSelected ? "bg-[#F5F7FF]" : ""
                              }`}
                            >
                              <td className="py-4 pl-6 pr-4">
                                <span className="text-[13px] font-[500] text-[#111827]">
                                  {formatDate(invoice.createdAt)}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="truncate text-[13px] text-[#374151] font-medium">
                                  {invoice.client?.name || "N/A"}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-[13px] text-[#374151] font-semibold">
                                  ₦ {formatAmount(invoice.amount)}
                                </span>
                              </td>
                              <td className="py-4 pl-4 pr-6 text-right">
                                <span
                                  className={`inline-flex rounded-full px-3 py-0.5 text-[10px] font-[700] uppercase tracking-wide ${
                                    invoice.status?.toLowerCase() ===
                                    "completed"
                                      ? "bg-[#10B981] text-white"
                                      : "bg-[#F59E0B] text-white"
                                  }`}
                                >
                                  {invoice.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <TablePagination
                      page={page}
                      totalPages={pagination.totalPages}
                      totalResults={pagination.total}
                      pageLimit={limit}
                      onPageChange={handlePageChange}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DIM BACKDROP OVERLAY */}
        <div
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
            selectedInvoice
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setSelectedInvoiceId(null)}
        />

        {/* SIDE SLIDE OVERLAY PANEL */}
        <aside
          className={`fixed top-0 right-0 h-full w-full max-w-[500px] bg-white z-50 shadow-2xl transition-transform duration-300 transform border-l border-[#E5E7EB] ${
            selectedInvoice ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selectedInvoice && (
            <div className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-4 border-b border-[#EEF0F3] px-6 py-5">
                <div className="min-w-0">
                  <p className="text-[11px] font-[700] uppercase tracking-[0.2em] text-[#6B7280]">
                    Invoice detail
                  </p>
                  <h2 className="mt-2 text-[20px] font-[700] text-[#111827] truncate">
                    {selectedInvoice.client?.name}
                  </h2>
                  <p className="mt-1 text-[13px] text-[#6B7280]">
                    Issued on {formatDate(selectedInvoice.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedInvoiceId(null)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F8FAFC] text-[#6B7280] transition-colors hover:bg-[#EEF2F7] hover:text-[#111827]"
                  aria-label="Close invoice details"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">
                {/* CARD GRADIENT */}
                <div
                  className={`rounded-[16px] p-5 text-white transition-all duration-300 bg-gradient-to-br ${
                    selectedInvoice.status === "completed"
                      ? "from-[#10B981] to-[#059669]"
                      : "from-[#091D4A] to-[#142B66]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[12px] uppercase tracking-[0.18em] text-white/70">
                        Amount
                      </p>
                      <h3 className="mt-2 text-[28px] font-[700] leading-none">
                        ₦ {formatAmount(selectedInvoice.amount)}
                      </h3>
                    </div>
                    <div className="rounded-[14px] bg-white/10 p-3">
                      <CalendarDays size={20} />
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2 text-[12px] text-white/80">
                    <span className="rounded-full bg-white/20 px-3 py-1 uppercase font-semibold tracking-wide">
                      {selectedInvoice.status}
                    </span>
                    <span className="rounded-full bg-white/20 px-3 py-1 font-medium">
                      {selectedInvoice.institutionInvoice.length} institutions
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTON GRID */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {/* <button
                    type="button"
                    onClick={() => handleDownloadInvoice(selectedInvoice._id)}
                    className="flex items-center justify-center gap-2 rounded-[10px] border border-gray-200 bg-white py-2.5 px-4 text-[13px] font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer"
                  >
                    <Download size={16} className="text-gray-500" />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendInvoiceToMail(selectedInvoice._id)}
                    className="flex items-center justify-center gap-2 rounded-[10px] bg-[#09245A] py-2.5 px-4 text-[13px] font-semibold text-white shadow-sm transition-all hover:bg-[#09245A]/90 active:scale-[0.98] cursor-pointer"
                  >
                    <Mail size={16} />
                    Send to Email
                  </button> */}
                </div>

                <div className="mt-6">
                  <div className="mt-4 border border-[#EEF0F3] rounded-[12px] overflow-hidden">
                    <div className="grid grid-cols-5 gap-2 bg-[#F8FAFC] py-2.5 px-3 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider border-b border-[#EEF0F3]">
                      <span>Institution</span>
                      <span className="text-right">Hosting</span>
                      <span className="text-right">Keys</span>
                      <span className="text-right">Prov.Cost</span>
                      <span className="text-right">Prov.Count</span>
                    </div>
                    <div className="divide-y divide-[#EEF0F3] max-h-[240px] overflow-y-auto">
                      {selectedInvoice.institutionInvoice.map(
                        (institution, index) => (
                          <div
                            key={`${institution.institution.name}-${index}-overlay`}
                            className="grid grid-cols-5 gap-2 px-3 py-3 text-[11px] text-[#374151] items-center bg-white"
                          >
                            <span className="font-semibold text-[#111827] truncate">
                              {institution.institution.name}
                            </span>
                            <span className="text-right">
                              ₦{formatAmount(institution.totalHostingCost)}
                            </span>
                            <span className="text-right">
                              ₦{formatAmount(institution.totalKeyCost)}
                            </span>
                            <span className="text-right">
                              ₦{formatAmount(institution.totalProvisioningCost)}
                            </span>
                            <span className="text-right font-medium text-[#6B7280]">
                              {institution.totalProvisioningCount}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-2 border-t border-dashed border-[#00000025] pt-4 text-[13px] font-medium text-[#4B5563]">
                    <div className="flex justify-between">
                      <span>Total Hosting:</span>
                      <strong className="text-[#111827]">
                        ₦{formatAmount(selectedInvoice.totalHostingCost)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Key:</span>
                      <strong className="text-[#111827]">
                        ₦{formatAmount(selectedInvoice.totalKeyCost)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Provisioning:</span>
                      <strong className="text-[#111827]">
                        ₦{formatAmount(selectedInvoice.totalProvisioningCost)}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Provisioning Count:</span>
                      <strong className="text-[#111827]">
                        {selectedInvoice.totalProvisioningCount}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </DashboardLayout>
  );
}