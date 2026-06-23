import { cloudService } from './cloudService';

export interface InvoiceQueryParams {
  status?: string;
  limit?: number;
  page?: number;
  fromDate?: string;
  toDate?: string;
}

export const cloudCardInvoiceService = {
  /**
   * Fetches invoices with filters
   */
  getInvoices: async ({
    status = '',
    limit = 50,
    page = 1,
    fromDate = '',
    toDate = ''
  }: InvoiceQueryParams = {}) => {
    
    // Pass as an object so Axios automatically manages key-value URL serialization safely
    const params = {
      status,
      limit,
      page,
      fromDate,
      toDate
    };

    return await cloudService.get('/invoices', params);
  }
};