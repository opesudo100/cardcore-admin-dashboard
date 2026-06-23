import { cloudService } from "./cloudService";
import { ApiResponse, Invoice } from "@/types/api";

export interface GetInvoicesParams {
  status?: string;
  limit?: number;
  page?: number;
  fromDate?: string;
  toDate?: string;
}

export const invoicesService = {
  getInvoices: (params: GetInvoicesParams = {}) => {
    const apiParams: Record<string, any> = {
      status: params.status || "",
      limit: params.limit || 50,
      page: params.page || 1,
      fromDate: params.fromDate || "",
      toDate: params.toDate || "",
    };

    return cloudService.get<ApiResponse<Invoice[]>>("/invoices", apiParams);
  },
};
