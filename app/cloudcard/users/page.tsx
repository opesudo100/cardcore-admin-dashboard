"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { TablePagination } from "@/components/layout/TablePagination";
import { cloudCardUsersService } from "@/lib/services/cloudCardUsersService";
import { GeneralService } from "@/lib/services/generalService";
import toast from "react-hot-toast";
import moment from "moment";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(25);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingResend, setLoadingResend] = useState<string | null>(null);

  const filterConfig = [
    {
      title: "Date range",
      type: "date",
      values: {
        startDate: "",
        endDate: "",
      },
    },
  ];

  const getUsers = useCallback(async () => {
    setLoadingData(true);
    try {
      const res = await cloudCardUsersService.getUsers({
        search,
        clientId: "",
        startDate,
        endDate,
        limit,
        page,
      });
      console.log(res);
      setUsers(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingData(false);
    }
  }, [search, startDate, endDate, limit, page]);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const getAcronym = (name: string = "") => {
    return GeneralService.getAcronym(name);
  };

  const getFormattedDate = (date: string) => {
    return moment(date).format("lll");
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const resendInvite = async (id: string) => {
    setLoadingResend(id);
    try {
      const res = await cloudCardUsersService.resendInvite(id);
      console.log(res);
      toast.success("Invitation has been resent.");
    } catch (err) {
      toast.error("Failed to resend invitation.");
    } finally {
      setLoadingResend(null);
    }
  };

  const applyFilters = (filters: any) => {
    const newStartDate =
      filters["Date range"].startDate === "" &&
      filters["Date range"].endDate !== ""
        ? moment().format("YYYY-MM-DD")
        : filters["Date range"].startDate;

    const newEndDate =
      filters["Date range"]?.endDate === "" &&
      filters["Date range"]?.startDate !== ""
        ? moment().format("YYYY-MM-DD")
        : filters["Date range"].endDate;

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setPage(1);
  };

  const handlePageChange = (updateFn: (p: number) => number) => {
    setPage(updateFn);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col w-full pb-16">
        <PageHeader
          totalResults={total}
          actionLabel=""
          onActionClick={() => {}}
          filters={filterConfig}
          onFilterApply={applyFilters}
          onSearchChange={handleSearch}
        />

        <div className="w-full overflow-x-auto rounded-[8px]">
          {loadingData ? (
            <div className="w-full h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#09245A]"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="w-full h-[400px] flex flex-col items-center justify-center text-gray-500 bg-gray-50/30">
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <table className="w-full min-w-full text-left border-collapse table-auto">
                <thead>
                  <tr className="border-b border-gray-100 text-[13px] font-semibold bg-gray-100">
                    <th className="py-4 pl-6 pr-4 font-bold text-[#4B5563]">Name</th>
                    <th className="py-4 px-4 font-bold text-[#4B5563]">Role</th>
                    <th className="hidden sm:table-cell py-4 pl-4 pr-6 font-bold text-[#4B5563] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[14px]">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="bg-gray-200 h-[37px] w-[47px] shrink-0 flex items-center justify-center text-gray-600 font-semibold rounded-[4px]">
                            {getAcronym(user.name)}
                          </div>
                          <div className="flex min-w-0 flex-col truncate">
                            <span className="text-[14px] font-medium capitalize">{user.name}</span>
                            <div className="flex sm:flex-row flex-col gap-y-1 gap-x-3">
                              <span className="text-[11px] leading-[11px] font-[400] lowercase opacity-[0.5] truncate">
                                {user.emailAddress}
                              </span>
                              <span className="text-[11px] leading-[11px] font-[400] lowercase opacity-[0.5] truncate">
                                {user.phoneNumber}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#111827] font-medium capitalize">{user.role}</td>
                      <td className="hidden sm:table-cell py-4 pl-4 pr-6 text-center">
                        {user.emailAddressVerified ? (
                          <span className="text-[14px] font-medium text-[#374151]">Active</span>
                        ) : (
                          <button
                            onClick={() => resendInvite(user._id)}
                            className="inline-flex items-center gap-1 text-[14px] hover:bg-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
                            disabled={loadingResend === user._id}
                          >
                            <RefreshCw size={16} className={loadingResend === user._id ? "animate-spin" : ""} />
                            Resend Invite
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination
                page={page}
                totalPages={totalPages}
                totalResults={total}
                pageLimit={limit}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
