import { cloudService } from './cloudService';

// Defining TypeScript interfaces for your data makes your Next.js code much safer and gives you autocomplete
export interface ClientQueryParams {
  search?: string;
  clientId?: string;
  limit?: number;
  page?: number;
}

export const cloudCardClientService = {
  // 1. Get Dashboard Data
  getDashboardData: async () => {
    return await cloudService.get('/summary');
  },

  // 2. Get Clients (Using clean object parameters instead of a long string interpolation)
  getClients: async ({
    search = '',
    clientId = '',
    limit = 10,
    page = 1
  }: ClientQueryParams = {}) => {
    
    // Axios handles stringifying these parameters safely under the hood
    const params = {
      search,
      clientId,
      limit,
      page
    };

    return await cloudService.get('/clients', params);
  }
};